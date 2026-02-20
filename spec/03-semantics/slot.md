# Slot semantics

## Ownership
A slot belongs to exactly one `class` symbol.

If `namespace N; class C { slot s; }`, then:

* Slot s belongs to symbol N::C.

Slots are uniquely identified by:
`(namespace, class name, slot name)`

## Emission
If:
* N = namespace
* C = class name
* S = slot name

Then the emitted selector is:
`.<N>-<C>__<S>`

### Example
```
namespace ui;

class Button {
    slot icon;
}
```
Emits:
```
.ui-Button {}
.ui-Button__icon {}
```

## Inheritance
Slots are inherited.

If:
```
class Link extends Button {}
```
Then:
* Link includes all slots from Button.
* Slots are re-emitted under the derived class symbol:
```
.ui-Link__icon
```
Inheritance rules:

Duplicate slot names across inheritance chain → error.

### Diagnostics
* `E_SLOT_DUPLICATE`

## Augmentation
Slots are sealed.

augment class C:
* Must not introduce new slots.
* Must not redeclare existing slots.

Attempting either is a compile-time error.

### Diagnostics:
* `E_SLOT_AUGMENT_FORBIDDEN`

## Slot targeting

Slots may be referenced relative 
to their owning class using:
```
slot name {%
    margin-right: 1rem;
%}
```

### Example:
```
class Button {
    slot icon;

    slot icon {%
        margin-right: 1rem;
    %}
}
```

Rules:
* The referenced slot must exist on the resolved class symbol.
* Referencing an unknown slot is an error.

### Diagnostic:
* `E_SLOT_UNKNOWN`