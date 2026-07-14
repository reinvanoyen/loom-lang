import Compilation from '@/compiler/Compilation';

/**
 * Purpose: Discover and load the full import graph starting from the entry file.
 *
 * Responsibility: entryPath → Compilation
 *
 * Algorithm (what your stub sketches):
 *
 * Create Compilation(entryPath)
 * Recursively for each file:
 * Resolve import path relative to importing file
 * Skip if already in compilation.modules
 * Detect cycles (visiting set)
 * Call ModuleLoader.parseFile()
 * compilation.addModule(module)
 * Recurse into module.getImportPaths()
 * Owns: Graph traversal, cycle detection, deduplication (same file imported twice).
 *
 * Does not:
 *
 * Parse file contents itself (delegates to ModuleLoader)
 * Store modules long-term beyond building Compilation
 * Run semantic analysis or emission
 * Analogy: Module resolution + “load all dependencies” in a bundler.
 *
 * Your stub note: Still needs resolveImport(), injected ModuleLoader, and DiagReporter.
 */
export default class ModuleGraphLoader {

    public loadGraph(entryPath: string): Compilation {
        const compilation = new Compilation(entryPath);
        const visiting = new Set<string>();

        const load = (specifier: string, fromPath: string) => {
            const resolved = resolveImport(specifier, fromPath);
            // resolved = path.resolve(dirname(fromPath), specifier)

            if (compilation.hasModule(resolved)) {
                return;
            }

            if (visiting.has(resolved)) {
                // E_IMPORT_CYCLE
                return;
            }

            visiting.add(resolved);
            const module = loader.parseFile(resolved, diagnostics);
            compilation.addModule(module);

            for (const imp of module.getImportPaths()) {
                load(imp, resolved);
            }

            visiting.delete(resolved);
        };

        load(entryPath, entryPath); // entry: specifier is the path itself
        return compilation;
    }
}