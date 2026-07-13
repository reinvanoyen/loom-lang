type ClassEmission = {
    name: string;
    parent?: string;
    slots: string[];           // merged from inheritance
    classStyles: string[];     // raw CSS bodies
    slotStyles: Map<string, string[]>; // future: slot icon {% ... %}
};

export default class EmissionModel {
    /**
     * @private
     */
    private namespace: string = 'global';

    /**
     * @private
     */
    private classes: Map<string, ClassEmission> = new Map();

    /**
     * @param namespace
     */
    public setNamespace(namespace: string) {
        this.namespace = namespace;
    }

    /**
     * @param name
     * @param classEmission
     */
    public registerClassEmission(name: string, classEmission: ClassEmission) {
        this.classes.set(name, classEmission);
    }
}