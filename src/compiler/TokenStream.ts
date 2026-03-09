import { Token, TokenType } from './types/tokenization';
import chalk from 'chalk';
import { Nullable } from '@/compiler/types/nullable';

export type SyncToken = { type: TokenType; value?: string };

export default class TokenStream {
    /**
     * @private
     */
    private tokens: Token[] = [];

    /**
     * The current position of the cursor
     * @private
     */
    private cursor: number = 0;

    /**
     * Advance the cursor
     */
    public advance(offset = 1) {
        this.cursor += offset;
    }

    /**
     * @param offset
     */
    public peek(offset = 0): Nullable<Token> {
        return this.tokens[this.cursor + offset] || null;
    }

    /**
     *
     */
    public isEOF(): boolean {
        return (this.cursor >= this.tokens.length);
    }

    /**
     *
     */
    public getCursor(): number {
        return this.cursor;
    }

    /**
     * @param token
     */
    public add(token: Token) {
        this.tokens.push(token);
    }

    private is(tok: Nullable<Token>, t: SyncToken): boolean {
        return !!tok && tok.type === t.type && (t.value === undefined || tok.value === t.value);
    }

    /**
     *
     * @param stoppers
     * @param opts
     */
    public syncTo(stoppers: SyncToken[], opts?: { consumeStopper?: boolean }) {
        while (!this.isEOF()) {
            const tok = this.peek();
            if (!tok) {
                return;
            }
            if (stoppers.some(s => this.is(tok, s))) {
                if (opts?.consumeStopper) this.advance();
                return;
            }
            this.advance();
        }
    }

    /**
     *
     */
    public getTokens() {
        return this.tokens;
    }

    /**
     *
     */
    public getLength() {
        return this.tokens.length;
    }

    /**
     *
     */
    public print() {
        const output: string[] = [];
        this.tokens.forEach(token => {
            output.push(chalk.grey(`${token.type}(${chalk.blue(token.value)}) ${token.startPosition.index} -> ${token.endPosition.index}`));
        });

        console.log(output.join('\n'));
    }
}