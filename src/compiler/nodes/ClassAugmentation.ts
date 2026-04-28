import Node from '../Node';
import Compiler from '../Compiler';
import TypeResolver from '../TypeResolver';

export default class ClassAugmentation extends Node {

    getName(): string {
        return 'CLS_AUG';
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }

    compile(compiler: Compiler) {
    }
}