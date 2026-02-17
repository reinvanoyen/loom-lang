import grammar from './grammar';
import { LexMode, Position, TokenType } from '../types/tokenization';
import EventBus from '../bus/EventBus';
import { TEventMap } from '../types/bus';
import Reporter from '../diagnostics/Reporter';
import TokenStream from './TokenStream';

/**
 * Notes: span includes delimiters, token value excludes them
 */
export default class Lexer {
    /**
     * The source code to tokenize
     * @private
     */
    private source: string = '';

    /**
     * The current mode of lexing
     * @private
     */
    private mode: LexMode = LexMode.ALL;

    /**
     * The current position
     * @private
     */
    private position: Position = { index: 0, line: 1, column: 1 };

    /**
     * The position at which we started lexing in a new mode
     * @private
     */
    private modeStartPosition: Position =  { index: 0, line: 1, column: 1 };

    /**
     * The index of the last character, also the amount of characters
     * @private
     */
    private end: number = 0;

    /**
     * The current token stream being created
     * @private
     */
    private tokens: TokenStream;

    /**
     * The current value being lexed
     * @private
     */
    private value: string = '';

    /**
     * The current delimiter (e.g. string delimiter or boundary)
     * @private
     */
    private delimiter: string = ''

    /**
     * @private
     */
    private events: EventBus<TEventMap>;

    /**
     * @private
     */
    private reporter: Reporter;

    /**
     * @param events
     * @param reporter
     */
    constructor(events: EventBus<TEventMap>, reporter: Reporter) {
        this.events = events;
        this.reporter = reporter;
        this.tokens = new TokenStream();
    }

    /**
     * @private
     */
    private reset() {
        this.mode = LexMode.ALL;
        this.position = { index: 0, line: 1, column: 1 };
        this.modeStartPosition = { index: 0, line: 1, column: 1 };
        this.tokens = new TokenStream();
        this.value = '';
        this.delimiter = '';
    }

    /**
     * Transforms code into a TokenStream
     * @param text
     */
    public tokenize(text: string): TokenStream {

        this.reset();

        this.source = text;
        this.end = this.source.length;

        this.events.emit('startTokenization', { code: text });

        while (this.position.index < this.end) {

            // Determine the mode
            if (this.mode === LexMode.ALL) {
                this.mode = this.determineMode();
                this.modeStartPosition = { ...this.position };
            }

            switch (this.mode) {
                case LexMode.IDENT:
                    this.lexIdent();
                    break;
                case LexMode.RAW_BLOCK:
                    this.lexRawBlock();
                    break;
                case LexMode.NUMBER:
                    this.lexNumber();
                    break;
                case LexMode.STRING:
                    this.lexString();
                    break;
                case LexMode.SYMBOL:
                    this.lexSymbol();
                    break;
                case LexMode.NEWLINE:
                    this.lexNewline();
                    break;
                case LexMode.WHITESPACE:
                    this.lexWhitespace();
                    break;
                case LexMode.UNKNOWN:
                    this.lexUnknown();
                    break;
            }
        }

        // Do some diagnostics for EOF. Check if we're still in a mode other than ALL
        // if so, help out, emit the tokens and close the mode
        this.closeMode(LexMode.STRING, TokenType.STRING, 'Unterminated string');
        this.closeMode(LexMode.RAW_BLOCK, TokenType.RAW_BLOCK, 'Unterminated raw block');

        return this.tokens;
    }

    private closeMode(mode: LexMode, tokenToEmit: TokenType, warning: string) {
        if (this.mode === mode) {
            this.reporter.report({
                severity: 'error',
                message: warning,
                span: { start: { ...this.modeStartPosition }, end: { ...this.position } }
            });

            this.tokens.add({
                type: tokenToEmit,
                value: this.value,
                startPosition: { ...this.modeStartPosition },
                endPosition: { ...this.position },
            });

            this.value = '';

            // Clean up for string mode
            if (mode === LexMode.STRING) {
                this.delimiter = '';
            }

            // Set mode to all
            this.mode = LexMode.ALL;
        }
    }

    /**
     * @param offset
     * @private
     */
    private peek(offset = 0) {
        return this.source[this.position.index + offset] ?? '';
    }

    /**
     * @private
     */
    private advance() {
        const c = this.peek();

        if (c === '\r' && this.peek(1) === '\n') {
            this.position.index += 2;
            this.position.line++;
            this.position.column = 1;
            return;
        }

        if (c === '\n' || c === '\r') {
            this.position.index += 1;
            this.position.line++;
            this.position.column = 1;
            return;
        }

        this.position.index += 1;
        this.position.column += 1;
    }

    /**
     * Determines the lexing mode based on the current character
     * @private
     */
    private determineMode(): LexMode {

        // Reset the current token value
        this.value = '';

        if (
            grammar.REGEX_RAW_BLOCK_START.test(this.peek()) &&
            grammar.REGEX_RAW_BLOCK_INSIDE.test(this.peek(1))
        ) {
            return LexMode.RAW_BLOCK;
        }

        if (grammar.REGEX_IDENT_START.test(this.peek())) {
            return LexMode.IDENT;
        }

        if (grammar.REGEX_STRING_DELIMITER.test(this.peek())) {
            this.delimiter = this.peek();
            return LexMode.STRING;
        }

        if (grammar.REGEX_NUMBER.test(this.peek())) {
            return LexMode.NUMBER;
        }

        if (grammar.REGEX_SYMBOL.test(this.peek())) {
            return LexMode.SYMBOL;
        }

        if (grammar.REGEX_NEWLINE.test(this.peek())) {
            return LexMode.NEWLINE;
        }

        if (grammar.REGEX_WHITESPACE.test(this.peek())) {
            return LexMode.WHITESPACE;
        }

        return LexMode.UNKNOWN;
    }

    /**
     * Tokenize string
     * @private
     */
    private lexString() {

        // consume opening delimiter once
        if (this.value.length === 0 && this.peek() === this.delimiter) {
            this.advance();
            return;
        }

        // closing delimiter
        if (this.peek() === this.delimiter) {
            this.advance();
            this.tokens.add({
                type: TokenType.STRING,
                value: this.value,
                startPosition: { ...this.modeStartPosition },
                endPosition: { ...this.position }
            });
            this.mode = LexMode.ALL;
            this.delimiter = '';
            return;
        }

        // escape
        if (this.peek() === grammar.STRING_ESCAPE_SYMBOL) {
            this.advance(); // consume '\'
            if (this.peek()) { this.value += this.peek(); this.advance(); }
            return;
        }

        // normal char
        this.value += this.peek();
        this.advance();
    }

    /**
     * Tokenize raw block
     * @private
     */
    private lexRawBlock() {

        // If we just entered raw block, skip the opening "{%"
        if (
            this.value.length === 0 &&
            grammar.REGEX_RAW_BLOCK_START.test(this.peek()) &&      // '{'
            grammar.REGEX_RAW_BLOCK_INSIDE.test(this.peek(1))    // '%'
        ) {
            this.advance();
            this.advance();
            return;
        }

        if (
            grammar.REGEX_RAW_BLOCK_INSIDE.test(this.peek()) &&
            grammar.REGEX_RAW_BLOCK_END.test(this.peek(1))
        ) {
            this.advance();
            this.advance();

            this.tokens.add({
                type: TokenType.RAW_BLOCK,
                value: this.value,
                startPosition: { ...this.modeStartPosition },
                endPosition: { ...this.position },
            });

            this.mode = LexMode.ALL;
            return;
        }

        this.value += this.peek();
        this.advance();
    }

    /**
     * Tokenize identifier
     * @private
     */
    private lexIdent() {
        // We consume the character
        this.value += this.peek();
        this.advance();

        if (! this.peek() || ! grammar.REGEX_IDENT_CONT.test(this.peek())) {
            this.tokens.add({
                type: TokenType.IDENT,
                value: this.value,
                startPosition: { ...this.modeStartPosition },
                endPosition: { ...this.position },
            });
            this.mode = LexMode.ALL;
        }
    }

    /**
     * Tokenize number
     * @private
     */
    private lexNumber() {
        this.value += this.peek();
        this.advance();

        if (!this.peek() || !grammar.REGEX_NUMBER.test(this.peek())) {
            this.tokens.add({
                type: TokenType.NUMBER,
                value: this.value,
                startPosition: { ...this.modeStartPosition },
                endPosition: { ...this.position },
            });

            this.mode = LexMode.ALL;
        }
    }

    /**
     * Tokenize symbol
     * @private
     */
    private lexSymbol() {
        const value = this.peek();
        this.advance();
        this.tokens.add({
            type: TokenType.SYMBOL,
            value: value,
            startPosition: { ...this.modeStartPosition },
            endPosition: { ...this.position },
        });
        this.mode = LexMode.ALL;
    }

    /**
     * Tokenize newline
     * @private
     */
    private lexNewline() {
        this.advance();
        this.mode = LexMode.ALL;
    }

    /**
     * Tokenize whitespace
     * @private
     */
    private lexWhitespace() {
        this.advance();
        this.mode = LexMode.ALL;
    }

    /**
     * Tokenize unknown
     * @private
     */
    private lexUnknown() {
        const value = this.peek();
        this.advance();
        this.tokens.add({
            type: TokenType.UNKNOWN,
            value: value,
            startPosition: { ...this.modeStartPosition },
            endPosition: { ...this.position },
        });
        this.mode = LexMode.ALL;
    }
}