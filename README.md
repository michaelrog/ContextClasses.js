# ContextSizes

_A hacky little script for facilitating component-first CSS_


This script can assign classes to elements based on their respective sizes. This allows more flexible styling than the traditional constraints of viewport-based responsive CSS.


## How does this work?

The script listens for various events--like when the size of the viewport changes--and then assigns classes to the watched elements based on their "profile" configuration settings.


## Getting Started

Add the script to your website before the closing `</body>` tag. Then pass in your profile settings.

### Usage Example

```html
...
    <!-- include the script -->
    <script src="/dist/ContextSizes.js"></script>
    
    <!-- instantiate the script -->
    <script>
        //set up our profiles
        var profiles = [
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
            }
        ];
        
        //start watching for changes
        ContextSizes.init(profiles);
    </script>
</body>
</html>
```

In the above example, we select all elements with the `'[data-cs-watch-self]'` selector and give them a class of `'is_tiny'` when they are between `0` and `160` pixels wide, or the class `'is_bigish'` when they are over `600` pixels wide. We then do something similar for the `'[data-cs-watch-parent]'` elements, except we assign them classes based on their respective parent's size.



## Methods

### ContextSizes.init()
 
`ContextSizes.init(profiles, options);`

#### profiles (array)

Profiles should be an array of objects. The objects can have the following keys:

* `selector` (string) - Any valid CSS selector. Can be a class `'.foo'`, an id `'#foo'`, an attribute `'[data-foo]'`, etc.
* `watch` (string) - Can be `'self'`(default) or `'parent'`. Whether we should apply the classes based on the selector's size (`'self'`) or the selector's parent (`'parent'`) size. 
* `sizes` - An array of objects with the following keys:
    * `class` (string) _required_ - The class to assign when the element meets the size criteria.
    * `minWidth` (int) - The minimum width in pixels.
    * `maxWidth` (int) - The maximum width in pixels.
    * `minHeight` (int) - The minimum height in pixels.
    * `maxHeight` (int) - The maximum height in pixels.
* `live` (bool) - Can be `true` or `false`(default). If set to `true` the script will watch the DOM for any new elements that match the selector. This can be useful when working with reactive frameworks or AJAX that adds new elements. This feature is well [supported](http://caniuse.com/#feat=mutationobserver) amongst modern browsers, but keep in mind that IE10 and below are not supported.


#### options (object)

The `options` parameter is completely optional.

* `sizesDataAttr` (string) _optional_ - If specified, this will give all of the watched elements an attribute that will show their computed size. This can be very useful for determining the dimensions you want to set up for your breakpoints. For example, if you pass in `{sizesAtrr: 'size'}`, then each of your elements will get a `data-size` attribute that displays their dimensions (eg `data-size="300x200"`). The attribute will be updated every time a watcher update is triggered.
* `watchContent` (bool) _optional_ - Can be `true` or `false`(default). The browser only triggers resize events when the window width or height changes. It does not trigger resize events if the content size changes. Unfortunately there are no browser events for content size changes, so the only way to watch for this is by polling. This option is useful if you are dynamically hiding and showing content on your page, and you need your elements to update when that happens. Alternatively, you can simply call the `ContextSizes.update();` method as needed and avoid polling altogether.

### ContextSizes.update()

`ContextSizes.update();`

Used to manually trigger a content resize. You will probably never need this, but it is available if you need it.



## License

MIT License



## Major Contributions

* [@aaronwaldon](https://github.com/aaronwaldon) - Added the `live` observer, the `watchContent` functionality, the `sizesDataAttr` option, and fleshed out the documentation.