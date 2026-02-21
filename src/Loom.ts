import Compiler from '@/compiler/Compiler';

export default class Loom {
    /**
     * @param code
     */
    public static make(code: string): string {
        return (new Compiler()).compile(code);
    }
}