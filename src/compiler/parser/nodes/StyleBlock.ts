import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Compiler from '../../Compiler';

export default class StyleBlock extends Node {

    getName(): string {
        return 'STYLE';
    }

    /**
     * @param parser
     */
    static parse(parser: Parser): boolean {
        if (parser.accept(TokenType.RAW_BLOCK)) {
            parser.insert(new StyleBlock());
            parser.in();
            parser.setAttribute('contents', parser.getCurrentValue());
            parser.advance();
            parser.out();

            return true;
        }

        return false;
    }

    compile(compiler: Compiler) {
        const contents = this.getAttribute('contents');

        if (typeof contents === 'string') {
            compiler.writeLine('\t'+contents.trim());
        }
    }
}