import Node from './Node';
import TypeResolver from '../type-safety/TypeResolver';

export default class AST extends Node {

    getName(): string {
        return 'AST';
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }
}