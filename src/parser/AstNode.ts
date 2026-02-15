import Node from './Node';
import Parser from './Parser';
import Class from './nodes/Class';
import TypeDeclaration from './nodes/TypeDeclaration';
import Namespace from './nodes/Namespace';
import Compiler from '../compiler/Compiler';
import ImportStatement from './nodes/ImportStatement';
import Binder from '../binder/Binder';
import TypeResolver from '../analyzer/TypeResolver';

export default class AstNode extends Node {

    static parse(parser: Parser): boolean {
        
        while(
            Namespace.parse(parser) ||
            ImportStatement.parse(parser) ||
            TypeDeclaration.parse(parser) ||
            Class.parse(parser)
        );

        return true;
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