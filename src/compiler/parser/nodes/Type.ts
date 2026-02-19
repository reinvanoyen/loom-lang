import Node from '../Node';
import Binder from '../../binder/Binder';

export default class Type extends Node {

    getName(): string {
        return 'TYPE';
    }

    bind(binder: Binder) {
        this.getChildren().forEach(child => {
            child.bind(binder);
        });
    }

    compile() {
        // todo compile VariantDefinition
    }
}