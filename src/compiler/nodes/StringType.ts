import Node from '../Node';

export default class StringType extends Node {

    getName(): string {
        return 'T_STR';
    }

    compile() {
        // todo compile TypeIdentNode
    }
}