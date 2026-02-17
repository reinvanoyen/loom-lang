import Node from './Node';
import Parser from './Parser';
import Class from './nodes/Class';
import TypeDeclaration from './nodes/TypeDeclaration';
import Namespace from './nodes/Namespace';
import Compiler from '../Compiler';
import ImportStatement from './nodes/ImportStatement';
import Binder from '../binder/Binder';
import TypeResolver from '../analyzer/TypeResolver';

export default class AstNode extends Node {

    getName(): string {
        return 'AST';
    }

    static parse(parser: Parser): boolean {
        let parsed = false;

        while(
            Namespace.parse(parser) ||
            ImportStatement.parse(parser) ||
            TypeDeclaration.parse(parser) ||
            Class.parse(parser)
        ) {
            parsed = true;
        }

        return parsed;
    }

    compile(compiler: Compiler) {
        this.getChildren().forEach(child => {
            child.compile(compiler);
        });
    }

    bind(binder: Binder) {
        this.getChildren().forEach(child => {
            child.bind(binder);
        });
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }
}