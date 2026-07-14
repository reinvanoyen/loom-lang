
type ClassEmission = {
    name: string; // the name of the current class
    parent?: string; // the parent we're extending from

    ownSlots: string[]; // only own slots
    slots: string[]; // all slots, merged from inheritance

    ownClassStyles: string[]; // only own styles
    classStyles: string[]; // all class styles, inherited

    ownSlotStyles: Map<string, string[]>;
    slotStyles: Map<string, string[]>;
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
     */
    public getOrCreateClassEmission(name: string): ClassEmission {
        if (this.classes.has(name)) {
            return this.classes.get(name)!;
        }

        this.classes.set(name, {
            name,
            ownSlots: [],
            slots: [],
            ownClassStyles: [],
            classStyles: [],
            ownSlotStyles: new Map(),
            slotStyles: new Map(),
        });

        return this.classes.get(name)!;
    }

    /**
     *
     */
    public getClasses(): Map<string, ClassEmission> {
        return this.classes;
    }

    /**
     *
     */
    public getNamespace(): string {
        return this.namespace;
    }
}