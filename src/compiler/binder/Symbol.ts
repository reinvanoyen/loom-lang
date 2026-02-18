import { Namespace } from '../types/namespace';
import { Nullable } from '../types/nullable';

export type SymbolType = 'namespace' | 'class' | 'type' | 'variant' | 'slot';

export default class Symbol {
    /**
     * @private
     */
    private id: Nullable<number> = null;

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
        this.type = type;
        this.nodeId = nodeId;
    }

    /**
     * @param id
     */
    public setId(id: number) {
        this.id = id;
    }

    /**
     */
    public getId(): Nullable<number> {
        return this.id;
    }

    /**
     * @param ns
     */
    public setNamespace(ns: Namespace) {
        this.namespace = ns;
    }

    /**
     *
     */
    public getNamespace(): Nullable<Namespace> {
        return this.namespace;
    }
}