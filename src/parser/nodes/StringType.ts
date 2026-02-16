import Node from '../Node';

export default class StringType extends Node {

    getName(): string {
        return 'T_STRING';
    }

    compile() {
        // todo compile TypeIdentNode
    }
}