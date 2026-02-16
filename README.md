<p>
  <a href="https://github.com/reinvanoyen/loom-lang">
    <img width="200" src="https://raw.githubusercontent.com/reinvanoyen/loom-lang/main/logo.png">
  </a>
</p>
# Loom
## Contractual CSS for teams making robust design systems
https://dev.to/reinvanoyen/experimenting-with-the-idea-of-a-typescript-for-css-3i8l

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
* Upgrade Symbol with namespace.
* Implement TypeChecker: followRefs + isAssignable, then wire it into VariantDeclaration.check()

### Syntax / grammar ideas
```
class Link extends Button {
	@behavior 'button' | 'link' = 'button'
  
  @size 'medium' {%
		color: blue;
		background-color: red;
	%}
  
  @behavior 'link' {%
		color: blue;
		background-color: red;
	%}
}
```
