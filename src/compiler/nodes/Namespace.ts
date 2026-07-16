import Node from '../parser/Node';
import TypeResolver from '../type-safety/TypeResolver';

export default class Namespace extends Node {

    getName(): string {
        return 'NS';
    }

    resolve(typeResolver: TypeResolver) {
        //typeResolver.namespace(this.getValue());
    }
}