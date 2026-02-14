import Lexer from './tokenization/Lexer';
import Parser from './parser/Parser';
import Runtime from './runtime/Runtime';
import Compiler from './compiler/Compiler';

export default class Loom {
    /**
     *
     * @param code
     */
    public static make(code: string): string {
        const tokens = (new Lexer()).tokenize(code);
        //console.log(tokens);
        const ast = (new Parser().parse(tokens));
        console.log(ast.print());

        return (new Compiler(new Runtime())).compile(ast);
    }
}