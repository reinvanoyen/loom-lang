import Node from '../Node';
import Binder from '../Binder';
import Compiler from '../Compiler';
import TypeResolver from '../TypeResolver';

export default class ClassAugmentation extends Node {

    getName(): string {
        return 'CLS_AUG';
    }

    bind(binder: Binder) {
        const id = this.getId();
        const value = this.getValue();

        if (!id) {
            // todo - do we need to report this?
            return;
        }

        if (!value) {
            // todo - do we need to report this?
            return;
        }

        const symbol = binder.get(value);

        if (! symbol) {
            // todo - do we need to report this?
            return;
        }

        this.setSymbol(symbol);
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }

    compile(compiler: Compiler) {
    }
}