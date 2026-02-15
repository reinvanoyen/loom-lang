import Lexer from './tokenization/Lexer';
import Parser from './parser/Parser';
import Compiler from './compiler/Compiler';
import OutputBuffer from './compiler/OutputBuffer';
import Binder from './binder/Binder';
import SymbolTable from './binder/SymbolTable';
import TypeResolver from './analyzer/TypeResolver';
import TypeTable from './analyzer/TypeTable';
import DiagnosticReporter from './analyzer/DiagnosticReporter';
import TypeChecker from './analyzer/TypeChecker';

export default class Loom {
    /**
     *
     * @param code
     */
    public static make(code: string): string {

        // Make a diagnostics reporter we can report messages to during this whole process
        const diagnostics = new DiagnosticReporter();

        // Tokenize
        const tokens = (new Lexer()).tokenize(code);

        console.log('=== TOKENS ===');
        console.log(tokens);

        // Parse into AST
        const ast = (new Parser(diagnostics).parse(tokens));
        console.log('=== AST ===');
        console.log(ast.print());

        // Bind Symbols to AST
        const symbolTable = new SymbolTable();
        (new Binder(diagnostics, symbolTable)).bind(ast);

        console.log('=== SYMBOL TABLE ===');
        console.log(symbolTable);

        // Resolve types
        const typeTable = new TypeTable();
        const resolver = new TypeResolver(diagnostics, typeTable);
        resolver.resolve(ast);

        console.log('=== TYPE TABLE ===');
        console.log(typeTable);

        // Check the types
        (new TypeChecker(diagnostics)).check(ast, typeTable);

        console.log('=== DIAGNOSTICS ===');
        console.log(diagnostics);

        if (diagnostics.hasErrors()) {
            console.error('Not compiling, errors found...')
            return '';
        }

        // Finally we compile
        return (new Compiler(new OutputBuffer())).compile(ast);
    }
}