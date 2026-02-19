import Node from '../Node';
import Compiler from '../../Compiler';

export default class SlotDeclaration extends Node {

    getName(): string {
        return 'SLOT_DECL';
    }

    compile(compiler: Compiler) {
        // todo - register the slot on runtime
        //compiler.writeLine(`.${this.getValue()} {}`);
    }
}