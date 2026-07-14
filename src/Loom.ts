import Compiler from '@/compiler/Compiler';

export default class Loom {
    /**
     * @param entryPath
     * @param opts
     */
    public static makeFromFile(entryPath: string, opts?: { debug?: boolean }): string {
        return new Compiler().compileFile(entryPath, opts);
    }
}