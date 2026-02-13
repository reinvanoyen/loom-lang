import Node from './Node';
import Parser from './Parser';
import ClassNode from '../nodes/ClassNode';

export default class AstNode extends Node {

    static parse(parser: Parser): boolean {

        while(
            ClassNode.parse(parser)
        );

        return true;
    }

    compile() {
        // todo compile
    }
}