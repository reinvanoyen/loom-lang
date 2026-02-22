import AST from './AST';
import DiagReporter from './DiagReporter';
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
    private reporter: DiagReporter;

    /**
     * @param events
     * @param reporter
     */
    constructor(events: EventBus<TEventMap>, reporter: DiagReporter) {
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