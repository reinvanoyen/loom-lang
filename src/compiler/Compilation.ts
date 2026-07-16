import Module from '@/compiler/module/Module';
import path from 'node:path';

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
    /**
     * @private
     */
    private readonly entryPath: string;

    /**
     * @private
     */
    private readonly modules = new Map<string, Module>(); // key: absolute path

    /**
     * @private
     */
    private modulesLoadOrder: string[] = [];

    /**
     * @param entryPath
     */
    constructor(entryPath: string) {
        this.entryPath = entryPath;
    }

    /**
     *
     */
    public getEntryPath() {
        return this.entryPath;
    }

    /**
     *
     */
    public getEntryModule(): Module {
        const resolved = path.resolve(this.entryPath);
        const module = this.modules.get(resolved);

        if (!module) {
            throw new Error(`Entry module not loaded: ${resolved}`);
        }

        return module;
    }

    /**
     *
     */
    public getModules() {
        return this.modules;
    }

    /**
     *
     */
    public getModulesInLoadOrder(): Module[] {
        return this.modulesLoadOrder.map(p => this.modules.get(p)!);
    }

    /**
     * @param module
     */
    public addModule(module: Module): void {
        const key = path.resolve(module.getPath());
        this.modules.set(key, module);
        this.modulesLoadOrder.push(key);
    }

    /**
     * @param resolvedPath
     */
    public hasModule(resolvedPath: string): boolean {
        return this.modules.has(path.resolve(resolvedPath));
    }
}