import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import VariantDeclaration from './VariantDeclaration';
import SlotDeclaration from './SlotDeclaration';
import StyleBlock from './StyleBlock';
import Binder from '../../context/Binder';
import Compiler from '../../compiler/Compiler';

export default class Class extends Node {

    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT, 'class')) {

            if (parser.expect(TokenType.IDENT)) {
                parser.insert(new Class(parser.getCurrentValue()));
                parser.traverseUp();
                parser.advance();
            }

            if (parser.skipWithValue(TokenType.IDENT, 'extends')) {
                parser.expect(TokenType.IDENT);
                parser.setAttribute('extends', parser.getCurrentValue());
                parser.advance();
            }

            parser.expectWithValue(TokenType.SYMBOL, '{');
            parser.advance();

            // Parse class body
            while(
                VariantDeclaration.parse(parser) ||
                SlotDeclaration.parse(parser) ||
                StyleBlock.parse(parser)
            );

            if (parser.expectWithValue(TokenType.SYMBOL, '}')) {
                parser.out();
                parser.advance();
            }

            return true;
        }

        return false;
    }

    bind(binder: Binder) {
        // Register the class on runtime
        binder.symbols().registerClass(this.getValue());
    }

    compile(compiler: Compiler) {

        /*
        // Get current namespace
        const namespace = compiler.symbols().getNamespace();

        // Build classname
        const className = `${namespace ? namespace+'-' : '' }${this.getValue()}`;

        // Write CSS :)
        compiler.writeLine(`.${className} {`);

        this.getChildren().forEach(child => {
            child.compile(compiler);
        });

        compiler.writeLine('}');
        */
    }
}