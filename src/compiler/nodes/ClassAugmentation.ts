import Node from '../parser/Node';
import TypeResolver from '../type-safety/TypeResolver';

export default class ClassAugmentation extends Node {

    getName(): string {
        return 'CLASS_AUG';
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }
}