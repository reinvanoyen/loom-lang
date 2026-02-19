import { Token, TokenType } from '../types/tokenization';
import AST from './AST';
import { Nullable } from '../types/nullable';
import Reporter from '../diagnostics/Reporter';
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

export default class Parser {

    private readonly TOP_LEVEL_SYNC: SyncToken[] = [
        { type: TokenType.IDENT, value: 'namespace' },
        { type: TokenType.IDENT, value: 'import' },
        { type: TokenType.IDENT, value: 'type' },
        { type: TokenType.IDENT, value: 'class' },
        { type: TokenType.SYMBOL, value: ';' },
        { type: TokenType.SYMBOL, value: '}' },
    ];

    private readonly CLASS_MEMBER_SYNC: SyncToken[] = [
        { type: TokenType.SYMBOL, value: ';' },
        { type: TokenType.SYMBOL, value: '}' },
        { type: TokenType.SYMBOL, value: '@' }, // variant starts
        { type: TokenType.IDENT, value: 'slot' }, // slot starts
        { type: TokenType.RAW_BLOCK }, // style block
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
        while (! this.tokenStream.isEOF()) {
            const before = this.tokenStream.getCursor();

            while (
                this.parseNamespaceStatement() ||
                this.parseImportStatement() ||
                this.parseTypeDeclaration() ||
                this.parseClass()
            );

            // If cursor didn't move, report & sync
            if (this.tokenStream.getCursor() === before) {
                const tok = this.tokenStream.peek();

                if (tok) {
                    this.reporter.error({
                        message: `Unexpected token '${tok?.value ?? '<eof>'}'`,
                        span: {
                            start: tok.startPosition,
                            end: tok.endPosition,
                        }
                    });
                }

                // Skip until we can plausibly start again
                this.tokenStream.syncTo(this.TOP_LEVEL_SYNC);

                // If we stopped on ';' consume it so we don’t stall on it
                this.eat(TokenType.SYMBOL, ';');
            }
        }
    }

    /**
     * @private
     */
    private parseClass() {

        if (this.eat(TokenType.IDENT, 'class')) {

            const className = this.consume('class name', TokenType.IDENT);

            if (! className) {
                // todo (sync?)
                return true;
            }

            this.builder.insert(new Class(className.value));
            this.builder.down();

            if (this.eat(TokenType.IDENT, 'extends')) {
                const parentClassName = this.consume('parent class name', TokenType.IDENT);

                if (parentClassName) {
                    this.builder.setAttribute('parent', parentClassName.value);
                }
            }

            const open = this.consume('opening curly brace', TokenType.SYMBOL, '{');

            if (! open) {
                // todo
            }

            // Parse class body
            while(
                this.parseVariantDeclaration() ||
                this.parseSlotDeclaration() ||
                this.parseStyleBlock()
            );

            this.consume('closing curly brace', TokenType.SYMBOL, '}');
            this.builder.up();

            return true;
        }

        return false;
    }

    private parseStyleBlock() {

        const contents = this.eat(TokenType.RAW_BLOCK);

        if (contents) {
            this.builder.insert(new StyleBlock());
            this.builder.down();
            this.builder.setAttribute('contents', contents.value);
            this.builder.up();
            return true;
        }

        return false;
    }

    private parseSlotDeclaration() {
        if (this.eat(TokenType.IDENT,'slot')) {

            const name = this.consume('slot name', TokenType.IDENT);

            if (name) {
                this.builder.insert(new SlotDeclaration(name.value));
            }

            this.consume('EOL semicolon', TokenType.SYMBOL, ';');

            return true;
        }

        return false;
    }

    private parseVariantDeclaration() {

        if (this.eat(TokenType.SYMBOL,'@')) {

            const name = this.consume('variant name', TokenType.IDENT);

            if (name) {
                this.builder.insert(new VariantDeclaration(name.value));
                this.builder.down();

                this.consume(':', TokenType.SYMBOL, ':');

                if (this.parseType()) {
                    this.builder.setAttributeFromLastChild('type');
                } else {
                    // todo
                }

                // Parse default value
                if (this.eat(TokenType.SYMBOL, '=')) {

                    const defaultValue = this.consume('default value', TokenType.STRING);

                    if (defaultValue) {
                        this.builder.setAttribute('default', defaultValue.value);
                    }
                }

                this.builder.up();
                this.consume('EOL semicolon', TokenType.SYMBOL, ';');
            }

            return true;
        }

        return false;
    }

    private parseNamespaceStatement() {
        if (this.eat(TokenType.IDENT, 'namespace')) {
            const namespace = this.consume('namespace', TokenType.IDENT);

            if (namespace) {
                this.builder.insert(new Namespace(namespace.value));
            }

            this.consume('EOL semicolon', TokenType.SYMBOL, ';');
            return true;
        }

        return false;
    }

    private parseImportStatement() {
        if (this.eat(TokenType.IDENT, 'import')) {

            const path = this.consume('import path', TokenType.STRING);

            if (path) {
                this.builder.insert(new ImportStatement(path.value));
            }

            this.consume('EOL semicolon', TokenType.SYMBOL, ';');
            return true;
        }

        return false;
    }

    /**
     * @private
     */
    private parseTypeDeclaration() {
        if (this.eat(TokenType.IDENT, 'type')) {

            const typeName = this.consume('type name', TokenType.IDENT);

            if (typeName) {
                this.builder.insert(new TypeDeclaration(typeName.value));
                this.builder.down();
                this.consume('=', TokenType.SYMBOL, '=');
                this.parseType();
                this.builder.up();
                this.consume('EOL semicolon', TokenType.SYMBOL, ';');
            }
            
            return true;
        }

        return false;
    }

    private parseType() {
        if (this.expectOneOf([TokenType.IDENT, TokenType.STRING])) {
            this.builder.insert(new Type());
            this.builder.down();
            this.parseUnionType();
            this.builder.up();
            return true;
        }

        return false;
    }

    private parseTypeValue() {

        const ident = this.eat(TokenType.IDENT);

        if (ident) {
            this.builder.insert(new IdentifierType(ident.value))
            return true;
        }

        const string = this.eat(TokenType.STRING);

        if (string) {
            this.builder.insert(new StringType(string.value))
            return true;
        }

        return false;
    }

    private parseUnionType() {
        if (this.parseTypeValue()) {
            if (this.eat(TokenType.SYMBOL, '|')) {
                this.parseUnionType();
            }
            return true;
        }

        return false;
    }

    /**
     * Look at token. Don’t move.
     * @param offset
     */
    peek(offset = 0): Nullable<Token> {
        return this.tokenStream.peek(offset);
    }

    /**
     * If matches → advance and return token
     * If not → return null
     * No error.
     * @param type
     * @param value
     */
    eat(type: TokenType, value?: string): Nullable<Token> {
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
     * If not → report error (using ctx for message)
     * @param ctx
     * @param type
     * @param value
     */
    consume(ctx: string, type: TokenType, value?: string): Nullable<Token> {
        const tok = this.peek();

        if (tok && tok.type === type && (value === undefined || tok.value === value)) {
            this.tokenStream.advance();
            return tok;
        }

        if (tok) {
            this.reporter.error({
                message: `Expected ${ctx}, got ${tok.type}`,
                span: {
                    start: tok.startPosition,
                    end: tok.endPosition,
                }
            });
        }

        return null; // caller decides how to recover
    }

    /**
     *
     * @param types
     */
    public expectOneOf(types: TokenType[]): boolean {
        const token = this.tokenStream.peek();
        if (! token) {
            return false;
        }

        if (token && types.includes(token.type)) {
            return true;
        }

        if (token) {
            this.reporter.error({
                message: `Unexpected token, expected one of: ${types.join(', ')}`,
                span: {
                    start: token.startPosition,
                    end: token.endPosition,
                }
            });
        }
        // todo ??
        return false;
    }
}