import Node from '../Node';
import Compiler from '../../Compiler';

export default class ImportStatement extends Node {

    getName(): string {
        return 'IMPORT';
    }
    
    compile(compiler: Compiler) {
        // Import
    }
}