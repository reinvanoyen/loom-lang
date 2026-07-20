import Node from '../parser/Node';
import { Nullable } from '@/compiler/types/nullable';
import { Namespace } from '@/compiler/types/namespace';

export default class ClassReference extends Node {

    private namespace?: Namespace;

    constructor(className: string, namespace?: Namespace) {
        super(className);
        this.namespace = namespace;
    }

    getName(): string {
        return 'CLASS_REF';
    }

    getNamespace(): Nullable<Namespace> {
        return this.namespace || null;
    }
}