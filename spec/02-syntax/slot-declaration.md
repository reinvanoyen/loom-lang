# Slot Declaration

```
SlotDeclaration ::
    "slot" Identifier ";"
```

Allowed only inside a `class` body.

## Example:
```
class Nav {
    slot item;
}
```

## Invalid Contexts:
* slot inside augment class
* slot outside a class body

## Diagnostics:
* E_SLOT_INVALID_CONTEXT
* E_SLOT_AUGMENT_FORBIDDEN