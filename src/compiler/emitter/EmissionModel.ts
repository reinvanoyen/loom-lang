import { namespacedKey } from '@/compiler/helpers';

export type ClassEmission = {
    name: string; // the name of the current class
    namespace: string;  // the namespace of the class

    parent?: string; // the parent we're extending from
    parentNamespace?: string; // the parent's namespace

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
    private classes: Map<string, ClassEmission> = new Map();

    /**
     * @param namespace
     * @param name
     */
    public getOrCreateClassEmission(namespace: string, name: string): ClassEmission {

        const nsKey = namespacedKey(name, namespace);

        if (this.classes.has(nsKey)) {
            return this.classes.get(nsKey)!;
        }

        this.classes.set(nsKey, {
            name,
            namespace: 'global',
            parent: undefined,
            parentNamespace: undefined,
            ownSlots: [],
            slots: [],
            ownClassStyles: [],
            classStyles: [],
            ownSlotStyles: new Map(),
            slotStyles: new Map(),
        });

        return this.classes.get(nsKey)!;
    }

    /**
     *
     */
    public getClasses(): Map<string, ClassEmission> {
        return this.classes;
    }
}