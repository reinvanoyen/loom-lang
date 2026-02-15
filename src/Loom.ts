import Lexer from './tokenization/Lexer';
import Parser from './parser/Parser';
import Compiler from './compiler/Compiler';
import OutputBuffer from './compiler/OutputBuffer';
import Binder from './context/Binder';
import SymbolTable from './context/SymbolTable';
import TypeResolver from './analyzer/TypeResolver';
import TypeTable from './analyzer/TypeTable';
import DiagnosticsResult from './analyzer/DiagnosticsResult';
import TypeChecker from './analyzer/TypeChecker';

export default class Loom {
    /**
     *
     * @param code
     */
    public static make(code: string): string {
        const tokens = (new Lexer()).tokenize(code);

        const ast = (new Parser().parse(tokens));
        console.log('=== AST ===');
        console.log(ast.print());

        // Bind Symbols to AST
        const symbolTable = new SymbolTable();
        (new Binder(symbolTable)).bind(ast);

        console.log('=== SYMBOL TABLE ===');
        console.log(symbolTable);

        // Resolve types
        const typeTable = new TypeTable();
        const resolver = new TypeResolver(typeTable, symbolTable);
        resolver.resolve(ast);

        console.log('=== TYPE TABLE ===');
        console.log(typeTable);

        // Check the types
        const diagnostics = new DiagnosticsResult();
        (new TypeChecker(diagnostics)).check(ast, typeTable);

        console.log('=== DIAGNOSTICS ===');
        console.log(diagnostics);

        // Finally we compile
        return (new Compiler(new OutputBuffer())).compile(ast);
    }
}