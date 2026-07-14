import Module from '@/compiler/Module';

/**
 * Purpose: The container for an entire build — entry point + every module discovered via imports.
 *
 * Owns:
 *
 * entryPath — what the user passed to the CLI (e.g. index.loom)
 * modules: Map<absolutePath, Module> — all loaded files, keyed by resolved path
 * Provides:
 *
 * getEntryModule() — the entry file’s Module
 * getModules() — full graph
 * addModule() / hasModule() — used while loading
 *
 * Does not:
 *
 * Load files (that’s ModuleGraphLoader)
 * Parse files (that’s ModuleLoader)
 * Merge ASTs or emit CSS (future step / Compiler)
 * Analogy: A Program or “compilation unit” in other compilers — the session object passed through the pipeline.
 *
 * Later it may also hold:
 *
 * Shared SymbolTable / TypeTable
 * Aggregated diagnostics
 * Load order for deterministic emission
 */
export default class Compilation {
    private readonly entryPath: string;
    private readonly modules = new Map<string, Module>(); // key: absolute path

    constructor(entryPath: string) {
        this.entryPath = entryPath;
    }

    getEntryPath() {
        return this.entryPath;
    }

    getEntryModule(): Module {

    }

    getModules() {
        return this.modules;
    }

    addModule(module: Module): void {

    }

    hasModule(resolvedPath: string): boolean {
        
    }
}