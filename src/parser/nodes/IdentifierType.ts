import Node from '../Node';
import Binder from '../../context/Binder';

export default class IdentifierType extends Node {

    bind(binder: Binder) {
        if (this.getValue() !== 'string') {
            this.setSymbol(binder.getType(this.getValue()));
        }
    }

    compile() {
        // todo compile TypeIdentNode
    }
}