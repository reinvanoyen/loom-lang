import Node from './Node';
import Symbol from './Symbol';
import SymbolTable from './SymbolTable';
import { Namespace } from './types/namespace';
import DiagReporter, { MessageCode } from './DiagReporter';
import EventBus from '../core/bus/EventBus';
import { TEventMap } from './types/bus';
import Class from '@/compiler/nodes/Class';
import { default as NamespaceNode } from '@/compiler/nodes/Namespace';
import ClassAugmentation from '@/compiler/nodes/ClassAugmentation';
import IdentifierType from '@/compiler/nodes/IdentifierType';
import TypeDeclaration from '@/compiler/nodes/TypeDeclaration';

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
    private reporter: DiagReporter;

    /**
     * @param events
     * @param reporter
     * @param symbolTable
     */
    constructor(events: EventBus<TEventMap>, reporter: DiagReporter, symbolTable: SymbolTable) {
        this.events = events;
        this.reporter = reporter;
        this.symbolTable = symbolTable;
    }

    /**
     * @param ast
     */
    public bind(ast: Node) {
        this.bindNode(ast);
    }

    /**
     * @param node
     * @private
     */
    private bindNode(node: Node) {
        if (node instanceof NamespaceNode) {
            this.bindNamespace(node);
        }

        if (node instanceof TypeDeclaration) {
            this.bindTypeDeclaration(node);
        }

        if (node instanceof Class) {
            this.bindClass(node);
        }

        if (node instanceof ClassAugmentation) {
            this.bindClassAugmentation(node);
        }

        if (node instanceof IdentifierType) {
            this.bindIdentifierType(node);
        }

        for (const child of node.getChildren()) {
            this.bindNode(child);
        }
    }

    /**
     * @param node
     * @private
     */
    private bindTypeDeclaration(node: TypeDeclaration) {
        const id = node.getId();
        const value = node.getValue();

        if (id && value) {
            const symbol = new Symbol('type', id);
            node.setSymbol(symbol);
            this.addType(value, symbol);
        }
    }

    /**
     * @param node
     * @private
     */
    private bindNamespace(node: NamespaceNode) {
        const namespaceName = node.getValue();

        if (! namespaceName) {
            return;
        }

        this.namespace(namespaceName);
    }

    /**
     * @param node
     * @private
     */
    private bindClass(node: Class) {
        const id = node.getId();
        const className = node.getValue();

        if (id && className) {
            const symbol = new Symbol('class', id);
            node.setSymbol(symbol);
            this.add(className, symbol);
        }
    }

    /**
     * @param node
     * @private
     */
    private bindClassAugmentation(node: ClassAugmentation) {
        const id = node.getId();
        const value = node.getValue();
        const targetNamespace = node.getStringAttribute('targetNamespace');

        if (!id) {
            // todo - do we need to report this?
            return;
        }

        if (!value) {
            // todo - do we need to report this?
            return;
        }

        const symbol = targetNamespace ? this.getInNamespace(targetNamespace, value) : this.get(value);

        if (! symbol) {
            // todo - do we need to report this?
            return;
        }

        node.setSymbol(symbol);
    }

    /**
     * @param node
     * @private
     */
    private bindIdentifierType(node: IdentifierType) {

        const value = node.getValue();

        if (! value) {
            // todo - do we need to report this?
            return;
        }

        if (value === 'string') {
            // todo - do we need to report this?
            return;
        }

        const symbol = this.getType(value);

        if (! symbol) {
            // todo - do we need to report this?
            return;
        }

        node.setSymbol(symbol);
    }

    /**
     * @param ns
     */
    public namespace(ns: Namespace) {
        this.currentNamespace = ns;
    }

    /**
     * @param name
     * @param symbol
     */
    private add(name: string, symbol: Symbol) {
        if (this.symbolTable.hasSymbol(this.currentNamespace, name)) {
            this.reporter.error({
                code: MessageCode.E_DUPLICATE_SYMBOL,
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
    private get(name: string) {
        if (!this.symbolTable.hasSymbol(this.currentNamespace, name)) {
            this.reporter.error({
                code: MessageCode.E_UNDEFINED_SYMBOL,
                message: `Binding error: couldn't get symbol with name ${name}`
            });
        }
        return this.symbolTable.getSymbol(this.currentNamespace, name);
    }

    /**
     * @param ns
     * @param name
     * @private
     */
    private getInNamespace(ns: Namespace, name: string): Symbol | null {
        if (!this.symbolTable.hasSymbol(ns, name)) {
            this.reporter.error({
                code: MessageCode.E_UNDEFINED_SYMBOL,
                message: `Binding error: couldn't find symbol '${ns}.${name}'`,
            });
            return null;
        }

        return this.symbolTable.getSymbol(ns, name)!;
    }


    /**
     * @param name
     * @param symbol
     */
    private addType(name: string, symbol: Symbol) {
        if (this.symbolTable.hasType(name)) {
            this.reporter.error({
                code: MessageCode.E_DUPLICATE_SYMBOL,
                message: `Binding error: type '${name}' already exists`
            });
            return;
        }
        this.events.emit('symbolBind', { name, symbol });
        this.symbolTable.registerType(name, symbol);
    }

    private getType(name: string) {
        return this.symbolTable.getType(name);
    }
}