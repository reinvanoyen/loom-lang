import Lexer from './tokenization/Lexer';
import Parser from './parser/Parser';
import Compiler from './compiler/Compiler';
import OutputBuffer from './compiler/OutputBuffer';
import Binder from './context/Binder';
import SymbolTable from './context/SymbolTable';

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

        const symbolTable = new SymbolTable();
        // Now the bind phase
        (new Binder(symbolTable)).bind(ast);

        console.log(symbolTable);

        // Finally we compile
        return (new Compiler(new OutputBuffer())).compile(ast);
    }
}