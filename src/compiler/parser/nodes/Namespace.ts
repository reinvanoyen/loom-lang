import Node from '../Node';
import Compiler from '../../Compiler';
import Binder from '../../binder/Binder';
import TypeResolver from '../../analyzer/TypeResolver';

export default class Namespace extends Node {

    getName(): string {
        return 'NS';
    }

    bind(binder: Binder) {

        const value = this.getValue();

        if (! value) {
            return;
        }

        binder.namespace(value);
    }

    resolve(typeResolver: TypeResolver) {
        //typeResolver.namespace(this.getValue());
    }

    compile(compiler: Compiler) {
        //compiler.symbols().setNamespace(this.getValue());
    }
}