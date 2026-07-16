import Node from '../parser/Node';

export default class SlotDeclaration extends Node {

    getName(): string {
        return 'SLOT_DECL';
    }
}