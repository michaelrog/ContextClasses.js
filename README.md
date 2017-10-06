# ContextSizes

_A hacky little script for facilitating component-first CSS_


```js

let profiles = [

    {
        selector: '[data-cs-watch-self]',
        watch: 'self',
        sizes: [
            {
                minWidth: 0,
                maxWidth: 160,
                class: 'is_tiny'
            },
            {
                minWidth: 600,
                class: 'is_bigish'
            }
        ]
    },

    {
        selector: '[data-cs-watch-parent]',
        watch: 'parent',
        sizes: [
            {
                minWidth: 0,
                maxWidth: 160,
                class: 'in_tiny'
            },
            {
                minWidth: 600,
                class: 'in_bigish'
            }
        ]
    },

];
 
ContextSizes.init(profiles);

```