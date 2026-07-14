import Compilation from '@/compiler/Compilation';
import path from 'node:path';
import ModuleLoader from '@/compiler/ModuleLoader';
import fs from 'fs';
import { resolveImport } from '@/compiler/helpers';

export default class ModuleGraphLoader {
    /**
     * @private
     */
    private readonly loader: ModuleLoader;

    /**
     * @param loader
     */
    constructor(loader: ModuleLoader) {
        this.loader = loader;
    }

    /**
     * @param entryPath
     */
    public loadGraph(entryPath: string): Compilation {

        const compilation = new Compilation(path.resolve(entryPath));
        const visiting = new Set<string>();

        const load = (resolved: string) => {
            resolved = path.resolve(resolved);

            if (compilation.hasModule(resolved)) return;

            if (visiting.has(resolved)) {
                // todo: diagnostics E_IMPORT_CYCLE
                return;
            }

            if (!fs.existsSync(resolved)) {
                // todo: diagnostics E_IMPORT_NOT_FOUND
                return;
            }

            visiting.add(resolved);

            const module = this.loader.parseFile(resolved);
            compilation.addModule(module);

            for (const imp of module.getImportPaths()) {
                load(resolveImport(imp, resolved));
            }

            visiting.delete(resolved);
        };

        load(compilation.getEntryPath());
        return compilation;
    }
}