import { Namespace } from '../types/namespace';
import Symbol from './Symbol';
import chalk from 'chalk';
import IdAllocator from '../../core/allocators/IdAllocator';

export default class SymbolTable {
    /**
     * @private
     */
    private idAlloc: IdAllocator;

    /**
     * @private
     */
    private symbols: Record<Namespace, Record<string, Symbol>> = {};

    /**
     * @private
     */
    private types: Record<string, Symbol> = {}; // global type space

    /**
     * @param idAlloc
     */
    constructor(idAlloc: IdAllocator) {
        this.idAlloc = idAlloc;
    }

    // --- types (global) ---
    public registerType(name: string, symbol: Symbol) {
        symbol.setId(this.idAlloc.allocate());
        this.types[name] = symbol;
    }

    public hasType(name: string) {
        return typeof this.types[name] !== 'undefined';
    }

    public getType(name: string): Symbol | null {
        return this.types[name] ?? null;
    }

    // --- values/classes (namespaced) ---
    public registerSymbol(ns: Namespace, name: string, symbol: Symbol) {

        // Set the namespace of the symbol before storing
        symbol.setNamespace(ns);
        symbol.setId(this.idAlloc.allocate());

        if (!this.symbols[ns]) this.symbols[ns] = {};
        this.symbols[ns][name] = symbol;
    }

    public hasSymbol(ns: Namespace, name: string) {
        return !!this.symbols[ns] && typeof this.symbols[ns][name] !== 'undefined';
    }

    public getSymbol(ns: Namespace, name: string): Symbol | null {
        return this.symbols[ns]?.[name] ?? null;
    }

    public print() {
        const namespaces = Object.keys(this.symbols);
        namespaces.forEach(ns => {
            console.log(chalk.bgCyan(`NS: ${ns}`));
            console.table(this.symbols[ns]);
        });

        console.log(chalk.bgCyan('GLOBAL TYPES'));
        console.table(this.types);
    }
}