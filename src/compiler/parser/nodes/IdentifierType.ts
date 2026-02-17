import Node from '../Node';
import Binder from '../../binder/Binder';

export default class IdentifierType extends Node {

    getName(): string {
        return 'T_IDENT';
    }

    bind(binder: Binder) {

        const value = this.getValue();

        if (! value) {
            // todo - do we need to report this?
            return;
        }

        if (value === 'string') {
            // todo - do we need to report this?
            return;
        }

        const symbol = binder.getType(value);

        if (! symbol) {
            // todo - do we need to report this?
            return;
        }

        this.setSymbol(symbol);
    }

    compile() {
        // todo compile TypeIdentNode
    }
}