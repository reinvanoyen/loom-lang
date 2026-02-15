import Node from '../parser/Node';
import SymbolTable from '../context/SymbolTable';

export default class Binder {

    /**
     * @private
     */
    private symbolTable: SymbolTable;

    /**
     * @param symbolTable
     */
    constructor(symbolTable: SymbolTable) {
        this.symbolTable = symbolTable;
    }
    /**
     *
     */
    public symbols(): SymbolTable {
        return this.symbolTable;
    }

    /**
     * @param ast
     */
    bind(ast: Node) {
        ast.bind(this);
    }
}