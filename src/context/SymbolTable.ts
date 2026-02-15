import Symbol from './Symbol';
import { Nullable } from '../types/nullable';
import { Namespace } from '../types/namespace';

export default class SymbolTable {
    /**
     * @private
     */
    private symbols: Record<Namespace, Record<string, Symbol>> = {};

    /**
     * @param ns
     * @param name
     * @param symbol
     */
    public registerSymbol(ns: Namespace, name: string, symbol: Symbol) {
        if (! this.symbols[ns]) {
            this.symbols[ns] = {};
        }
        this.symbols[ns][name] = symbol;
    }

    /**
     * @param ns
     * @param name
     */
    public hasSymbol(ns: Namespace, name: string) {
        if (! this.symbols[ns]) {
            return false;
        }

        if (! this.symbols[ns][name]) {
            return false;
        }

        return true;
    }

    /**
     * @param ns
     * @param name
     */
    public getSymbol(ns: Namespace, name: string): Nullable<Symbol> {
        if (this.hasSymbol(ns, name)) {
            return this.symbols[ns][name];
        }
        return null;
    }
}