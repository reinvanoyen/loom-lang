import { Namespace } from '../types/namespace';
import { Nullable } from '../types/nullable';

export type SymbolType = 'namespace' | 'class' | 'type' | 'variant' | 'slot';

let currentId = 0;

export default class Symbol {
    /**
     * @private
     */
    private readonly id: number;

    /**
     * @private
     */
    private type: SymbolType;

    /**
     * @private
     */
    private nodeId: number;

    /**
     * @private
     */
    private namespace: Nullable<Namespace> = null;

    /**
     * @param type
     * @param nodeId
     */
    constructor(type: SymbolType, nodeId: number) {
        this.id = currentId++;
        this.type = type;
        this.nodeId = nodeId;
    }

    /**
     */
    getId(): number {
        return this.id;
    }

    /**
     * @param ns
     */
    setNamespace(ns: Namespace) {
        this.namespace = ns;
    }
}