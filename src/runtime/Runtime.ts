export default class Runtime {

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
}