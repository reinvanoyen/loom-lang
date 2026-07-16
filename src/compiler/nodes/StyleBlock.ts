import Node from '../parser/Node';

export default class StyleBlock extends Node {

    getName(): string {
        return 'STYLE';
    }
}