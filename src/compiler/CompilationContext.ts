import EventBus from '@/core/bus/EventBus';
import { EventMap } from '@/compiler/types/bus';
import IdAllocator from '@/core/allocators/IdAllocator';
import Diagnostics from '@/compiler/Diagnostics';

export type CompilationFlags = {
    verbose: boolean,
    printBoundAst: boolean,
    printSymbolTable: boolean,
    printTypeTable: boolean,
    printDiagnostics: boolean,
    printEmissionModel: boolean,
};

export default class CompilationContext {

    public readonly eventBus = new EventBus<EventMap>();
    public readonly idAllocator = new IdAllocator();
    public readonly diagnostics = new Diagnostics();
    public readonly flags: CompilationFlags;

    constructor(flags?: Partial<CompilationFlags>) {

        const defaultFlags: CompilationFlags = {
            verbose: true,
            printEmissionModel: true,
            printBoundAst: true,
            printDiagnostics: true,
            printTypeTable: true,
            printSymbolTable: true,
        };

        this.flags = { ...flags, ...defaultFlags };
    }
}