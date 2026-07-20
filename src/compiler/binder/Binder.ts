import Node from '../parser/Node';
import Symbol from './Symbol';
import SymbolTable from './SymbolTable';
import { Namespace } from '../types/namespace';
import { MessageCode } from '../Diagnostics';
import Class from '@/compiler/nodes/Class';
import { default as NamespaceNode } from '@/compiler/nodes/Namespace';
import ClassAugmentation from '@/compiler/nodes/ClassAugmentation';
import IdentifierType from '@/compiler/nodes/IdentifierType';
import TypeDeclaration from '@/compiler/nodes/TypeDeclaration';
import CompilationContext from '@/compiler/CompilationContext';
import ClassReference from '@/compiler/nodes/ClassReference';

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
    private context: CompilationContext;

    /**
     * @param symbolTable
     * @param context
     */
    constructor(symbolTable: SymbolTable, context: CompilationContext) {
        this.symbolTable = symbolTable;
        this.context = context;
    }

    /**
     * @param ast
     */
    public bind(ast: Node) {
        // Phase 1: declarations
        this.currentNamespace = 'global';
        this.walk(ast, 'declarations');

        // Phase 2: references
        this.currentNamespace = 'global';
        this.walk(ast, 'references');
    }

    /**
     * @param node
     * @param phase
     * @private
     */
    private walk(node: Node, phase: 'declarations' | 'references') {
        if (node instanceof NamespaceNode) {
            this.bindNamespace(node); // always — both passes need correct NS
        }

        if (phase === 'declarations') {
            if (node instanceof TypeDeclaration) {
                this.bindTypeDeclaration(node);
            }
            if (node instanceof Class) {
                this.bindClassDeclaration(node);
            }
        } else if (phase === 'references') {
            if (node instanceof Class) {
                this.bindClassReferences(node);
            }
            if (node instanceof ClassAugmentation) {
                this.bindClassAugmentation(node);
            }
            if (node instanceof IdentifierType) {
                this.bindIdentifierType(node);
            }
        }

        for (const child of node.getChildren()) {
            this.walk(child, phase);
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

        this.setCurrentNamespace(namespaceName);
    }

    /**
     * @param node
     * @private
     */
    private bindClassDeclaration(node: Class) {

        const id = node.getId();
        const className = node.getValue();
        if (!id || !className) return;
        const symbol = new Symbol('class', id);
        node.setSymbol(symbol);
        this.add(className, symbol);
    }

    /**
     * @param node
     * @private
     */
    private bindClassReferences(node: Class) {
        const parentRefNode = node.getAttribute('parentRef');

        if (!(parentRefNode instanceof ClassReference)) {
            return;
        }

        const parentClassName = parentRefNode.getValue();

        if (!parentClassName) {
            return;
        }

        const parentClassNamespace = parentRefNode.getNamespace() || this.currentNamespace;

        const parentSymbol = this.getInNamespace(parentClassNamespace, parentClassName);

        if (! parentSymbol) {
            this.context.diagnostics.error({
                code: MessageCode.E_UNDEFINED_SYMBOL,
                message: `Binding error: couldn't find symbol '${parentClassNamespace}.${parentClassName}'`,
                span: parentRefNode.getSpan() || undefined,
            });
            return;
        }

        if (! parentSymbol.isType('class')) {
            this.context.diagnostics.error({
                code: MessageCode.E_EXPECTED_CLASS,
                message: `Expected class, got ${parentSymbol.getType()} (${parentClassName} in namespace ${parentClassNamespace})`,
            });
            return;
        }

        // Register the symbol as parent on the node
        node.setSymbol(parentSymbol, 'parent');
    }

    /**
     * @param node
     * @private
     */
    private bindClassAugmentation(node: ClassAugmentation) {
        const id = node.getId();

        if (!id) {
            return;
        }

        const classRef = node.getAttribute('classRef');

        if (!(classRef instanceof ClassReference)) {
            return;
        }

        const className = classRef.getValue();

        if (!className) {
            return;
        }

        const namespace = classRef.getNamespace() || this.currentNamespace;
        const symbol = namespace ? this.getInNamespace(namespace, className) : this.get(className);

        if (! symbol) {
            this.context.diagnostics.error({
                code: MessageCode.E_UNDEFINED_SYMBOL,
                message: `Binding error: couldn't find symbol '${namespace}.${className}'`,
                span: classRef.getSpan() || undefined,
            });
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
    public setCurrentNamespace(ns: Namespace) {
        this.currentNamespace = ns;
    }

    /**
     * @param name
     * @param symbol
     */
    private add(name: string, symbol: Symbol) {
        if (this.symbolTable.hasSymbol(this.currentNamespace, name)) {
            this.context.diagnostics.error({
                code: MessageCode.E_DUPLICATE_SYMBOL,
                message: `Binding error: ${name} already exists`
            });
            return;
        }
        this.context.eventBus.emit('symbolBind', { name, symbol });
        this.symbolTable.registerSymbol(this.currentNamespace, name, symbol);
    }

    /**
     * @param name
     */
    private get(name: string) {
        if (!this.symbolTable.hasSymbol(this.currentNamespace, name)) {
            this.context.diagnostics.error({
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
        return this.symbolTable.getSymbol(ns, name)!;
    }

    /**
     * @param name
     * @param symbol
     */
    private addType(name: string, symbol: Symbol) {
        if (this.symbolTable.hasType(name)) {
            this.context.diagnostics.error({
                code: MessageCode.E_DUPLICATE_SYMBOL,
                message: `Binding error: type '${name}' already exists`
            });
            return;
        }
        this.context.eventBus.emit('symbolBind', { name, symbol });
        this.symbolTable.registerType(name, symbol);
    }

    /**
     * @param name
     * @private
     */
    private getType(name: string) {
        return this.symbolTable.getType(name);
    }
}