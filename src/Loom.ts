import Lexer from './tokenization/Lexer';

export default class Loom {
    /**
     *
     * @param code
     */
    public static make(code: string): string {
        const tokens = (new Lexer()).tokenize(code);
        /*
        const ast = (new Parser().parse(tokens));

        console.log(ast.getChildren()[0].getChildren());*/

        // Simple compiling
        const output = [];

        tokens.forEach(token => {
            output.push(`${token.type}(${token.value})`);
        });

        return output.join('\n');
    }
}