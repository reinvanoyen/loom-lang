import { Token, TokenStream, TokenType } from '../types/tokenization';
import AstNode from './AstNode';
import Node from './Node';
import { Nullable } from '../types/nullable';
import DiagnosticReporter from '../analyzer/DiagnosticReporter';

export default class Parser {

    /**
     * The current id
     * @private
     */
    private currentId: number = 0;

    /**
     * The current position of the cursor
     * @private
     */
    private cursor: number = 0;

    /**
     * The TokenStream currently being parsed (input)
     * @private
     */
    private tokens: TokenStream;

    /**
     * The Abstract Syntax Tree (AST) currently being build (output)
     * @private
     */
    private ast: AstNode = new AstNode();

    /**
     * The current scope, which is the Node in which we're currently parser
     * @private
     */
    private scope: Node = this.ast;

    /**
     * @private
     */
    private reporter: DiagnosticReporter;

    /**
     * @param reporter
     */
    constructor(reporter: DiagnosticReporter) {
        this.reporter = reporter;
    }

    /**
     * Parse a TokenStream into an Abstract Syntax Tree (AST)
     * @param tokens
     */
    public parse(tokens: TokenStream): AstNode {

        this.setTokenStream(tokens);
        this.parseAll();

        return this.ast;
    }

    /**
     * Set the TokenStream
     * @param tokens
     */
    public setTokenStream(tokens: TokenStream) {
        this.tokens = tokens;
    }

    /**
     * Parse all tokens in the TokenStream, starting from the cursor position
     */
    private parseAll() {

        if (! this.tokens.length) {
            return;
        }

        if (this.cursor > (this.tokens.length-1)) {
            return;
        }

        if (AstNode.parse(this)) {
            this.parseAll();
        }
    }

    /**
     * Get the Token at the cursor position
     */
    public getCurrentToken(): Token {
        return this.tokens[this.cursor];
    }

    /**
     * Get the Token at the offset of the cursor position
     * @param offset
     */
    private getOffsetToken(offset: number): Token {
        return this.tokens[this.cursor + offset];
    }

    /**
     * Set a value as attribute to the current scope Node
     * If no explicit value was given, the last inserted Node will be used as value
     * @param name
     * @param value
     */
    public setAttribute(name: string, value: Nullable<string | Node> = null) {
        if (value === null) {
            value = this.getLastNode();
            this.getScope().removeLastChild();
        }
        this.getScope().setAttribute(name, value);
    }

    /**
     * Get the value of the current token
     */
    public getCurrentValue(): string {
        return this.getCurrentToken().value;
    }

    /**
     * Advance the cursor position by a certain offset
     * @param offset
     */
    public advance(offset: number = 1) {
        this.cursor = this.cursor + offset;
    }

    /**
     * Accept a token of the given type at this cursor position
     * @param type
     */
    public accept(type: TokenType): boolean {
        const token = this.getCurrentToken();
        return (token && token.type === type);
    }

    /**
     * Accept a token of the given type and with given value at this cursor position
     * @param type
     * @param value
     */
    public acceptWithValue(type: TokenType, value: string): boolean {
        const token = this.getCurrentToken();
        return (
            token &&
            token.type === type &&
            token.value === value
        );
    }

    /**
     * Accept a token of the given type at the given offset of this cursor position
     * @param type
     * @param offset
     */
    public acceptAt(type: TokenType, offset: number): boolean {
        const token = this.getOffsetToken(offset);
        return (token && token.type === type);
    }

    /**
     * Accept a token of the given type and with given value at the given offset of this cursor position
     * @param type
     * @param offset
     * @param value
     */
    public acceptAtWithValue(type: TokenType, offset: number, value: string): boolean {
        const token = this.getOffsetToken(offset);
        return (
            token &&
            token.type === type &&
            token.value === value
        );
    }

    /**
     * @param types
     */
    public acceptOneOf(types: TokenType[]): boolean {
        const token = this.getCurrentToken();
        return (token && types.includes(token.type));
    }

    /**
     * Skip a token of the given type at this cursor position
     * @param type
     */
    public skip(type: TokenType): boolean {
        if (this.accept(type)) {
            this.advance();
            return true;
        }
        return false;
    }

    /**
     * Skip the token at this cursor position if it's of the given type and has the given value
     * @param type
     * @param value
     */
    public skipWithValue(type: TokenType, value: string): boolean {
        if (this.acceptWithValue(type, value)) {
            this.advance();
            return true;
        }
        return false;
    }

    /**
     * Expect a token of the given type at this cursor position
     * @param type
     */
    public expect(type: TokenType): boolean {
        if (this.accept(type)) {
            return true;
        }

        this.reporter.report({
            severity: 'error',
            message: `Expected ${type}, got ${this.getCurrentToken().type}`
        });
        this.advance();
        return false;
    }

    /**
     * Expect a token of the given type with give value at this cursor position
     * @param type
     * @param value
     */
    public expectWithValue(type: TokenType, value: string): boolean {
        if (this.acceptWithValue(type, value)) {
            return true;
        }

        this.reporter.report({
            severity: 'error',
            message: `Unexpected token, expected ${type} with value ${value} got ${this.getCurrentToken().type} ${this.getCurrentToken().value}`
        });
        this.advance();
        return false;
    }

    /**
     *
     * @param types
     */
    public expectOneOf(types: TokenType[]): boolean {
        if (this.acceptOneOf(types)) {
            return true;
        }

        this.reporter.report({
            severity: 'error',
            message: `Unexpected token, expected one of: ${types.join(', ')}`
        });
        this.advance();
        return false;
    }

    /**
     * Point the scope to the last inserted Node
     */
    public in() {
        this.setScope(this.getLastNode());
    }

    /**
     * Point the scope to the parent of the current scope
     */
    public out() {
        this.setScope(this.getScope().getParent());
    }

    /**
     * Alias of in()
     */
    public traverseUp() {
        this.in();
    }

    /**
     * Alias of out()
     */
    public traverseDown() {
        this.out();
    }

    /**
     * Get the current scope Node
     */
    public getScope(): Node {
        return this.scope;
    }

    /**
     * Get the last inserted Node
     */
    public getLastNode(): Node {
        return this.scope.getChildren()[this.scope.getChildren().length-1];
    }

    /**
     * Insert a Node into the current scope
     * @param node
     */
    public insert(node: Node) {
        this.assignNewId(node);
        node.setParent(this.scope);
        this.scope.addChild(node);
    }

    /**
     * @param node
     * @private
     */
    private assignNewId(node: Node) {
        this.currentId++;
        node.setId(this.currentId);

    }

    /**
     * Set the current scope
     * @param node
     */
    private setScope(node: Node) {
        this.scope = node;
    }

    /**
     * Wrap the last inserted Node with another Node, the scope will be the wrapping Node
     * @param node
     */
    public wrap(node: Node) {
        const last = this.getLastNode();
        this.getScope().removeLastChild();

        this.insert(node);
        this.traverseUp();

        this.insert(last);
    }

    /**
     * Get the built Abstract Syntax Tree (AST)
     */
    public getAst(): AstNode {
        return this.ast;
    }
}