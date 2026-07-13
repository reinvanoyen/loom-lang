import Node from '../Node';

export default class IdentifierType extends Node {

    getName(): string {
        return 'T_IDNT';
    }
}