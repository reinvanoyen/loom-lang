import Compilation from '@/compiler/Compilation';
import path from 'node:path';
import ModuleLoader from '@/compiler/module/ModuleLoader';
import fs from 'fs';
import { resolveImport } from '@/compiler/helpers';
import CompilationContext from '@/compiler/CompilationContext';
import { MessageCode } from '@/compiler/Diagnostics';
import Module from '@/compiler/module/Module';
import { Nullable } from '@/compiler/types/nullable';

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
     * @param context
     */
    constructor(loader: ModuleLoader, context: CompilationContext) {
        this.loader = loader;
        this.context = context;
    }

    private loadGraphWith(entryPath: string, loadModule: (resolved: string) => Nullable<Module>): Compilation {
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

            visiting.add(resolved);

            const module = loadModule(resolved);

            if (!module) {
                visiting.delete(resolved);
                return;
            }

            compilation.addModule(module);

            for (const imp of module.getImportPaths()) {
                load(resolveImport(imp, resolved));
            }

            visiting.delete(resolved);
        };

        load(compilation.getEntryPath());
        return compilation;
    }

    /**
     * @param entryPath
     */
    public loadGraph(entryPath: string): Compilation {
        return this.loadGraphWith(entryPath, (resolved) => {
            if (!fs.existsSync(resolved)) {
                this.context.diagnostics.error({
                    code: MessageCode.E_IMPORT_NOT_FOUND,
                    message: `Import not found at ${resolved}`,
                });
                return null;
            }
            return this.loader.parseFile(resolved);
        });
    }

    /**
     * @param entryPath
     * @param sourceText
     */
    public loadGraphFromSource(entryPath: string, sourceText: string): Compilation {
        const entry = path.resolve(entryPath);
        return this.loadGraphWith(entry, (resolved) => {
            if (resolved === entry) {
                return this.loader.parseVirtual(entry, sourceText);
            }
            if (!fs.existsSync(resolved)) {
                this.context.diagnostics.error({
                    code: MessageCode.E_IMPORT_NOT_FOUND,
                    message: `Import not found at ${resolved}`,
                });
                return null;
            }
            return this.loader.parseFile(resolved);
        });
    }
}