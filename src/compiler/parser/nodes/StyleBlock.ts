import Node from '../Node';
import Compiler from '../../Compiler';

export default class StyleBlock extends Node {

    getName(): string {
        return 'STYLE';
    }
    
    compile(compiler: Compiler) {
        /*
        const contents = this.getAttribute('contents');

        if (typeof contents === 'string') {
            compiler.writeLine('\t'+contents.trim());
        }
         */
    }
}