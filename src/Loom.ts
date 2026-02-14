import Lexer from './tokenization/Lexer';
import Parser from './parser/Parser';
import Compiler from './compiler/Compiler';
import Runtime from './runtime/Runtime';

export default class Loom {
    /**
     *
     * @param code
     */
    public static make(code: string): string {
        const tokens = (new Lexer()).tokenize(code);

        const ast = (new Parser().parse(tokens));
        console.log(ast.print());
        
        return (new Compiler(new Runtime())).compile(ast);
    }
}