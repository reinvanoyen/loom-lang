# LOOM
## The CSS language for teams making design systems

### Confirmed syntax (so far):
```
namespace ui;

import 'Button.loom';
import 'types.loom';

type Size: 'small' | 'medium' | 'large';
type Intent: 'neutral' | 'danger' | 'warning' | 'success';

class Button {

	@size: Size = 'medium';
	@intent: Intent | 'flashy' = 'flashy';

	slot icon;
	slot link;

	{%
		color: blue;
		background-color: red;
	%}
}

class Link extends Button {
	@underline: 'yes' | 'no' = 'yes';
}

class Label {
	@intent: Intent;
}
```
### Mental notes / Todos
* Implement DiagnosticsResult.report() + all() and use it everywhere instead of throwing for user errors.
* Upgrade Symbol (name, kind, namespace, getters, stable id).
* Split binder/symbol-table APIs into defineType vs defineInNamespace.
* Change TypeTable to map symbolId → ResolvedType, and add getBySymbol.
* Implement TypeChecker: followRefs + isAssignable, then wire it into VariantDeclaration.check() (and add 3–5 example files as regression tests).

### Syntax / grammar ideas
```
class Link extends Button {
	@behavior 'button' | 'link' = 'button'
}
```
