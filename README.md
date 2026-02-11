# loom-lang

```
class Button: button {

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
