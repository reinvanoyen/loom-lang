import Node from '../parser/Node';

export default class StringLiteral extends Node {
    getName(): string {
        return 'STRING';
    }
}