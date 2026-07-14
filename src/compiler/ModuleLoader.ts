import Module from '@/compiler/Module';
import DiagReporter from '@/compiler/DiagReporter';
import * as fs from 'node:fs';
import Source from '@/compiler/Source';

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
    public parseFile(absolutePath: string, diagnostics: DiagReporter): Module {
        const text = fs.readFileSync(absolutePath, 'utf-8');
        const source = new Source(text); // later: pass filename too
        const ast = this.parseSource(source, diagnostics);
        return new Module(absolutePath, source, ast);
    }
}