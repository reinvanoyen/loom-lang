import Node from '../Node';
import TypeResolver from '../TypeResolver';

export default class Namespace extends Node {

    getName(): string {
        return 'NS';
    }

    resolve(typeResolver: TypeResolver) {
        //typeResolver.namespace(this.getValue());
    }
}