import Node from '../Node';
import Binder from '../../binder/Binder';
import Compiler from '../../Compiler';
import Symbol from '../../binder/Symbol';
import TypeResolver from '../../analyzer/TypeResolver';

export default class Class extends Node {

    getName(): string {
        return 'CLASS';
    }

    bind(binder: Binder) {
        const id = this.getId();
        const value = this.getValue();

        if (id && value) {
            const symbol = new Symbol('class', id);
            this.setSymbol(symbol);
            binder.add(value, symbol);
        }
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }

    compile(compiler: Compiler) {

        /*
        // Get current namespace
        const namespace = compiler.symbols().getNamespace();

        // Build classname
        const className = `${namespace ? namespace+'-' : '' }${this.getValue()}`;

        // Write CSS :)
        compiler.writeLine(`.${className} {`);

        this.getChildren().forEach(child => {
            child.compile(compiler);
        });

        compiler.writeLine('}');
        */
    }
}