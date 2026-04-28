import Node from '../Node';
import Compiler from '../Compiler';
import TypeResolver from '../TypeResolver';

export default class Namespace extends Node {

    getName(): string {
        return 'NS';
    }

    resolve(typeResolver: TypeResolver) {
        //typeResolver.namespace(this.getValue());
    }

    compile(compiler: Compiler) {
        //compiler.symbols().setNamespace(this.getValue());
    }
}