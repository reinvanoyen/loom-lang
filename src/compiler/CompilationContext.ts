import EventBus from '@/core/bus/EventBus';
import { TEventMap } from '@/compiler/types/bus';
import IdAllocator from '@/core/allocators/IdAllocator';
import Diagnostics from '@/compiler/Diagnostics';

export default class CompilationContext {

    readonly eventBus = new EventBus<TEventMap>();
    readonly idAllocator = new IdAllocator();
    readonly diagnostics = new Diagnostics();
    readonly debug: boolean;

    constructor(opts?: { debug?: boolean }) {
        this.debug = opts?.debug ?? false;
    }
}