import Node from '../parser/Node';

export default class IdentifierType extends Node {

    getName(): string {
        return 'T_IDENT';
    }
}