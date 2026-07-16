import Node from '../parser/Node';
import TypeResolver from '../type-safety/TypeResolver';

export default class Class extends Node {

    getName(): string {
        return 'CLASS';
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }
}