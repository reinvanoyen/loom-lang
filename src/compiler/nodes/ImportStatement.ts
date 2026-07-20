import Node from '../parser/Node';
import { Nullable } from '@/compiler/types/nullable';
import StringLiteral from '@/compiler/nodes/StringLiteral';

export default class ImportStatement extends Node {

    getName(): string {
        return 'IMPORT';
    }
    
    getPathLiteral(): Nullable<StringLiteral> {
        return this.getChildren().find(
            (c): c is StringLiteral => c instanceof StringLiteral
        ) ?? null;
    }
}