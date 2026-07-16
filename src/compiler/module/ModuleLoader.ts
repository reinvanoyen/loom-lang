import Module from '@/compiler/module/Module';
import * as fs from 'node:fs';
import Source from '@/compiler/Source';
import AST from '@/compiler/parser/AST';
import Lexer from '@/compiler/lexer/Lexer';
import ASTBuilder from '@/compiler/parser/ASTBuilder';
import Parser from '@/compiler/parser/Parser';
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
        return this.parseVirtual(absolutePath, text);
    }

    /**
     * @param absolutePath
     * @param text
     */
    public parseVirtual(absolutePath: string, text: string): Module {
        const source = new Source(text, absolutePath);
        const ast = this.parseSource(source);
        return new Module(absolutePath, source, ast, this.context.diagnostics);
    }

    /**
     * @param source
     * @private
     */
    public parseSource(source: Source): AST {
        
        const { flags, diagnostics } = this.context;

        diagnostics.registerSource(source);

        const tokenStream = new Lexer(this.context).tokenize(source);

        if (flags.verbose) {
            tokenStream.print();
        }

        const builder = new ASTBuilder(new AST(), this.context);
        const ast = new Parser(tokenStream, builder, this.context).parse();

        if (flags.verbose) {
            ast.print();
        }

        return ast;
    }
}