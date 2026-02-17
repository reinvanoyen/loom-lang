import Node from '../parser/Node';
import Symbol from './Symbol';
import SymbolTable from '../binder/SymbolTable';
import { Namespace } from '../types/namespace';
import Reporter from '../diagnostics/Reporter';
import EventBus from '../bus/EventBus';
import { TEventMap } from '../types/bus';

export default class Binder {
    /**
     * @private
     */
    private currentNamespace: Namespace = 'global';

    /**
     * @private
     */
    private symbolTable: SymbolTable;


    /**
     * @private
     */
    private events: EventBus<TEventMap>

    /**
     * @private
     */
    private reporter: Reporter;

    /**
     * @param events
     * @param reporter
     * @param symbolTable
     */
    constructor(events: EventBus<TEventMap>, reporter: Reporter, symbolTable: SymbolTable) {
        this.events = events;
        this.reporter = reporter;
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
            this.reporter.report({
                severity: 'error',
                message: `Binding error: ${name} already exists`
            });
            return;
        }
        this.events.emit('symbolBind', { name, symbol });
        this.symbolTable.registerSymbol(this.currentNamespace, name, symbol);
    }

    /**
     * @param name
     */
    get(name: string) {
        if (!this.symbolTable.hasSymbol(this.currentNamespace, name)) {
            this.reporter.report({
                severity: 'error',
                message: `Binding error: couldn't get symbol with name ${name}`
            });
        }
        return this.symbolTable.getSymbol(this.currentNamespace, name);
    }

    /**
     * @param name
     * @param symbol
     */
    addType(name: string, symbol: Symbol) {
        if (this.symbolTable.hasType(name)) {
            this.reporter.report({
                severity: 'error',
                message: `Binding error: type '${name}' already exists`
            });
            return;
        }
        this.events.emit('symbolBind', { name, symbol });
        this.symbolTable.registerType(name, symbol);
    }

    getType(name: string) {
        return this.symbolTable.getType(name);
    }
}