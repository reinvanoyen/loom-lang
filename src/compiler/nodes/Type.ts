import Node from '../parser/Node';

export default class Type extends Node {

    getName(): string {
        return 'TYPE';
    }
}