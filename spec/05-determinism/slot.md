# Slot determinism

The following invariants apply:
* The set of slots of a class is determined solely by:
  * Its primary declaration
  * Its inheritance chain
* Import order does not affect slot resolution.
* Augments cannot introduce slots; therefore the emitted selector surface of a class is stable across module composition. 
* Duplicate slot declarations in the inheritance chain are compile-time errors.

Therefore, the slot set of a class is globally deterministic.