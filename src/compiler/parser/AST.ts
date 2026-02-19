import Node from './Node';
import Compiler from '../Compiler';
import Binder from '../binder/Binder';
import TypeResolver from '../analyzer/TypeResolver';

export default class AST extends Node {

    getName(): string {
        return 'AST';
    }

    compile(compiler: Compiler) {
        this.getChildren().forEach(child => {
            child.compile(compiler);
        });
    }

    bind(binder: Binder) {
        this.getChildren().forEach(child => {
            child.bind(binder);
        });
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }
}