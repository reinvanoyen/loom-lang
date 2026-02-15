import Node from '../parser/Node';
import Symbol from './Symbol';
import SymbolTable from '../context/SymbolTable';
import { Namespace } from '../types/namespace';

export default class Binder {
    /**
     * @private
     */
    private symbolTable: SymbolTable;

    /**
     * @private
     */
    private currentNamespace: Namespace = 'global';

    /**
     * @param symbolTable
     */
    constructor(symbolTable: SymbolTable) {
        this.symbolTable = symbolTable;
    }

    /**
     * @param ast
     */
    bind(ast: Node) {
        ast.bind(this);
    }

    /**
     * @param ns
     */
    namespace(ns: Namespace) {
        this.currentNamespace = ns;
    }

    /**
     * @param name
     * @param symbol
     */
    add(name: string, symbol: Symbol) {
        if (this.symbolTable.hasSymbol(this.currentNamespace, name)) {
            throw new Error(`Binding error: ${name} already exists`);
        }
        this.symbolTable.registerSymbol(this.currentNamespace, name, symbol);
    }

    /**
     * @param name
     */
    get(name: string) {
        if (!this.symbolTable.hasSymbol(this.currentNamespace, name)) {
            throw new Error(`Binding error: couldn't get symbol with name ${name}`);
        }
        return this.symbolTable.getSymbol(this.currentNamespace, name);
    }

    // GLOBAL TYPE SPACE
    addType(name: string, symbol: Symbol) {
        if (this.symbolTable.hasType(name)) {
            throw new Error(`Binding error: type '${name}' already exists`);
        }
        // optional metadata:
        symbol.setNamespace('global'); // or store declaredNamespace separately
        this.symbolTable.registerType(name, symbol);
    }

    getType(name: string) {
        return this.symbolTable.getType(name);
    }
}