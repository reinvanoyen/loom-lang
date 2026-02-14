import Node from '../parser/Node';
import OutputBuffer from './OutputBuffer';
import Runtime from '../runtime/Runtime';

export default class Compiler {
    /**
     * @private
     */
    private readonly runtime: Runtime;

    /**
     * @private
     */
    private readonly buffer: OutputBuffer;

    /**
     *
     */
    constructor(runtime: Runtime) {
        this.runtime = runtime;
        this.buffer = new OutputBuffer();
    }

    public getRuntime(): Runtime {
        return this.runtime;
    }

    /**
     *
     * @param string
     */
    write(string: string) {
        this.buffer.writeBody(string);
    }

    writeLine(string: string) {
        this.buffer.writeBody('\n'+string);
    }

    compile(ast: Node) {
        ast.compile(this);
        return this.buffer.render();
    }
}