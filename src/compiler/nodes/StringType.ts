import Node from '../parser/Node';

export default class StringType extends Node {

    getName(): string {
        return 'T_STR';
    }
}