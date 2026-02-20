# Slot Specification

## 1. Introduction
A slot declares a named sub-target of a class.

Slots:
* Define structural sub-parts of a class.
* Emit a derived selector based on the owning class selector. 
* Are part of the public structural surface of a class.
* Are inherited.
* Are sealed against augmentation.
* Slots are not dynamic and do not depend on import order.