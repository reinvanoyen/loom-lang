export type TypeSymbol = {
    type: 'string' | 'identifier',
    value: string;
};

// @todo turn this into a list of names and their references
// --> see Symbol class
export default class SymbolTable {

    /**
     * @private
     */
    private types: Record<string, TypeSymbol[]> = {};

    /**
     * @private
     */
    private namespaces: string[] = [];

    /**
     * @private
     */
    private currentNamespace: string | null = null;

    /**
     * @private
     */
    private classes: Record<string, string[]> = {};

    /**
     * @param name
     */
    public setNamespace(name: string) {
        if (! this.namespaces.includes(name)) {
            this.namespaces.push(name);
        }

        this.currentNamespace = name;
    }

    /**
     *
     */
    public getNamespace(): string | null {
        return this.currentNamespace;
    }

    /**
     *
     * @param name
     */
    public registerClass(name: string) {
        if (! this.classes[this.currentNamespace]) {
            this.classes[this.currentNamespace] = [];
        }

        this.classes[this.currentNamespace].push(name);
    }

    /**
     * @param name
     * @param symbols
     */
    public declareType(name: string, symbols: TypeSymbol[]) {
        if (this.types[name]) {
            throw new Error(`Runtime error, type ${name} already exists`);
        }

        this.types[name] = symbols;
    }

    /**
     * @param name
     */
    public getType(name: string): TypeSymbol[] {
        if (! this.types[name]) {
            throw new Error(`Runtime error, type ${name} doesn't exist`);
        }

        return this.types[name];
    }
}