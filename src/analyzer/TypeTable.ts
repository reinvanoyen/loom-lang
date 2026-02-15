import { Nullable } from '../types/nullable';
import { ResolvedType } from '../types/analyzer';

export default class TypeTable {
    /**
     * @private
     */
    private types: Record<string, ResolvedType> = {};

    /**
     * @param name
     * @param type
     */
    public registerType(name: string, type: ResolvedType) {
        this.types[name] = type;
    }

    /**
     * @param name
     */
    public hasType(name: string) {
        return (typeof this.types[name] !== 'undefined');
    }

    /**
     * @param name
     */
    public getType(name: string): Nullable<ResolvedType> {
        if (this.hasType(name)) {
            return this.types[name];
        }
        return null;
    }
}