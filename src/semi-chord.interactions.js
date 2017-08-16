/**
 * Event data describing the event, its value and the associated element
 * @typedef {Object} scEventData
 * @property {[SVGElement]} elements elements associated with the event
 * @property {scElementData} scData value associated with the element
 * @property {string} event name of the event
 * @property {string} source friend name of the source element
 */

/**
 * semi-chord data associated with the element.
 * @typedef {Object} scElementData
 * @property {string} [attribute] associated attribute name
 * @property {string} [key] associated key name
 * @property {*} value value of the element
 */

/* Event Manager */
/**
 * Provides event registration and callback firing functionality
 * @returns {Object} object with associated functions
 * @constructor
 */
_SC.prototype.getEventManager = function () {
    var callbacks = {};

    /**
     * Register a new callback for an event
     * Existing callback if any will be overwritten
     * @param {string} event event to register for
     * @param {function} callback callback function
     * @returns {boolean} true iff callback registered successfully
     */
    function registerCallback(event, callback) {
        if (typeof event === 'string' && typeof callback === 'function') {
            callbacks[event] = callback;
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Fire the registered callback for the specified event
     * @param {scEventData} eventData data associated with the event
     */
    function invokeCallback(eventData) {
        var thisEvent = eventData && eventData.event;
        if (thisEvent) {
            if (callbacks[thisEvent]) {
                try {
                    setTimeout(function () {
                        callbacks[thisEvent](eventData);
                    }, 0);
                }
                catch (e) {
                    console.log('Exception in callback for event :' + eventData.event);
                    console.log(e);
                }
            }
        }
    }

    /**
     * Get all available event names
     * @returns {Object} event names
     */
    function getEventNames() {
        return {
            //global
            onClick: 'onClick',
            onMouseEnter: 'onMouseEnter',
            onMouseLeave: 'onMouseLeave',
            // ribbon
            ribbon: {
                mouseEnter: 'onRibbonMouseEnter',
                mouseLeave: 'onRibbonMouseLeave',
                click: 'onRibbonClick',
                highlight: 'onRibbonHighlight',
                highlightRemoved: 'onRibbonHighlightRemoved'
            },

            key: {
                mouseEnter: 'onKeyMouseEnter',
                mouseLeave: 'onKeyMouseLeave',
                click: 'onKeyClick',

                point: {
                    mouseEnter: 'onKeyPointMouseEnter',
                    mouseLeave: 'onKeyPointMouseLeave',
                    click: 'onKeyPointClick'
                },

                text: {
                    mouseEnter: 'onKeyTextMouseEnter',
                    mouseLeave: 'onKeyTextMouseLeave',
                    click: 'onKeyTextClick'
                }
            },

            attribute: {
                mouseEnter: 'onAttributeMouseEnter',
                mouseLeave: 'onAttributeMouseLeave',
                click: 'onAttributeClick',

                arc: {
                    mouseEnter: 'onAttributeArcMouseEnter',
                    mouseLeave: 'onAttributeArcMouseLeave',
                    click: 'onAttributeArcClick'
                },

                text: {
                    mouseEnter: 'onAttributeTextMouseEnter',
                    mouseLeave: 'onAttributeTextMouseLeave',
                    click: 'onAttributeTextClick'
                }
            },

            label: {
                mouseEnter: 'onLabelMouseEnter',
                mouseLeave: 'onLabelMouseLeave',
                click: 'onLabelClick',
                text: {
                    mouseEnter: 'onLabelTextMouseEnter',
                    mouseLeave: 'onLabelTextMouseLeave',
                    click: 'onLabelTextClick'
                }
            },

            base: {
                click: 'onBaseClick'
            }
        }
    }

    /**
     * Format event data and invoke specified callbacks
     * @param {SVGElement[]} e SVG elements associated with the event
     * @param {scEventData} d D3 data associated with the element
     * @param {string} source friendly name of the source element
     * @param {string} event generic event name
     * @param {string} [specificSource] specific name of the element within the source
     * @param {string} [specificEvent] specific name of the event
     */
    function dispatcher(e, d, source, event, specificSource, specificEvent) {
        // fire callbacks
        var eventData = {
            elements: e,
            data: d.scData,
            event: event,
            source: source
        };
        invokeCallback(eventData);

        // fire more specific event
        if (specificSource && specificEvent) {
            eventData = {
                elements: e,
                data: d.scData,
                event: specificEvent,
                source: specificSource
            };
            invokeCallback(eventData);
        }

        // fire global event
        var globalEvent;
        if (event.indexOf('MouseEnter') > -1)
            globalEvent = 'onMouseEnter';
        else if (event.indexOf('MouseLeave') > -1)
            globalEvent = 'onMouseLeave';
        else if (event.indexOf('Click') > -1)
            globalEvent = 'onClick';

        if(globalEvent) {
            eventData = {
                elements: e,
                data: d.scData,
                event: globalEvent,
                source: specificSource || source
            };
        }
        invokeCallback(eventData);
    }

    /**
     * Get registered callback for the specified event
     * @param {string} event event name
     * @returns {function} callback function for the specified event.
     *                     undefined if no callback is registered for the specified event
     */
    function getRegisteredCallback(event) {
        return callbacks[event];
    }

    /**
     * Clear all registered callbacks
     */
    function clearRegisteredCallbacks() {
        callbacks = {};
    }

    return {
        registerCallback: registerCallback,
        invokeCallback: invokeCallback,
        getEventNames: getEventNames,
        dispatcher: dispatcher,
        getRegisteredCallback: getRegisteredCallback,
        clearRegisteredCallbacks: clearRegisteredCallbacks
    }
};

/* Click Manager */
/**
 * Manage Clicks
 * @returns {{click: click, isClicked: isClicked, reset: reset}}
 * @constructor
 */
_SC.prototype.getClickManager = function () {
    var _self = this;
    var lastClicked = null;

    /**
     * check if valid click and invoke specified function
     * @param e {SVGElement} element that is clicked
     * @param invoke {function} function to be invoked if click is valid
     */
    function click(e, invoke) {
        if (_self.config.disableInteractions)
            return;
        if (lastClicked === e) {
            lastClicked = null;
            _self.highlighting.resetHighlights();
        }
        else {
            lastClicked = null;
            _self.highlighting.resetHighlights();
            invoke();
            lastClicked = e;
        }
    }

    /**
     * Check current click status
     * @returns {boolean} true if chart element is currently under click
     */
    function isClicked() {
        if (_self.config.disableInteractions)
            return true;
        return lastClicked !== null;
    }

    /**
     * Reset click status
     */
    function reset() {
        lastClicked = null;
    }

    return {
        click: click,
        isClicked: isClicked,
        reset: reset
    }
};

/**------ INTERACTIONS ------**/
_SC.prototype.getInteractions = function () {
    var _self = this;

    /*------ Ribbon Events ---------*/
    /**
     * Interactions when mouse enters a ribbon
     * @param {SVGPathElement} e SVG element corresponding to the ribbon
     * @param {*} d d3 data associated with the ribbon
     */
    function onRibbonMouseEnter(e, d) {
        if (_self.clickManager.isClicked())
            return;

        d = d || d3.select(e).data()[0];
        _self.highlighting.highlightRibbon(e);

        // highlight label text
        if (!_self.config.valueLabel.disable)
            _self.highlighting.highlightLabel(d.scData.key, d.scData.attribute);
    }

    /**
     * Interactions when mouse leaves a ribbon
     * @param {SVGPathElement} e SVG element corresponding to the ribbon
     * @param {Object} d d3 data associated with the ribbon
     * @property {scElementData} d.scData d3 data associated with the ribbon
     */
    function onRibbonMouseLeave(e, d) {
        _self.highlighting.resetHighlights();
    }

    /**
     * Interactions when mouse is clicked on a ribbon
     * @param {SVGPathElement} e SVG element corresponding to the ribbon
     * @param {Object} d d3 data associated with the ribbon
     * @property {scElementData} d.scData d3 data associated with the ribbon
     */
    function onRibbonClick(e, d) {
        _self.clickManager.click(e, function () {
            onRibbonMouseEnter(e, d);
        });
    }

    /*------ Key Events ---------*/

    /**
     * Interactions when mouse enters a key
     * @param {SVGPathElement} e SVG element corresponding to the key
     * @param {Object} d D3 data associated with the element
     * @property {scElementData} d.smData sm data associated with the element
     */
    function onKeyMouseEnter(e, d) {
        if (_self.clickManager.isClicked())
            return;
        d = d || d3.select(e).data()[0];
        _self.highlighting.highlightRibbonByKey(d.scData.key);
        _self.highlighting.highlightLabelByKey(d.scData.key);
    }

    /**
     * Interactions when mouse leaves a key
     * @param {SVGPathElement} e SVG element corresponding to the key
     * @param {Object} d d3 data associated with the key
     * @param {scElementData} d.smData sm data associated with the element
     */
    function onKeyMouseLeave(e, d) {
        _self.highlighting.resetHighlights();
    }

    /**
     * Interactions when mouse is clicked on a key
     * @param {SVGPathElement} e SVG element corresponding to the key
     * @param {Object} d d3 data associated with the key
     * @property {scElementData} d.smData sm data associated with the element
     */
    function onKeyClick(e, d) {
        _self.clickManager.click(e, function () {
            onKeyMouseEnter(e, d);
        });
    }

    /*------ Attribute Events ---------*/

    /**
     * Interactions when mouse enters an attribute
     * @param {SVGPathElement} e SVG element corresponding to the attribute
     * @param {Object} d d3 data associated with the key
     * @property {scElementData} d.smData sm data associated with the element
     */
    function onAttributeMouseEnter(e, d) {
        if (_self.clickManager.isClicked())
            return;
        d = d || d3.select(e).data()[0];
        _self.highlighting.highlightRibbonByAttribute(d.scData.attribute);

        _self.scBackdrops
            .filter('path.value-label-backdrop[sc-data-attribute="' + d.scData.attribute + '"]')
            .attr('fill-opacity', _self.config.valueLabel.backdropHighlightOpacity);

        _self.highlighting.highlightLabelByAttribute(d.scData.attribute);
    }

    /**
     * Interactions when mouse leaves an attribute
     * @param {SVGPathElement} e SVG element corresponding to the attribute
     * @param {Object} d d3 data associated with the element
     * @property {scElementData} d.smData sm data associated with the element
     */
    function onAttributeMouseLeave(e, d) {
        _self.highlighting.resetHighlights();
    }

    /**
     * Interactions when mouse is clicked on an attribute
     * @param {SVGPathElement} e SVG element corresponding to the attribute
     * @param {Object} d d3 data associated with the key
     * @param {scElementData} d.smData sm data associated with the element
     */
    function onAttributeClick(e, d) {
        _self.clickManager.click(e, function () {
            onAttributeMouseEnter(e, d);
        });
    }

    return {
        onRibbonMouseEnter: onRibbonMouseEnter,
        onRibbonMouseLeave: onRibbonMouseLeave,
        onRibbonClick: onRibbonClick,
        onKeyMouseEnter: onKeyMouseEnter,
        onKeyMouseLeave: onKeyMouseLeave,
        onKeyClick: onKeyClick,
        onAttributeMouseEnter: onAttributeMouseEnter,
        onAttributeMouseLeave: onAttributeMouseLeave,
        onAttributeClick: onAttributeClick
    }
};