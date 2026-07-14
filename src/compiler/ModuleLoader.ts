import Module from '@/compiler/Module';
import DiagReporter from '@/compiler/DiagReporter';
import * as fs from 'node:fs';
import Source from '@/compiler/Source';
import AST from '@/compiler/AST';
import Lexer from '@/compiler/Lexer';
import ASTBuilder from '@/compiler/ASTBuilder';
import Parser from '@/compiler/Parser';
import CompilationContext from '@/compiler/CompilationContext';

/**
 * Purpose: Parse a single file from disk into a Module.
 *
 * Responsibility: absolutePath → Module
 *
 * read file → Source → Lexer → Parser → AST → new Module(path, source, ast)
 * Owns: The “parse one file” pipeline (today duplicated in Compiler.compile()).
 *
 * Does not:
 *
 * Follow imports
 * Build the graph
 * Know about entry vs dependency
 * Analogy: ts.createSourceFile() + parse for one file.
 *
 * Your stub note: parseSource() still needs to be implemented (extract Lexer + Parser from Compiler).
 */
export default class ModuleLoader {
    /**
     * @private
     */
    private readonly context: CompilationContext;

    /**
     * @param context
     */
    constructor(context: CompilationContext) {
        this.context = context;
    }

    /**
     * @param absolutePath
     */
    public parseFile(absolutePath: string): Module {

        const text = fs.readFileSync(absolutePath, 'utf-8');
        const source = new Source(text, absolutePath);
        const diagnostics = new DiagReporter(source);
        const ast = this.parseSource(source, diagnostics);

        return new Module(absolutePath, source, ast, diagnostics);
    }

    /**
     * @param source
     * @param diagnostics
     * @private
     */
    public parseSource(source: Source, diagnostics: DiagReporter): AST {
        
        const { eventBus, idAllocator, debug } = this.context;

        const tokenStream = new Lexer(eventBus, diagnostics).tokenize(source);

        if (debug) {
            tokenStream.print();
        }

        const builder = new ASTBuilder(new AST(), idAllocator);
        const ast = new Parser(tokenStream, builder, eventBus, diagnostics).parse();

        if (debug) {
            ast.print();
        }

        return ast;
    }
}