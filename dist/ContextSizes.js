'use strict';

/*! ContextSizes
 * https://github.com/michaelrog/ContextSizes.js
 * @licence MIT
 */
(function () {

    /**
     * Fix for IE to get NodeList.forEach to work as expected.
     * 
     * @see http://tips.tutorialhorizon.com/2017/01/06/object-doesnt-support-property-or-method-foreach/
     */
    (function () {
        if (typeof NodeList.prototype.forEach === "function") return false;
        NodeList.prototype.forEach = Array.prototype.forEach;
    })();

    /**
     * Helper Classes
     *
     * @namespace
     * @type {{addClass: addClass, removeClass: removeClass, matchesSelector: matchesSelector}}
     */
    var ContextSizesHelpers = {
        /**
         * Adds a class.
         *
         * @param {Node} el The element.
         * @param {string} className The class name to add.
         */
        addClass: function addClass(el, className) {
            if (el.classList) {
                el.classList.add(className);
            } else {
                el.className += ' ' + className;
            }
        },

        /**
         * Removes a class.
         *
         * @param {Node} el The element.
         * @param {string} className The class name to remove.
         */
        removeClass: function removeClass(el, className) {
            if (el.classList) {
                el.classList.remove(className);
            } else {
                el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        },

        /**
         * Determines whether or not the given element matches the given selector.
         *
         * @param {Node} element The element.
         * @param {string} selector The selector.
         * @returns {boolean} Whether or not the given element matches the given selector.
         */
        matchesSelector: function matchesSelector(element, selector) {
            var matchesSelector = element.matches || element.matchesSelector || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector || null;
            return matchesSelector ? matchesSelector.call(element, selector) : false;
        },

        /**
         * Tries to get requestAnimationFrame with prefixed fallbacks.
         *
         * @returns {*}
         */
        requestAnimationFrame: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || null,

        /**
         * Tries to get cancelAnimationFrame with prefixed fallbacks.
         * @returns {*}
         */
        cancelAnimationFrame: window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame || window.oCancelAnimationFrame || null
    };

    /**
     * Handles content resizing.
     * c.f. https://developer.mozilla.org/en-US/docs/Web/Events/resize
     *
     * @type {{add, trigger}}
     */
    var ContextSizesResizeHandler = function ContextSizesResizeHandler() {
        /**
         * Collection of added callbacks.
         * @type {Array}
         */
        var callbacks = [];
        /**
         * Flag to determine whether or not the resize loop is currently running.
         * @type {boolean}
         */
        var running = false;

        /**
         * Attempts to get a requestAnimationFrame method.
         * @type {requestAnimationFrame}
         */
        var raf = ContextSizesHelpers.requestAnimationFrame;

        /**
         * Fired on resize event.
         */
        function scheduleCallbacks() {
            if (!running) {
                running = true;

                if (raf) {
                    raf(runCallbacks);
                } else {
                    setTimeout(runCallbacks, 120);
                }
            }
        }

        /**
         * Runs the actual callbacks.
         */
        function runCallbacks() {
            callbacks.forEach(function (callback) {
                callback();
            });
            running = false;
        }

        /**
         * Adds a callback to loop.
         *
         * @param callback
         */
        function addCallback(callback) {
            if (callback) {
                callbacks.push(callback);
            }
        }

        return {
            /**
             * Add a callback.
             *
             * @param callback
             */
            add: function add(callback) {
                if (!callbacks.length) {
                    window.addEventListener('DOMContentLoaded', scheduleCallbacks);
                    window.addEventListener('load', scheduleCallbacks);
                    window.addEventListener('resize', scheduleCallbacks);
                }
                addCallback(callback);
            },
            /**
             * Manually triggers the resize callback.
             */
            trigger: function trigger() {
                scheduleCallbacks();
            }
        };
    }();

    /**
     * Watches the body for height changes.
     *
     * @type {{start, stop}}
     */
    var ContextSizesBodyWatcher = function () {
        /**
         * Attempts to get a requestAnimationFrame method.
         * @type {requestAnimationFrame}
         */
        var raf = ContextSizesHelpers.requestAnimationFrame;
        /**
         * Attempts to get a cancelAnimationFrame method.
         * @type {cancelAnimationFrame}
         */
        var caf = ContextSizesHelpers.cancelAnimationFrame;
        /**
         * Tries to get the body element.
         * @type {Element}
         */
        var container = typeof document.body !== 'undefined' ? document.body : null;
        /**
         * Flag to determine if the loop can run or not
         * @type {Element|*}
         */
        var canRun = container && raf;
        /**
         * Maximum speed to run the body watcher check. This throttles
         * it down even if we technically can run the loop faster.
         * @type {number}
         */
        var interval = 500;
        /**
         * The start time.
         * @type {number}
         */
        var then = Date.now();
        /**
         * The elapsed time.
         */
        var delta = void 0;
        /**
         * The raf timer object.
         */
        var timer = void 0;
        /**
         * Holds the last scroll height from the previous loop.
         */
        var lastScrollHeight = void 0;
        /**
         * Holds the last scroll width from the previous loop.
         */
        var lastScrollWidth = void 0;

        /**
         * Loop to monitor body content changes.
         */
        function callback() {
            //determine the time since the last call
            delta = Date.now() - then;

            //make sure at least the specified interval has passed
            if (delta > interval) {
                //has the scroll height or width changed?
                if (lastScrollHeight !== container.scrollHeight || lastScrollWidth !== container.scrollWidth) {
                    //trigger the resize
                    ContextSizesResizeHandler.trigger();
                }
                lastScrollWidth = container.scrollWidth;
                lastScrollHeight = container.scrollHeight;
            }

            //reset the callback
            timer = raf(callback);
        }

        return {
            /**
             * Starts the loop.
             */
            start: function start() {
                if (canRun && !timer) {
                    timer = raf(callback);
                }
            },
            /**
             * Stops the loop.
             */
            stop: function stop() {
                if (canRun && timer) {
                    caf(timer);
                }
            }
        };
    }();

    /**
     * The main return object.
     *
     * @class
     */
    var ContextSizes = function ContextSizes() {
        /**
         * Self reference.
         * @type {ContextSizes}
         */
        var self = this;
        /**
         * Keeps track of registered profiles.
         * @type {Array}
         */
        self.profiles = [];

        /**
         * The sizes-attr string, if any.
         * @type {string|null}
         */
        self.sizesDataAttr = null;

        /**
         * Registers a profile.
         *
         * @param {Array|object} profile
         */
        self.register = function register(profile) {
            if (Array.isArray(profile)) {
                self.profiles = self.profiles.concat(profile);
            } else {
                self.profiles.push(profile);
            }
        };

        /**
         * Processes each of the profiles.
         */
        self.processAll = function processAll() {
            self.profiles.forEach(self.processProfile);
        };

        /**
         * Processes a profile.
         *
         * @param {object} profile
         */
        self.processProfile = function processProfile(profile) {
            /**
             * The profile root. Defaults to `document`
             * @type {Node|HTMLDocument}
             */
            var root = profile.root || document;

            /**
             * The elements that match the profile selector.
             * @type {NodeList}
             */
            var elements = root.querySelectorAll(profile.selector);

            //process each of the elements
            elements.forEach(function (el) {
                self.processElement(el, profile);
            });

            //start the watchers if the `live` option is truthy
            if (profile.live) {
                self.observeMutations(profile);
            }
        };

        /**
         * Watches for new dom additions that match a profile.
         *
         * @param profile
         */
        self.observeMutations = function (profile) {
            if (typeof MutationObserver !== 'undefined' && typeof document.body !== 'undefined') {
                /**
                 * The observer method. Watches for new elements that match the profile selectors. Processes
                 * the newbies and triggers an update.
                 * @type {MutationObserver}
                 */
                var observer = new MutationObserver(function (mutations) {
                    /**
                     * Flag to keep track of whether or not any new matches were found.
                     * @type {boolean}
                     */
                    var hasNewMatches = false;

                    //loop through each mutation
                    mutations.forEach(function (mutation) {
                        //check for added nodes
                        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                            //loop through added nodes
                            mutation.addedNodes.forEach(function (addedNode) {
                                //see if the mode matches the selector
                                var doesMatch = ContextSizesHelpers.matchesSelector(addedNode, profile.selector);
                                //handle matches
                                if (doesMatch) {
                                    self.processElement(addedNode, profile);
                                    hasNewMatches = true;
                                }
                            });
                        }
                    });

                    //trigger an update if we have new matches
                    if (hasNewMatches) {
                        ContextSizesResizeHandler.trigger();
                    }
                });

                //pass in the target and observer options
                observer.observe(document.body, { attributes: false, childList: true, subtree: true, characterData: false });
            }
        };

        /**
         * Process an element.
         *
         * @param {object} el
         * @param {object} profile
         */
        self.processElement = function processElement(el, profile) {
            var width = void 0;
            var height = void 0;

            //set the default watch type to self
            if (typeof profile.watch === 'undefined') {
                profile.watch = 'self';
            }

            if (profile.watch === 'self') {
                // Watching self
                width = el.offsetWidth;
                height = el.offsetHeight;
            } else {
                // Watching parent
                width = el.parentNode.offsetWidth;
                height = el.parentNode.offsetHeight;
            }

            //add/update the size attribute, if any
            if (self.sizesDataAttr) {
                el.setAttribute('data-' + self.sizesDataAttr, width + 'x' + height);
            }

            //add/remove classes depending on the element's width and profile configuration
            profile.sizes.forEach(function (size) {
                if ((size.minWidth === undefined || size.minWidth === null || Number(size.minWidth) <= width) && (size.maxWidth === undefined || size.maxWidth === null || Number(size.maxWidth) >= width) && (size.minHeight === undefined || size.minHeight === null || Number(size.minHeight) <= height) && (size.maxHeight === undefined || size.maxHeight === null || Number(size.maxHeight) >= height)) {
                    ContextSizesHelpers.addClass(el, size.class);
                } else {
                    ContextSizesHelpers.removeClass(el, size.class);
                }
            });
        };

        /**
         * Allows the resize handler to be manually triggered.
         */
        self.update = function update() {
            ContextSizesResizeHandler.trigger();
        };

        /**
         * Registers the profile and starts the watchers.
         *
         * @constructor
         * @param {Array} profile
         * @param {object|undefined} options
         */
        self.init = function init(profile, options) {
            self.register(profile);

            //kick off the options
            if (typeof options !== 'undefined') {
                if (typeof options.watchContent !== 'undefined' && options.watchContent) {
                    ContextSizesBodyWatcher.start();
                }

                if (typeof options.sizesDataAttr !== 'undefined' && options.sizesDataAttr) {
                    self.sizesDataAttr = options.sizesDataAttr;
                }
            }

            ContextSizesResizeHandler.add(function () {
                self.processAll();
            });
        };

        /**
         * Exposes the body watcher.
         */
        self.watchContent = ContextSizesBodyWatcher;

        return self;
    }();

    //exports as common, defines as amd, or pollutes the global namespace depending on the environment.
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        //common
        module.exports = ContextSizes;
    } else if (typeof define === 'function' && define.amd) {
        //amd
        define([], function () {
            return ContextSizes;
        });
    } else {
        //browser
        window.ContextSizes = ContextSizes;
    }
})();