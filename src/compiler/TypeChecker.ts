import AST from './AST';
import Diagnostics from './Diagnostics';
import TypeTable from './TypeTable';
import { ResolvedType } from './types/analyzer';
import EventBus from '../core/bus/EventBus';
import { TEventMap } from './types/bus';

export default class TypeChecker {
    /**
     * @private
     */
    private events: EventBus<TEventMap>;

    /**
     * @private
     */
    private reporter: Diagnostics;

    /**
     * @param events
     * @param reporter
     */
    constructor(events: EventBus<TEventMap>, reporter: Diagnostics) {
        this.events = events;
        this.reporter = reporter;
    }

    /**
     * @param ast
     * @param typeTable
     */
    check(ast: AST, typeTable: TypeTable) {
        this.events.emit('startTypeChecking', { ast, typeTable });
        ast.check(this, typeTable);
    }

    /**
     * @param type
     * @param value
     */
    isAssignable(type: ResolvedType, value: string) {
        return true;
    }
}