export function createClassSelector(ns: string, className: string) {
    return `.${ns}-${className}`;
}

export function createSlotSelector(ns: string, className: string, slotName: string) {
    return `${createClassSelector(ns, className)}__${slotName}`;
}