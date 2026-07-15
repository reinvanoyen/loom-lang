import Compilation from '@/compiler/Compilation';
import path from 'node:path';
import ModuleLoader from '@/compiler/ModuleLoader';
import fs from 'fs';
import { resolveImport } from '@/compiler/helpers';
import CompilationContext from '@/compiler/CompilationContext';
import { MessageCode } from '@/compiler/Diagnostics';

export default class ModuleGraphLoader {
    /**
     * @private
     */
    private readonly loader: ModuleLoader;

    /**
     * @private
     */
    private readonly context: CompilationContext;

    /**
     * @param loader
     */
    constructor(loader: ModuleLoader, context: CompilationContext) {
        this.loader = loader;
        this.context = context;
    }

    /**
     * @param entryPath
     */
    public loadGraph(entryPath: string): Compilation {

        const compilation = new Compilation(path.resolve(entryPath));
        const visiting = new Set<string>();

        const load = (resolved: string) => {
            resolved = path.resolve(resolved);

            if (compilation.hasModule(resolved)) {
                return;
            }

            if (visiting.has(resolved)) {
                this.context.diagnostics.error({
                    code: MessageCode.E_IMPORT_CYCLE,
                    message: `Cyclic imports at ${resolved}`,
                });
                return;
            }

            if (!fs.existsSync(resolved)) {
                this.context.diagnostics.error({
                    code: MessageCode.E_IMPORT_NOT_FOUND,
                    message: `Import not found at ${resolved}`,
                });
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