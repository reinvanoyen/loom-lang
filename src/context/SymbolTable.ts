import { Namespace } from '../types/namespace';
import Symbol from '../context/Symbol';

export default class SymbolTable {
    private symbols: Record<Namespace, Record<string, Symbol>> = {};
    private types: Record<string, Symbol> = {}; // global type space

    // --- types (global) ---
    public registerType(name: string, symbol: Symbol) {
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
        if (!this.symbols[ns]) this.symbols[ns] = {};
        this.symbols[ns][name] = symbol;
    }

    public hasSymbol(ns: Namespace, name: string) {
        return !!this.symbols[ns] && typeof this.symbols[ns][name] !== 'undefined';
    }

    public getSymbol(ns: Namespace, name: string): Symbol | null {
        return this.symbols[ns]?.[name] ?? null;
    }
}