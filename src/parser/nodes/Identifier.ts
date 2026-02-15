import Node from '../Node';
import Binder from '../../context/Binder';

export default class Identifier extends Node {

    bind(binder: Binder) {
        if (this.getValue() !== 'string') {
            this.setSymbol(binder.get(this.getValue()));
        }
    }

    compile() {
        // todo compile TypeIdentNode
    }
}