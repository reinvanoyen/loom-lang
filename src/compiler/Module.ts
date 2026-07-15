import AST from './AST';
import Source from '@/compiler/Source';
import ImportStatement from '@/compiler/nodes/ImportStatement';
import Diagnostics from '@/compiler/Diagnostics';

/**
 * Purpose: Represents one compiled source file after parse — the unit of “a .loom file on disk.”
 *
 * Owns:
 *
 * path — absolute path (canonical key in the graph)
 * source — raw text + line index (Source)
 * ast — parsed tree for that file only
 *
 * Knows how to:
 *
 * Expose import specifiers via getImportPaths() (reads ImportStatement nodes from its AST)
 *
 * Does not:
 *
 * Load other files
 * Resolve import paths
 * Run binder / emitter
 * Merge with other modules
 * Analogy: One translation unit in C/TS — parsed, not yet linked.
 */
export default class Module {

    private readonly path: string;
    private readonly source: Source;
    private readonly ast: AST;
    private readonly diagnostics: Diagnostics;

    constructor(path: string, source: Source, ast: AST, diagnostics: Diagnostics) {
        this.path = path;
        this.source = source;
        this.ast = ast;
        this.diagnostics = diagnostics;
    }

    getPath(): string {
        return this.path;
    }

    getSource(): Source {
        return this.source;
    }

    getAst(): AST {
        return this.ast;
    }

    public getDiagnosticsReporter(): Diagnostics {
        return this.diagnostics;
    }

    getImportPaths(): string[] {
        return this.ast.getChildren()
            .filter((n): n is ImportStatement => n instanceof ImportStatement)
            .map(n => n.getValue()!)
            .filter(Boolean)
        ;
    }
}