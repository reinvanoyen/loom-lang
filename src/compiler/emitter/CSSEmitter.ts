import EmissionModel from '@/compiler/emitter/EmissionModel';
import OutputBuffer from '@/compiler/emitter/OutputBuffer';
import { createClassSelector, createSlotSelector } from '@/compiler/emitter/selector-creators';

export default class CSSEmitter {

    /**
     * @private
     */
    private output: OutputBuffer;

    /**
     *
     */
    constructor() {
        this.output = new OutputBuffer();
    }

    /**
     * @param model
     */
    public emit(model: EmissionModel) {

        const classes = model.getClasses();

        classes.forEach(classEmission => {

            this.writeRule(
                createClassSelector(classEmission.namespace, classEmission.name),
                classEmission.classStyles
            );

            classEmission.slots.forEach(slotName => {
                this.writeRule(
                    createSlotSelector(classEmission.namespace, classEmission.name, slotName),
                    classEmission.slotStyles.get(slotName) ?? []
                );
            });
        });

        return this.output.render();
    }

    /**
     * @param selector
     * @param bodies
     * @private
     */
    private writeRule(selector: string, bodies: string[]) {
        const css = bodies.map(b => b.trim()).filter(Boolean).join('\n');

        if (!css) {
            this.output.write(`${selector} {}\n`);
            return;
        }

        const indented = css.split('\n').map(line => `  ${line.trim()}`).join('\n');
        this.output.write(`${selector} {\n${indented}\n}\n`);
    }
}