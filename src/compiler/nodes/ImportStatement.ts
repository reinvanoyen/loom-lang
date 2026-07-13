import Node from '../Node';

export default class ImportStatement extends Node {

    getName(): string {
        return 'IMPRT';
    }
}