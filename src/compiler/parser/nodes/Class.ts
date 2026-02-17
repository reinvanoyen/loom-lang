import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import VariantDeclaration from './VariantDeclaration';
import SlotDeclaration from './SlotDeclaration';
import StyleBlock from './StyleBlock';
import Binder from '../../binder/Binder';
import Compiler from '../../Compiler';
import Symbol from '../../binder/Symbol';
import TypeResolver from '../../analyzer/TypeResolver';

export default class Class extends Node {

    getName(): string {
        return 'CLASS';
    }

    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT, 'class')) {

            if (parser.expect(TokenType.IDENT)) {
                parser.insert(new Class(parser.getCurrentValue()));
                parser.in();
                parser.advance();

                if (parser.skipWithValue(TokenType.IDENT, 'extends')) {
                    if (parser.expect(TokenType.IDENT)) {
                        parser.setAttribute('extends', parser.getCurrentValue());
                        parser.advance();
                    }
                }

                if (parser.expectWithValue(TokenType.SYMBOL, '{')) {
                    parser.advance();
                }

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
            }

            return true;
        }

        return false;
    }

    bind(binder: Binder) {
        const id = this.getId();
        const value = this.getValue();

        if (id && value) {
            const symbol = new Symbol('class', id);
            this.setSymbol(symbol);
            binder.add(value, symbol);
        }
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
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