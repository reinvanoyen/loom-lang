import { Token, TokenType } from '../types/tokenization';
import AST from './AST';
import { Nullable } from '../types/nullable';
import Reporter, { MessageCode } from '../diagnostics/Reporter';
import EventBus from '../../core/bus/EventBus';
import { TEventMap } from '../types/bus';
import TokenStream, { SyncToken } from '../tokenization/TokenStream';
import ASTBuilder from './ASTBuilder';
import Namespace from '@/compiler/parser/nodes/Namespace';
import ImportStatement from '@/compiler/parser/nodes/ImportStatement';
import Type from '@/compiler/parser/nodes/Type';
import TypeDeclaration from '@/compiler/parser/nodes/TypeDeclaration';
import VariantDeclaration from '@/compiler/parser/nodes/VariantDeclaration';
import SlotDeclaration from '@/compiler/parser/nodes/SlotDeclaration';
import StyleBlock from '@/compiler/parser/nodes/StyleBlock';
import Class from '@/compiler/parser/nodes/Class';
import IdentifierType from '@/compiler/parser/nodes/IdentifierType';
import StringType from '@/compiler/parser/nodes/StringType';
import Node from '@/compiler/parser/Node';
import ClassAugmentation from '@/compiler/parser/nodes/ClassAugmentation';

enum RecoveryContext {
    TOP_LEVEL,
    CLASS_MEMBER
}

export default class Parser {

    private readonly TOP_LEVEL_START_TOKENS: SyncToken[] = [
        { type: TokenType.IDENT, value: 'namespace' },
        { type: TokenType.IDENT, value: 'import' },
        { type: TokenType.IDENT, value: 'type' },
        { type: TokenType.IDENT, value: 'class' },
    ];

    private readonly CLASS_MEMBER_RESTART: SyncToken[] = [
        { type: TokenType.SYMBOL, value: '@' }, // variant starts
        { type: TokenType.IDENT, value: 'slot' }, // slot starts
        { type: TokenType.RAW_BLOCK }, // style block
        { type: TokenType.SYMBOL, value: '}' },
    ];

    private readonly CLASS_HEADER_RESTART: SyncToken[] = [
        { type: TokenType.SYMBOL, value: '{' },
        { type: TokenType.SYMBOL, value: '}' },
        ...this.TOP_LEVEL_START_TOKENS,
    ];

    private readonly CLASS_MEMBER_STATEMENT_RESTART: SyncToken[] = [
        { type: TokenType.SYMBOL, value: ';' },
        ...this.CLASS_MEMBER_RESTART,
    ];

    /**
     * @private
     */
    private readonly tokenStream: TokenStream;

    /**
     * @private
     */
    private builder: ASTBuilder;

    /**
     * @private
     */
    private events: EventBus<TEventMap>;

    /**
     * @private
     */
    private reporter: Reporter;

    /**
     * @private
     */
    private lastErrorIndex: number | null = null;

    /**
     * @param tokenStream
     * @param builder
     * @param events
     * @param reporter
     */
    constructor(tokenStream: TokenStream, builder: ASTBuilder, events: EventBus<TEventMap>, reporter: Reporter) {
        this.tokenStream = tokenStream;
        this.builder = builder;
        this.events = events;
        this.reporter = reporter;
    }

    /**
     * Parse the TokenStream into an Abstract Syntax Tree (AST)
     */
    public parse(): AST {
        this.events.emit('startParsing', { tokenStream: this.tokenStream });
        this.parseAll();
        this.events.emit('endParsing', { tokenStream: this.tokenStream });

        return this.builder.getAst();
    }

    /**
     * Parse all tokens in the TokenStream, starting from the cursor position
     */
    private parseAll() {
        while (!this.tokenStream.isEOF()) {
            const before = this.tokenStream.getCursor();

            this.parseTopLevelDeclaration();

            // If cursor didn't move, report & sync
            if (this.tokenStream.getCursor() === before) {
                const tok = this.tokenStream.peek();

                if (tok) {
                    this.reportError(MessageCode.E_UNEXPECTED_TOKEN, `Unexpected token '${tok?.value ?? '<eof>'}'`);
                }

                // Skip until we can plausibly start again
                this.recoverTopLevelStatement();

                // hard progress guarantee (sync might stop on current token)
                if (this.tokenStream.getCursor() === before) {
                    this.tokenStream.advance();
                }
            }
        }
    }

    /**
     *
     */
    private parseTopLevelDeclaration() {
        const token = this.peek();

        if (! token || token.type !== TokenType.IDENT) {
            return false;
        }
        
        switch (token.value) {
            case 'namespace': return this.parseNamespaceStatement();
            case 'import': return this.parseImportStatement();
            case 'type': return this.parseTypeDeclaration();
            case 'class': return this.parseClassDeclaration();
            case 'augment': return this.parseClassAugmentation();
            default: return false;
        }
    }

    /**
     * @private
     */
    private parseClassDeclaration() {
        if (!this.eat(TokenType.IDENT, 'class')) {
            return false;
        }

        const className = this.expectOrRecoverToRestart(
            'class name',
            { type: TokenType.IDENT },
            this.CLASS_HEADER_RESTART
        );

        if (!className) {
            return true;
        }

        this.buildNode(new Class(className.value), () => {
            // optional: extends Parent
            if (this.eat(TokenType.IDENT, 'extends')) {
                const parentClassName = this.expectOrRecoverToRestart(
                    'parent class name',
                    { type: TokenType.IDENT },
                    this.CLASS_HEADER_RESTART
                );

                if (!parentClassName) {
                    return; // buildNode will safely up()
                }

                this.builder.setAttribute('parent', parentClassName.value);
            }

            // class body open
            const open = this.expectOrRecoverToRestart(
                'opening curly brace',
                { type: TokenType.SYMBOL, value: '{' },
                this.CLASS_HEADER_RESTART
            );

            if (!open) {
                return; // withNode will safely up()
            }

            // members
            while (!this.tokenStream.isEOF() && !this.peekIs(TokenType.SYMBOL, '}')) {
                const before = this.tokenStream.getCursor();

                if (
                    this.parseVariantDeclaration() ||
                    this.parseSlotDeclaration() ||
                    this.parseStyleBlock()
                ) {
                    continue;
                }

                // no member matched => error + sync within class
                this.reportError(
                    MessageCode.E_UNEXPECTED_TOKEN,
                    `Unexpected token '${this.tokenStream.peek()?.value}' in class body`
                );

                this.recoverToRestart(this.CLASS_MEMBER_STATEMENT_RESTART);

                if (this.peekIs(TokenType.SYMBOL, ';')) {
                    this.tokenStream.advance();
                    continue; // re-dispatch cleanly
                }

                // if still no progress, force advance 1 to avoid infinite loops
                if (this.tokenStream.getCursor() === before) {
                    this.tokenStream.advance();
                }
            }

            // class body close
            const close = this.consume('closing curly brace', TokenType.SYMBOL, '}');
            if (!close) {
                this.reportError(MessageCode.E_UNEXPECTED_TOKEN, "Missing '}'");
                this.recoverToRestart([{ type: TokenType.SYMBOL, value: '}' }, ...this.CLASS_HEADER_RESTART]);
                if (this.peekIs(TokenType.SYMBOL, '}')) {
                    this.tokenStream.advance();
                }
            }
        });

        return true;
    }

    /**
     * @private
     */
    private parseClassAugmentation() {
        if (!this.eat(TokenType.IDENT, 'augment')) {
            return false;
        }

        const identifier = this.expectOrRecoverToRestart(
            'class identifier',
            { type: TokenType.IDENT, value: 'class' },
            this.CLASS_HEADER_RESTART
        );

        if (!identifier) {
            return true;
        }

        const className = this.expectOrRecoverToRestart(
            'class name',
            { type: TokenType.IDENT },
            this.CLASS_HEADER_RESTART
        );

        if (!className) {
            return true;
        }

        this.buildNode(new ClassAugmentation(className.value), () => {

            // class body open
            const open = this.expectOrRecoverToRestart(
                'opening curly brace',
                { type: TokenType.SYMBOL, value: '{' },
                this.CLASS_HEADER_RESTART
            );

            if (!open) {
                return; // withNode will safely up()
            }

            // Parse augment body

            // class body close
            const close = this.consume('closing curly brace', TokenType.SYMBOL, '}');
            if (!close) {
                this.reportError(MessageCode.E_UNEXPECTED_TOKEN, "Missing '}'");
                this.recoverToRestart([{ type: TokenType.SYMBOL, value: '}' }, ...this.CLASS_HEADER_RESTART]);
                if (this.peekIs(TokenType.SYMBOL, '}')) {
                    this.tokenStream.advance();
                }
            }
        });

        return true;
    }

    private parseStyleBlock() {

        const contents = this.eat(TokenType.RAW_BLOCK);

        if (contents) {
            this.buildNode(new StyleBlock(), () => {
                this.builder.setAttribute('contents', contents.value);
            });
            return true;
        }

        return false;
    }

    private parseSlotDeclaration() {
        if (this.eat(TokenType.IDENT,'slot')) {

            const name = this.expectOrRecoverStatement(
                RecoveryContext.CLASS_MEMBER,
                'slot name',
                { type: TokenType.IDENT }
            );

            if (name) {
                this.insertNode(new SlotDeclaration(name.value))
            }

            this.finishStatement(RecoveryContext.CLASS_MEMBER);
            return true;
        }

        return false;
    }

    private parseVariantDeclaration() {

        if (this.eat(TokenType.SYMBOL,'@')) {

            const name = this.expectOrRecoverStatement(
                RecoveryContext.CLASS_MEMBER,
                'variant name',
                { type: TokenType.IDENT }
            );

            if (name) {
                this.buildNode(new VariantDeclaration(name.value), () => {
                    this.consume('colon', TokenType.SYMBOL, ':');

                    if (this.parseType(RecoveryContext.CLASS_MEMBER)) {
                        this.builder.setAttributeFromLastChild('type');
                    }

                    if (this.eat(TokenType.SYMBOL, '=')) {
                        const defaultValue = this.expectOrRecoverStatement(
                            RecoveryContext.CLASS_MEMBER,
                            'default value',
                            { type: TokenType.STRING }
                        );

                        if (defaultValue) {
                            this.builder.setAttribute('default', defaultValue.value);
                        }
                    }

                    this.finishStatement(RecoveryContext.CLASS_MEMBER);
                });
            }

            return true;
        }

        return false;
    }

    private parseNamespaceStatement() {
        if (this.eat(TokenType.IDENT, 'namespace')) {

            const namespace = this.expectOrRecoverStatement(
                RecoveryContext.TOP_LEVEL,
                'namespace',
                { type: TokenType.IDENT }
            );

            if (namespace) {
                this.insertNode(new Namespace(namespace.value));
            }

            this.finishStatement(RecoveryContext.TOP_LEVEL);
            return true;
        }

        return false;
    }

    /**
     * Parse import statements - import 'path';
     * @private
     */
    private parseImportStatement() {
        if (this.eat(TokenType.IDENT, 'import')) {

            const path = this.expectOrRecoverStatement(
                RecoveryContext.TOP_LEVEL,
                'import path',
                { type: TokenType.STRING }
            );

            if (path) {
                this.insertNode(new ImportStatement(path.value));
            }

            this.finishStatement(RecoveryContext.TOP_LEVEL);
            return true;
        }

        return false;
    }

    /**
     * @private
     */
    private parseTypeDeclaration() {
        if (this.eat(TokenType.IDENT, 'type')) {

            const typeName = this.expectOrRecoverStatement(
                RecoveryContext.TOP_LEVEL,
                'type name',
                { type: TokenType.IDENT }
            );

            if (typeName) {
                this.buildNode(new TypeDeclaration(typeName.value), () => {
                    this.consume('=', TokenType.SYMBOL, '=');
                    this.parseType(RecoveryContext.TOP_LEVEL);
                });
            }

            this.finishStatement(RecoveryContext.TOP_LEVEL);
            return true;
        }

        return false;
    }

    private parseType(ctx: RecoveryContext) {
        if (this.peekIsOneOf([TokenType.IDENT, TokenType.STRING])) {
            this.buildNode(new Type(), () => {
                this.parseUnionType();
            });
            return true;
        }

        const tok = this.peek();
        if (tok) {
            this.reportError(
                MessageCode.E_UNEXPECTED_TOKEN,
                `Unexpected token '${tok.value ?? '<eof>'}' in type`
            );
        }

        if (ctx === RecoveryContext.TOP_LEVEL) {
            this.recoverTopLevelStatement();
        }

        if (ctx === RecoveryContext.CLASS_MEMBER) {
            this.recoverClassMemberStatement();
        }

        return false;
    }

    private parseTypeValue() {

        const ident = this.eat(TokenType.IDENT);

        if (ident) {
            this.insertNode(new IdentifierType(ident.value))
            return true;
        }

        const string = this.eat(TokenType.STRING);

        if (string) {
            this.insertNode(new StringType(string.value))
            return true;
        }

        return false;
    }

    private parseUnionType() {
        if (!this.parseTypeValue()) {
            return false;
        }

        while (this.eat(TokenType.SYMBOL, '|')) {
            if (!this.parseTypeValue()) {
                this.reportError(MessageCode.E_UNEXPECTED_TOKEN, "Expected type after '|'");
                this.recoverTypeBoundary();
                break;
            }
        }
        return true;
    }

    /**
     * @param node
     * @param fn
     * @private
     */
    private buildNode<T>(node: Node, fn: () => T): T {
        this.builder.insert(node);
        this.builder.down();
        try {
            return fn();
        } finally {
            this.builder.up();
        }
    }

    /**
     * @param node
     * @private
     */
    private insertNode(node: Node) {
        this.builder.insert(node);
    }

    /**
     * If matches → advance and return token
     * If not → return null
     * No error.
     * @param type
     * @param value
     */
    private eat(type: TokenType, value?: string): Nullable<Token> {
        const tok = this.peek();
        if (!tok) return null;

        if (tok.type === type && (value === undefined || tok.value === value)) {
            this.tokenStream.advance();
            return tok;
        }

        return null;
    }

    /**
     * If matches → advance and return token
     * If not → report error
     * @param label
     * @param type
     * @param value
     */
    private consume(label: string, type: TokenType, value?: string): Nullable<Token> {
        const tok = this.peek();

        if (tok && tok.type === type && (value === undefined || tok.value === value)) {
            this.tokenStream.advance();
            return tok;
        }

        if (tok) {
            this.reportError(
                MessageCode.E_UNEXPECTED_TOKEN,
                `Expected ${type}${value ? ` '${value}'` : ''} (${label}), got ${tok.type} '${tok.value ?? ''}'`
            );
        }

        return null; // caller decides how to recover
    }

    /**
     * @param label
     * @param token
     * @param syncSet
     * @private
     */
    private expectOrRecoverToRestart(label: string, token: { type: TokenType, value?: string }, syncSet: SyncToken[]): Nullable<Token> {
        const tok = this.consume(label, token.type, token.value);
        if (tok) {
            return tok;
        }

        // recover to next member boundary
        this.recoverToRestart(syncSet);
        return null;
    }

    private expectOrRecoverStatement(ctx: RecoveryContext, label: string, token: { type: TokenType, value?: string }) {
        const t = this.consume(label, token.type, token.value);
        if (t) {
            return t;
        }

        if (ctx === RecoveryContext.TOP_LEVEL) {
            this.recoverTopLevelStatement();
        }

        if (ctx === RecoveryContext.CLASS_MEMBER) {
            this.recoverClassMemberStatement();
        }
        return null;
    }

    /**
     * @param ctx
     * @private
     */
    private finishStatement(ctx: RecoveryContext) {

        if (this.eat(TokenType.SYMBOL, ';')) {
            // All is fine
            return;
        }

        this.reportError(MessageCode.E_UNEXPECTED_TOKEN, 'Missing semicolon \';\' at end of statement');

        if (ctx === RecoveryContext.TOP_LEVEL) {
            this.recoverTopLevelStatement();
            return;
        }

        if (ctx === RecoveryContext.CLASS_MEMBER) {
            this.recoverClassMemberStatement();
            return;
        }
    }

    /**
     * @param syncSet
     * @private
     */
    private recoverToRestart(syncSet: SyncToken[]) {
        this.tokenStream.syncTo(syncSet, {
            consumeStopper: false
        });
    }

    /**
     * @private
     */
    private recoverTopLevelStatement() {
        this.recoverToRestart([
            { type: TokenType.SYMBOL, value: ';' },
            ...this.TOP_LEVEL_START_TOKENS,
        ]);

        if (this.peekIs(TokenType.SYMBOL, ';')) {
            this.tokenStream.advance();
        }
    }

    /**
     * @private
     */
    private recoverClassMemberStatement() {
        this.recoverToRestart([
            { type: TokenType.SYMBOL, value: ';' },
            ...this.CLASS_MEMBER_RESTART,
        ]);

        if (this.peekIs(TokenType.SYMBOL, ';')) {
            this.tokenStream.advance();
        }
    }

    /**
     * @private
     */
    private recoverTypeBoundary() {
        this.recoverToRestart([
            { type: TokenType.SYMBOL, value: '|' },
            { type: TokenType.SYMBOL, value: ';' },
            ...this.CLASS_MEMBER_RESTART,
            ...this.TOP_LEVEL_START_TOKENS,
        ]);

        if (this.peekIs(TokenType.SYMBOL, '|')) {
            this.tokenStream.advance();
        }
    }

    /**
     * @param type
     * @param value
     * @private
     */
    private peekIs(type: TokenType, value: string) {
        const tok = this.peek();
        if (!tok) {
            return false;
        }

        return tok.type === type && tok.value === value;
    }

    /**
     * Look at token. Don’t move.
     * @param offset
     */
    private peek(offset = 0): Nullable<Token> {
        return this.tokenStream.peek(offset);
    }

    /**
     * @param types
     */
    private peekIsOneOf(types: TokenType[]): boolean {
        const token = this.tokenStream.peek();
        if (!token) {
            return false;
        }
        return types.includes(token.type);
    }

    /**
     * @param code
     * @param message
     * @private
     */
    private reportError(code: MessageCode, message: string) {
        const token = this.peek();

        if (!token ||
            (
                this.lastErrorIndex !== null &&
                this.lastErrorIndex === token.startPosition.index
            )
        ) {
            // Don't report the error
            return;
        }

        this.reporter.error({
            message,
            code,
            span: { start: token.startPosition, end: token.endPosition }
        });

        this.lastErrorIndex = token.startPosition.index;
    }
}