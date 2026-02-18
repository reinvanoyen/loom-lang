import { Token } from '../types/tokenization';
import chalk from 'chalk';

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
    public peek(offset = 0): Token {
        return this.tokens[this.cursor + offset];
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

    /*
    * peek(n = 0): Token | EOF
    isEOF(): boolean
    next(): Token | EOF (consume current + advance)
    consume(type?, value?): Token | null
    match(type?, value?, n=0): boolean
    mark(): number
    reset(mark: number): void
    slice(fromMark, toMark) (optional, for error messages/debug)
    position() / index() (optional)
    * */

    /**
     * @param token
     */
    public add(token: Token) {
        this.tokens.push(token);
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
            if (token.type === 'Symbol') {
                output.push(chalk.grey(`${token.value}`));
            }

            if (token.type === 'Ident') {
                output.push(chalk.yellow(`${token.value}`));
            }

            if (token.type === 'String') {
                output.push(chalk.green(`${token.value}`));
            }

            if (token.type === 'Newline') {
                output.push(chalk.magenta('newline'));
            }

            if (token.type === 'Number') {
                output.push(chalk.blue(`${token.value}`));
            }

            if (token.type === 'RawBlock') {
                output.push(chalk.bgCyan(`${token.value}`));
            }

            if (token.type === 'Unknown') {
                output.push(chalk.red(`${token.value}`));
            }
        });

        return output.join(' ');
    }
}