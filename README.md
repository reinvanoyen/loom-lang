# LOOM
## The CSS language for battle-tested design systems

Confirmed:
```
namespace ui;

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

Ideating:
```
class Button {

	@size small | medium | large = medium
	@tone neutral | danger | success = neutral

	padding: 5px 10px;
	background-color: #f0f0f0;

	if @size small {
		padding: 3px;
	}

	if @size medium {
		padding: 5px;
	}

	slot icon {
		width: 1rem;
		height: 1rem;

		if @size large {
			width: 2rem;
			height: 2rem;
		}
	}

	slot text: span {
		text-transform: uppercase;
	}

	state focus {
		border: 1px solid red;
		icon.opacity: .4;
	}
}
```

```
class Link extends Button {

	@behavior button | link = button

	if @behavior link {
		padding: 0;
		text-decoration: underline;

		state.hover.text-decoration: none;
	}
}
```
