import Node from '../parser/Node';
import OutputBuffer from './OutputBuffer';
import SymbolTable from '../context/SymbolTable';

export default class Compiler {
    /**
     * @private
     */
    private readonly symbolTable: SymbolTable;

    /**
     * @private
     */
    private readonly buffer: OutputBuffer;

    /**
     *
     */
    constructor(outputBuffer: OutputBuffer) {
        this.buffer = outputBuffer;
    }

    /**
     *
     */
    public symbols(): SymbolTable {
        return this.symbolTable;
    }

    /**
     *
     * @param string
     */
    write(string: string) {
        this.buffer.writeBody(string);
    }

    writeLine(string: string) {
        this.buffer.writeBody('\n'+string);
    }

    compile(ast: Node) {
        ast.compile(this);
        return this.buffer.render();
    }
}