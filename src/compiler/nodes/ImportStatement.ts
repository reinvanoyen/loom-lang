import Node from '../parser/Node';

export default class ImportStatement extends Node {

    getName(): string {
        return 'IMPORT';
    }
}