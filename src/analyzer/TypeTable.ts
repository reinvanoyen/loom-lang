import { Nullable } from '../types/nullable';
import { ResolvedType } from '../types/analyzer';

export default class TypeTable {
    /**
     * @private
     */
    private types: Record<number, ResolvedType> = {};

    /**
     * @param symbolId
     * @param type
     */
    public registerType(symbolId: number, type: ResolvedType) {
        this.types[symbolId] = type;
    }

    /**
     * @param symbolId
     */
    public hasType(symbolId: number) {
        return (typeof this.types[symbolId] !== 'undefined');
    }

    /**
     * @param symbolId
     */
    public getType(symbolId: number): Nullable<ResolvedType> {
        if (this.hasType(symbolId)) {
            return this.types[symbolId];
        }
        return null;
    }
}