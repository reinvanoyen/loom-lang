import EventBus from '@/core/bus/EventBus';
import { TEventMap } from '@/compiler/types/bus';
import IdAllocator from '@/core/allocators/IdAllocator';

export default class CompilationContext {

    readonly eventBus = new EventBus<TEventMap>();
    readonly idAllocator = new IdAllocator();
    readonly debug: boolean;

    constructor(opts?: { debug?: boolean }) {
        this.debug = opts?.debug ?? false;
    }
}