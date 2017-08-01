/**
 * validate config and assign missing defaults
 */
_SC.prototype.validateConfig = function () {
    var config = this.config;

    /* Default values */
    var defaults = {
        width: 600,
        height: 400,
        radius: 133,
        centerX: 240,
        centerY: 200,
        disableInteractions: false, // turn on / off interactions
        colorScheme: d3.schemeCategory10,
        fontFamily: 'sans-serif',
        outlineCircle: {
            stroke: '#EEE', // line color of the outline circle
            fill: 'none', // background color of the circle
            strokeWidth: '0.25' // line width of the outline circle
        },
        ribbon: {
            opacity: 0.5, // default opacity
            hoverOpacity: 0.7, // opacity on hover
            hoverInverseOpacity: 0.1 // opacity of other ribbons on hover
        },
        arc: {
            innerPadding: 0.02, // padding between arcs
            outerPadding: 0.2, // padding before and after the first and last arc respectively
            rangeStart: 0, // start radian angle. valid range: 0 to 1
            rangeEnd: 0.5,  // end radian angle. valid range: 0 to 1
            width: 15, // thickness of the arc
            titleTextOffset: 15 // space between arc and title text
        },
        key: {
            radius: 10,
            color: '#AAA', // circle fill color
            fontColor: '#AAA', // font color of the key text
            fontSize: 14, // font size of the key text
            rangeStart: 0.65, // start radian angle. valid range: 0 to 1
            rangeEnd: 0.85 // end radian angle. valid range: 0 to 1
        },
        valueLabel: {
            offsetX: 30, // space between attribute title and label
            fontSize: 11, // font size of the label text
            verticalSpace: 12, // vertical space between label texts
            fontOpacity: 0.8, // default opacity of the label texts
            fontHighlightOpacity: 1, // opacity of the highlighted label text
            fontHighlightInverseColor: '#AAA', /* font color of other label texts when one
												  or more label is highlighted */
            fontHighlightSizeIncrement: 1.5, // font size to increase on highlight
            backdropOpacity: 0.2, // opacity of the backdrop shape
            backdropHighlightOpacity: 0.3, // backdrop opacity when attribute is highlighted
            disable: false,
            autoHide: false
        }
    };

    var rootElement = this.d3RootNode.node();
    // check and assign missing defaults
    if (config) {
        var elementWidth, elementHeight;
        if (rootElement instanceof SVGElement) {
            elementWidth = rootElement.width.baseVal.value;
            elementHeight = rootElement.height.baseVal.value;
        }
        else {
            elementWidth = rootElement.clientWidth;
            elementHeight = rootElement.clientHeight;
        }

        elementWidth = elementWidth || defaults.width;
        elementHeight = elementHeight || defaults.height;
        var defaultRadius = Math.min(elementWidth, elementHeight) / 3;

        config.radius = config.radius || defaultRadius;
        config.centerX = config.centerX || elementWidth / 2.5;
        config.centerY = config.centerY || elementHeight / 2;
        config.disableInteractions = config.disableInteractions || defaults.disableInteractions;
        config.colorScheme = config.colorScheme || defaults.colorScheme;
        config.fontFamily = config.fontFamily || defaults.fontFamily;

        // outlineCircle object validation
        if (config.outlineCircle) {
            var c = config.outlineCircle;
            var dfl = defaults.outlineCircle;

            c.stroke = c.stroke || dfl.stroke;
            c.fill = c.fill || dfl.fill;
            c.strokeWidth = c.strokeWidth || dfl.strokeWidth;
        }
        else {
            config.outlineCircle = defaults.outlineCircle;
        }

        // ribbon object validation
        if (config.ribbon) {
            var c = config.ribbon;
            var dfl = defaults.ribbon;

            c.opacity = c.opacity || dfl.opacity;
            c.hoverOpacity = c.hoverOpacity || dfl.hoverOpacity;
            c.hoverInverseOpacity = c.hoverInverseOpacity || dfl.hoverInverseOpacity;
        }
        else {
            config.ribbon = defaults.ribbon;
        }

        // arc object validation
        if (config.arc) {
            var c = config.arc;
            var dfl = defaults.arc;

            c.innerPadding = c.innerPadding || dfl.innerPadding;
            c.outerPadding = c.outerPadding || dfl.outerPadding;
            c.rangeStart = c.rangeStart || dfl.rangeStart;
            c.rangeEnd = c.rangeEnd || dfl.rangeEnd;
            c.width = c.width || dfl.width;
            c.titleTextOffset = c.titleTextOffset || dfl.titleTextOffset;
        }
        else {
            config.arc = defaults.arc;
        }

        // key object validation
        if (config.key) {
            var c = config.key;
            var dfl = defaults.key;

            c.radius = c.radius || 0.05 * config.radius;
            c.color = c.color || dfl.color;
            c.rangeStart = c.rangeStart || dfl.rangeStart;
            c.rangeEnd = c.rangeEnd || dfl.rangeEnd;
            c.fontColor = c.fontColor || dfl.fontColor;
            c.fontSize = c.fontColor || dfl.fontColor;
        }
        else {
            config.key = defaults.key;
            config.key.radius = 0.05 * config.radius;
        }

        // value label validation
        if (config.valueLabel) {
            var c = config.valueLabel;
            var dfl = defaults.valueLabel;

            c.offsetX = c.offsetX || dfl.offsetX;
            c.fontSize = c.fontSize || dfl.fontSize;
            c.verticalSpace = c.verticalSpace || dfl.verticalSpace;
            c.fontOpacity = c.fontOpacity || dfl.fontOpacity;
            c.fontHighlightOpacity = c.fontHighlightOpacity || dfl.fontHighlightOpacity;
            c.fontHighlightInverseColor = c.fontHighlightInverseColor
                || dfl.fontHighlightInverseColor;
            c.fontHighlightSizeIncrement = c.fontHighlightSizeIncrement
                || dfl.fontHighlightSizeIncrement;
            c.backdropOpacity = c.backdropOpacity || dfl.backdropOpacity;
            c.backdropHighlightOpacity = c.backdropHighlightOpacity
                || dfl.backdropHighlightOpacity;
            c.disable = c.disable || dfl.disable;
            c.autoHide = c.autoHide || dfl.autoHide;
        }
        else {
            config.valueLabel = defaults.valueLabel;
        }

    }
    else {
        this.config = defaults;
        config = this.config;
        var defaultWidth = rootElement.clientWidth || defaults.width;
        var defaultHeight = rootElement.clientHeight || defaults.height;
        var defaultRadius = Math.min(defaultWidth, defaultHeight) / 3;

        config.radius = defaultRadius;
        config.centerX = defaultWidth / 2.5;
        config.centerY = defaultHeight / 2;
        config.key.radius = 0.05 * config.radius;
    }
};

/**
 * Validate data, attribute and key
 * @returns {boolean} true if data is valid, false otherwise
 */
_SC.prototype.validateData = function () {
    if (!(this.data instanceof Array)) {
        console.log('semi-chord: Invalid data. Expected: array of JSON objects');
        return false;
    }

    if (this.data.length === 0) {
        console.log('semi-chord: No data to plot');
        return false;
    }

    // check if data attributes are provided. else, extract from data
    if (!this.dataAttributes) {
        this.dataAttributes = [];
        for (var prop in this.data[0]) {
            if (this.data[0].hasOwnProperty(prop)) {
                this.dataAttributes.push(prop);
            }
        }
    }

    this.dataKey = this.dataKey || this.dataAttributes.splice(0, 1)[0];

    if (typeof this.dataKey !== 'string') {
        console.log('semi-chord: Invalid data key');
        return false;
    }

    if (!(this.dataAttributes instanceof Array)) {
        console.log('semi-chord: Invalid data-attributes. Expected: array of string');
        return false;
    }

    if (this.dataAttributes.length === 0) {
        console.log('semi-chord: No data-attributes found.');
        return false;
    }
    return true;
};