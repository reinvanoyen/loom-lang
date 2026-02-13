import Lexer from './tokenization/Lexer';
import Parser from './parsing/Parser';

export default class Loom {
    /**
     *
     * @param code
     */
    public static make(code: string): string {
        const tokens = (new Lexer()).tokenize(code);
        const ast = (new Parser().parse(tokens));

        console.log(ast.getChildren());

        // Simple compiling
        const output = [];

        tokens.forEach(token => {
            output.push(token.value);
        });

        return output.join(' ');
    }
}