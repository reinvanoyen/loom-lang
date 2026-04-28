import Node from '../Node';
import TypeResolver from '../TypeResolver';

export default class Class extends Node {

    getName(): string {
        return 'CLS';
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }
}