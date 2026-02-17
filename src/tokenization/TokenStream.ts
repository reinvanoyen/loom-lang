import { Token } from '../types/tokenization';
import chalk from 'chalk';

export default class TokenStream {
    /**
     * @private
     */
    private tokens: Token[] = [];

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