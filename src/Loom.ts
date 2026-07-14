import Compiler from '@/compiler/Compiler';
import fs from 'fs';

export default class Loom {
    /**
     * @param code
     */
    public static make(code: string): string {
        return (new Compiler()).compile(code);
    }

    /**
     * @param entryPath
     */
    public static makeFromFile(entryPath: string): string {
        const code = fs.readFileSync(entryPath, 'utf-8');

        return (new Compiler()).compile(code);
    }
}