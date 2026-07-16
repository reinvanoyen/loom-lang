import AST from '@/compiler/parser/AST';
import Compilation from '@/compiler/Compilation';
import ImportStatement from '@/compiler/nodes/ImportStatement';

export default class ProgramBuilder {

    public build(compilation: Compilation): AST {

        // We make a program AST
        const program = new AST();
        const modules = compilation.getModulesInLoadOrder();

        // Loop through each module in order
        for (const module of modules.slice().reverse()) {

            for (const child of module.getAst().getChildren()) {

                // Skip import statements
                if (child instanceof ImportStatement) {
                    continue;
                }

                child.setParent(program);
                program.addChild(child);
            }
        }

        return program;
    }
}