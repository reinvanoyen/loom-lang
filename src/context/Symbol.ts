export type SymbolType = 'namespace' | 'class' | 'type' | 'variant' | 'slot';

export default class Symbol {

    /**
     * @private
     */
    private id: number;

    /**
     * @private
     */
    private name: string;

    /**
     * @private
     */
    private type: SymbolType;

    /**
     * @private
     */
    private nodeId: number;

    /**
     * @param type
     * @param nodeId
     */
    constructor(type: SymbolType, nodeId: number) {
        this.type = type;
        this.nodeId = nodeId;
    }
}