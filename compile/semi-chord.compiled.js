/**
 * @constructor
 * Represents a Semi-Chord object
 * @param {string | SVGElement | HTMLElement} pE parentElement: container for the chart
 * @param {[Object]} d data: JSON data for the chart
 * @param {Object} c config: configuration data
 * @param {[string]} [dA] data attributes: array of attribute names corresponding to the property
 *                        names in the given data. By default, all properties of the first object in
 *                        the given data array are treated as the attributes
 * @param {string} [dK] data key: property to be treated as the key in the given data. By default,
 *                       first property of the 1st object in the given data array is treated as key
 */
var _SC = function (pE, d, c, dA, dK) {
    if (!pE) {
        throw 'semi-chord: invalid parent element selector. ' +
        'Please specify a element selector string or HTMLElement or SVGElement';
    }
    this.parentElement = pE;
    this.data = d;
    this.config = c;
    this.dataAttributes = dA;
    this.dataKey = dK;

    // root svg parent container
    this.d3RootNode = d3.select(this.parentElement);

    // validate data;
    if (! this.validateData()) {
		return false;
	}

    // validate config
    if(!this.validateConfig()){
		return false;
	}

    // utility functions
    this.utils = new this.Utils(this.config.radius, this.config.centerX, this.config.centerY);

    // computed coordinates for various SVG elements
    this.cc = this.computeCoordinates();

    this.d3RootNode = this.d3RootNode
        .append('svg')
        .classed('semi-chord', true);

    this.clickManager = this.getClickManager();
    this.eventManager = this.getEventManager();
    this.highlighting = this.getHighlighting();
    this.interactions = this.getInteractions();
    this.draw();
};

_SC.prototype.update = function () {
    this.validateConfig();
    this.cc = this.computeCoordinates();
    this.redraw();
};

_SC.prototype.redraw = function () {
    this.d3RootNode.selectAll("*").remove();
    this.draw();
    this.clickManager.reset();
};

;/**
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
            offsetX: 30, // space between attribute title and label text
			backdropOffsetX: 12, // space between attribute title and backdrop beginning point
            backdropOffsetXRight: 1, // right padding for the backdrop
            fontSize: 11, // font size of the label text
            verticalSpace: 12, // vertical space between label texts
            fontOpacity: 0.8, // default opacity of the label texts
            fontHighlightOpacity: 1, // opacity of the highlighted label text
            fontHighlightInverseColor: '#AAA', /* font color of other label texts when one
												  or more label is highlighted */
            fontHighlightSizeIncrement: 0, // font size to increase on highlight
            backdropOpacity: 0.2, // opacity of the backdrop shape
            backdropHighlightOpacity: 0.3, // backdrop opacity when attribute is highlighted
            disable: false,
            autoHide: false
        }
    };

    var rootElement = this.d3RootNode.node();
	
	if(!rootElement) {
		console.log('semi-chord: no valid element found for given parent element selector');
		return false;
	}
	
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
        var defaultRadius = Math.round(Math.min(elementWidth, elementHeight) / 3);

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
            c.fontSize = c.fontSize || dfl.fontSize;
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
			c.backdropOffsetX = c.backdropOffsetX || dfl.backdropOffsetX;
			c.backdropOffsetXRight = c.backdropOffsetXRight || dfl.backdropOffsetXRight;
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
        var defaultRadius = Math.round(Math.min(defaultWidth, defaultHeight) / 3);

        config.radius = defaultRadius;
        config.centerX = defaultWidth / 2.5;
        config.centerY = defaultHeight / 2;
        config.key.radius = 0.05 * config.radius;
    }
	
	return true;
};

/**
 * Validate data, attribute and key
 * @returns {boolean} true if data is valid, false otherwise
 */
_SC.prototype.validateData = function () {
    if (!this.data || !this.data[0]) {
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
            if (this.data[0].hasOwnProperty(prop) && this.dataKey !== prop) {
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
};;/**
 * Provide utilities to calculate coordinate positions, SVG path d attributes etc.
 * @constructor
 * @param {number} [radius] radius of the outline circle.
 * @param {number} [centerX] centerX of the outline circle.
 * @param {number} [centerY] centerY of the outline circle.
 * @returns {Object} object of function refernces for various utility functions
 */
_SC.prototype.Utils = function Utils(radius, centerX, centerY) {

    /**
     * Get the x and y coordinate on the outer circle for the given angle
     * @param {number} radianAngle 12 O' clock clockwise angle
     * @param {number} [circleRadius] Radius of the circle. Defaults to radius of outer
     *                                 circle
     * @returns {{x: number, y: number}} x and y coordinate on the circle
     */
    this.getCoordinateOnCirlce = function (radianAngle, circleRadius) {
        circleRadius = circleRadius || radius;
        var x = Math.round(centerX + circleRadius * Math.sin(radianAngle));
        var y = Math.round(centerY - circleRadius * Math.cos(radianAngle));

        return {x: x, y: y};
    };

    /**
     * Get the x coordinate on the outer circle for the given angle
     * @param {number} radianAngle 12 O' clock clockwise angle
     * @param {number} [circleRadius] Radius of the circle. Defaults to radius of outer
     *                                 circle
     * @returns {number} x coordinate of the point
     */
    this.getXCoordinateOnCircle = function (radianAngle, circleRadius) {
        circleRadius = circleRadius || radius;
        return Math.round(centerX + circleRadius * Math.sin(radianAngle));
    };

    /**
     * Get the y coordinate on the outer circle for the given angle
     * @param {number} radianAngle 12 O' clock clockwise angle
     * @param {number} [circleRadius] Radius of the circle. Defaults to radius of outer
     *                                 circle
     * @returns {number} y coordinate of the point
     */
    this.getYCoordinateOnCircle = function (radianAngle, circleRadius) {
        circleRadius = circleRadius || radius;
        return Math.round(centerY - circleRadius * Math.cos(radianAngle));
    };

    /**
     * Get the d attribute of the path for ribbon between 3 points
     * @param {{x:number, y:number}} p1 source point
     * @param {{x:number, y:number}} p2 start point on the circle
     * @param {{x:number, y:number}} p3 end point on the circle
	 * @param {{x:number, y:number}} mid mid point on the circle between start and end
     * @returns {string} d attribute value of the ribbon path
     */
    this.getRibbonBetweenPoints = function (p1, p2, p3, mid) {
        var d = [];
        
        // starting point: p1
        d = d.concat(["M ", p1.x, ",", p1.y]);
        // curve between p1 and p2
        var bezier = {x: (p1.x + p2.x) / 2, y: p1.y - 10};
        d = d.concat([" Q ", bezier.x, ",", bezier.y, " ", p2.x, "," + p2.y]);

        // Line between p2 and p3
        d = d.concat([" Q ", mid.x, ",", mid.y, " ", p3.x, "," + p3.y]);

        // curve between p1 and p3
        bezier = {x: (p1.x + p3.x) / 2, y: p1.y + 5};
        d = d.concat([" Q ", bezier.x, ",", bezier.y, " ", p1.x, ",", p1.y]);

        return d.join('');
    };


    /**
     * Get the d attribute of the path for backdrop shape for value label
     * @param {{x:number, y:number}} centerLeft center point vertically between top
     *                                            and bottom
     * @param {{x:number, y:number}} topLeft top left point
     * @param {{x:number, y:number}} bottomLeft bottom left point
     * @param {number} width width of the backdrop shape
     * @returns {string}  d attribute value of the backdrop shape path
     */
    this.getValueLabelBackdrop = function (centerLeft, topLeft, bottomLeft, width) {
        var topRight = {x: topLeft.x + width, y: topLeft.y - 10};
        var bottomRight = {x: bottomLeft.x + width, y: bottomLeft.y + 10};

        var d = [];
        // starting point : top right
        d = d.concat(['M ', topRight.x, ',', topRight.y]);
        // curved path from top right to top left
        d = d.concat([' Q ', (topLeft.x + topRight.x) / 2, ',', topLeft.y, // bezier pt
            ' ', topLeft.x, ',', topLeft.y]); // target pt
        // curved path from top left to center left
        d = d.concat([' Q ', (centerLeft.x + topLeft.x) / 2, ',', centerLeft.y, //bezier pt
            ' ', centerLeft.x, ',', centerLeft.y]); // target pt
        // curved path from center left to bottom left
        d = d.concat([' Q ', (bottomLeft.x + centerLeft.x) / 2, ',', centerLeft.y, //bezier
            ' ', bottomLeft.x, ',', bottomLeft.y]); // target pt
        // curved path from bottom left to bottom right
        d = d.concat([' Q ', (bottomRight.x + bottomLeft.x) / 2, ',', bottomLeft.y, //bezier
            ' ', bottomRight.x, ',', bottomRight.y]); // target pt
        // curved path from bottom right to top right
        d = d.concat([' Q ', (bottomRight.x + (bottomRight.y - topRight.y) / 2),
            ',', (bottomRight.y + topRight.y) / 2, // bezier pt
            ' ', topRight.x, ',', topRight.y]); // target pt

        return d.join('');
    };

    /**
     * Get numeric value of string. Prefix such as $ and suffix such as % are stripped
     * @param {string | number} s
     * @returns {number}
     */
    this.getNumericValue = function (s) {
        if (isFinite(s))
            return s;
        var num = s.replace(/[^0-9.]/g, "");
        return num ? parseFloat(num) : 0;
    };
};;/**
 * Process _self.data and compute coordinate positions of SVG elements
 * @returns {Object} coordinate positions or ribbons, keys and arcs
 */
_SC.prototype.computeCoordinates = function () {
    var _self = this;

    //all angles are in radians
    var TwicePI = 2 * Math.PI;

    /* ------ SCALES -------- */

    // scale for position of circle keys on left half circumference
    var keyPositionScale = d3.scalePoint()
        .domain(_self.data.map(function (d, i) {
            return i;
        }))
        .range([TwicePI * _self.config.key.rangeStart, TwicePI * _self.config.key.rangeEnd]);

    // scale for position of arc for attributes on the right half circumference
    var attributePositionScale = d3.scaleBand()
        .domain(_self.dataAttributes)
        .range([TwicePI * _self.config.arc.rangeStart, TwicePI * _self.config.arc.rangeEnd])
        .paddingInner(_self.config.arc.innerPadding)
        .paddingOuter(_self.config.arc.outerPadding);

    // color scale
    var colorScale = d3.scaleOrdinal(_self.config.colorScheme);

    /* ------ COORDINATE CALCULATIONS & PREPROCESSING -------- */

    // width of individual arc
    var arcWidth = attributePositionScale.bandwidth() - _self.config.arc.innerPadding;

    // coordinates of the circle keys on the left half circumference
    var keyPointCoordinates = _self.data.map(function (d, i) {
        var coordinates = _self.utils
            .getCoordinateOnCirlce(keyPositionScale(_self.data.length - 1 - i));
        coordinates.text = d[_self.dataKey];
        return coordinates;
    });

    // start and end angles for the arcs
    var arcAngles = _self.dataAttributes.map(function (d) {
        var startAngle = attributePositionScale(d);
        var endAngle = startAngle + arcWidth;
        return {start: startAngle, end: endAngle};
    });

    // ribbon coordinates
    var ribbonPositions = (function () {
        var positionsMatrix = [];

        _self.dataAttributes.forEach(function (attr, colIndex) {
            // total value for current attribute
            var attributeTotal = _self.data.reduce(function (sum, row) {
                return sum + _self.utils.getNumericValue(row[attr]);
            }, 0);
            //scaling factor for attribute value
            var valueToWidthRatio = (attributeTotal === 0) ? 0 : arcWidth / attributeTotal;

            // start angle for each value in _self.data matrix
            var startAngle = arcAngles[colIndex].start;
            _self.data.forEach(function (e, rowIndex) {
                var numericValue = _self.utils.getNumericValue(e[attr]);
                var endAngle = startAngle + numericValue * valueToWidthRatio;

                positionsMatrix.push(
                    {
                        source: keyPointCoordinates[rowIndex],
                        start: _self.utils.getCoordinateOnCirlce(startAngle),
                        end: _self.utils.getCoordinateOnCirlce(endAngle),
						mid: _self.utils.getCoordinateOnCirlce((startAngle + endAngle) / 2),
                        color: colorScale(attr),
                        text: e[_self.dataKey] + " : " + e[attr],
                        scData: {
                            key: e[_self.dataKey],
                            attribute: _self.dataAttributes[colIndex],
                            value: e[attr]
                        }
                    });
                startAngle = endAngle; // next ribbon starts where current one ends
            });
        });
        return positionsMatrix;
    })();

    return {
        colorScale: colorScale,
        keyPointCoordinates: keyPointCoordinates,
        arcAngles: arcAngles,
        ribbonPositions: ribbonPositions
    };
};

;/**
 * Draw the semi-chord SVG elements
 */
_SC.prototype.draw = function () {
    var _self = this;
    var config = this.config;
    var d3RootNode = this.d3RootNode;
    var cc = this.cc;
    var interactions = this.interactions;
    var utils = this.utils;
    var eventManager = this.eventManager;
    var events = this.eventManager.getEventNames();

    // outer boundary circle
    d3RootNode.append('circle')
        .attr('cx', config.centerX)
        .attr('cy', config.centerY)
        .attr('r', config.radius)
        .attr('stroke', config.outlineCircle.stroke)
        .attr('stroke-width', config.outlineCircle.strokeWidth)
        .attr('fill', config.outlineCircle.fill);

    /*------- RIBBONS -------- */

    // ribbons from key point to the attributes
    var keyRibbonsWrap = d3RootNode.append('g')
        .classed('ribbon-wrap', true);

    keyRibbonsWrap
        .selectAll('path.ribbon')
        .data(cc.ribbonPositions)
        .enter()

        .append('path')
        .classed('ribbon', true)
        .attr('d', function (d) {
            return _self.utils.getRibbonBetweenPoints(d.source, d.start, d.end, d.mid);
        })
        .attr('fill', function (d) {
            return d.color;
        })
        .attr('fill-opacity', config.ribbon.opacity)
        .attr('sc-data-key', function (d) {
            return d.scData.key;
        })
        .attr('sc-data-attribute', function (d) {
            return d.scData.attribute;
        })
        .attr('sc-data-value', function (d) {
            return d.scData.value;
        })
        // events
        .on('mouseenter', function (d) {
            interactions.onRibbonMouseEnter(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'ribbon', events.ribbon.mouseEnter);
        })
        .on('mouseleave', function (d) {
            interactions.onRibbonMouseLeave(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'ribbon', events.ribbon.mouseLeave);
        })
        .on('click', function (d) {
            interactions.onRibbonClick(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'ribbon', events.ribbon.click);
        });

    /*---- KEYS----- */

    // points (small circles) for the keys on the left circumference
    // key-element is a grouping of a key points
    var keyPoints = d3RootNode.selectAll('g.key-group')
        .data([cc.keyPointCoordinates])
        .enter()
        .append('g')
        .classed('key-group', true)
        .selectAll('g.key-element')
        .data(function (d) {
            return d;
        })
        .enter()
        .append('g')
        .classed('key-element', true)
        .selectAll('circle.key')
        .data(function (d, i) {
            d.scData = {
                key: _self.data[i][_self.dataKey],
                value: _self.dataAttributes.map(function (e) {
                    return {
                        attribute: e,
                        value: _self.data[i][e]
                    };
                })
            };
            return [d];
        })
        .enter();

    // create key circles
    keyPoints
        .append('circle')
        .classed('key', true)
        .attr('cx', function (d) {
            return d.x;
        })
        .attr('cy', function (d) {
            return d.y;
        })
        .attr('r', config.key.radius)
        .attr('fill', config.key.color)
        // events
        .on('mouseenter', function (d) {
            interactions.onKeyMouseEnter(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'key', events.key.mouseEnter,
                'key.point', events.key.point.mouseEnter);

        })
        .on('mouseleave', function (d) {
            interactions.onKeyMouseLeave(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'key', events.key.mouseLeave,
                'key.point', events.key.point.mouseLeave);

        })
        .on('click', function (d) {
            interactions.onKeyClick(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'key', events.key.click,
                'key.point', events.key.point.click);
        });

    // create key texts
    keyPoints
        .append('text')
        .text(function (d) {
            return d.text;
        })
        .style('cursor', 'pointer')
        .attr('x', function (d) {
            return d.x - 0.08 * config.radius;
        })
        .attr('y', function (d) {
            return d.y + 0.025 * config.radius;
        })
        .attr('text-anchor', 'end')
        .attr('fill', config.key.fontColor)
        .attr('font-size', config.key.fontSize)
        .on('mouseenter', function (d) {
            interactions.onKeyMouseEnter(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'key', events.key.mouseEnter,
                'key.text', events.key.text.mouseEnter);
        })
        .on('mouseleave', function (d) {
            interactions.onKeyMouseLeave(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'key', events.key.mouseLeave,
                'key.text', events.key.text.mouseLeave);
        })
        .on('click', function (d) {
            interactions.onKeyMouseLeave(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'key', events.key.click,
                'key.text', events.key.text.click);
        });

    /*---- ATTRIBUTE ARCS ----- */

    // arcs for attributes
    // parent group for arcs
    var attrGroup = d3RootNode.append('g')
        .attr('transform', 'translate(' + config.centerX + ', ' + config.centerY + ')')
        .classed('attr-group', true);

    // new arcs to create
    attrGroup.selectAll('path.attribute')
        .data(_self.dataAttributes.map(function (d) {
            return {
                scData: {
                    attribute: d,
                    value: _self.data.map(function (e) {
                        return {
                            key: e[_self.dataKey],
                            value: e[d]
                        }
                    })
                }
            };
        }))
        .enter()
        .append('path')
        .classed('attribute', true)
        .attr('d', function (d, i) {
            var arcAngle = cc.arcAngles[i];
            var arc = d3.arc()
                .innerRadius(config.radius - config.arc.width * 0.25 )
                .outerRadius(config.radius + config.arc.width * 0.75 )
                .startAngle(arcAngle.start)
                .endAngle(arcAngle.end);
            return arc();
        })
        .attr('fill', function (d) {
            return cc.colorScale(d.scData.attribute);
        })
        .on('mouseenter', function (d) {
            interactions.onAttributeMouseEnter(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'attribute', events.attribute.mouseEnter,
                'attribute.arc', events.attribute.arc.mouseEnter);
        })
        .on('mouseleave', function (d) {
            interactions.onAttributeMouseLeave(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'attribute', events.attribute.mouseLeave,
                'attribute.arc', events.attribute.arc.mouseLeave);
        })
        .on('click', function (d) {
            interactions.onAttributeClick(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'attribute', events.attribute.click,
                'attribute.arc', events.attribute.arc.click);
        });

    /**---- Attribute Title ------**/
        // parent group for attribute title texts
    var arcTextsGroup = attrGroup.append('g')
            .classed('attribute-texts', true)
            .attr('transform', 'translate(-' + config.centerX + ', -' + config.centerY + ')');

    // new title texts to create on attribute arcs
    var arcTexts = arcTextsGroup.selectAll('text.attribute-title')
        .data(_self.dataAttributes.map(function (d, i) {
            var angle = (cc.arcAngles[i].start + cc.arcAngles[i].end) / 2; // center of arc
            var radius = config.radius + config.arc.width + config.arc.titleTextOffset;
            var textPosition = utils.getCoordinateOnCirlce(angle, radius);
            var color = cc.colorScale(d);
            return {
                x: textPosition.x,
                y: textPosition.y,
                color: color,
                scData: {
                    attribute: d,
                    value: _self.data.map(function (e) {
                        return {
                            key: e[_self.dataKey],
                            value: e[d]
                        }
                    })
                }
            };
        }))
        .enter();

    // create arc title texts
    var arcTitleElements = arcTexts
        .append('text')
        .classed('attribute-title', true)
        .attr('x', function (d) {
            return d.x;
        })
        .attr('y', function (d) {
            return d.y;
        })
        .attr('fill', function (d) {
            return d.color;
        })
        .text(function (d) {
            return d.scData.attribute;
        })
        .style('cursor', 'pointer')
        .attr('alignment-baseline', 'central')
		.attr('font-size', config.key.fontSize)
        .on('mouseenter', function (d) {
            interactions.onAttributeMouseEnter(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'attribute', events.attribute.mouseEnter,
                'attribute.text', events.attribute.text.mouseEnter);
        })
        .on('mouseleave', function (d) {
            interactions.onAttributeMouseLeave(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'attribute', events.attribute.mouseLeave,
                'attribute.text', events.attribute.text.mouseLeave);
        })
        .on('click', function (d) {
            interactions.onAttributeClick(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d,
                'attribute', events.attribute.click,
                'attribute.text', events.attribute.text.click);
        });
	 
	if(!config.valueLabel.disable){
	 
    /**---- Value Labels ------**/

        // new values labels to create on attribute arcs    
    var valueLabelGroup = arcTextsGroup.selectAll('g.value-labels')
            .data([_self.dataAttributes])
            .enter()
            .append('g')
            .classed('value-labels', true)
            .attr('fill-opacity', function () {
                return config.valueLabel.autoHide || config.valueLabel.disable ? 0 : 1;
            });

    var valueLabels = valueLabelGroup.selectAll('text.attribute-value-label')
        .data(_self.dataAttributes.map(function (d, i) {
            // list of all values for current attribute
            var valuesText = _self.data.map(function (e) {
                return e[_self.dataKey] + " : " + (e[d] || 0);
            });

            // get attribute title text bounding box. required as title can be of variable length
            var attributeTitleBBox = arcTitleElements.nodes()[i].getBBox();
            var x = attributeTitleBBox.x + attributeTitleBBox.width + config.valueLabel.offsetX;
            var y = attributeTitleBBox.y + attributeTitleBBox.height / 2;

            return {
                attribute: d,
                color: cc.colorScale(d),
                values: valuesText,
                x: x,
                y: y,
                height: config.valueLabel.verticalSpace
            }
        }))
        .enter();

    var valueLabelTextsPositions = []; // text label coordinates. used later for drawing backdrop
    // create value labels
    valueLabels
        .append('text')
        .classed('value-label', true)
        .attr('x', function (d) {
            return d.x;
        })
        .attr('y', function (d) {
            return d.y;
        })
        .attr('sc-data-attribute', function (d) {
            return d.attribute;
        })
        .selectAll('tspan.value-label-element')
        .data(function (d, i) {
            var totalHalfHeight = d.values.length * d.height / 2;

            //scale to center items vertically around the attribute title text
            var dyScale = d3.scaleLinear()
                .range([-totalHalfHeight, totalHalfHeight])
                .domain([0, d.values.length - 1]);

            // horizontal space between attribute title text and backdrop shape
            var centerOffset = config.valueLabel.offsetX - config.valueLabel.backdropOffsetX;
			
            valueLabelTextsPositions.push({
                center: {
                    x: d.x - centerOffset,
                    y: d.y
                },
                top: {
                    x: d.x + config.valueLabel.backdropOffsetXRight + Math.abs(dyScale(0)) / 2,
                    y: d.y + dyScale(0) - 15
                },
                bottom: {
                    x: d.x + config.valueLabel.backdropOffsetXRight
                    + Math.abs(dyScale(d.values.length - 1)) / 2,
                    y: d.y + dyScale(d.values.length - 1) + 15
                }
            });

            var color = d.color;

            return d.values.map(function (e, j) {
                return {
                    x: d.x + 5 + Math.abs(dyScale(j)) / 2, // for curving of label start positions
                    y: d.y + dyScale(j),
                    text: e,
                    color: color,
                    scData: {
                        key: _self.data[j][_self.dataKey],
                        attribute: d.attribute,
                        value: _self.data[j][d.attribute]
                    }
                };
            });
        })
        .enter()
        .append('tspan')
        .classed('value-label-element', true)
        .attr('sc-data-key', function (d) {
            return d.scData.key;
        })
        .attr('sc-data-attribute', function (d) {
            return d.scData.attribute;
        })
        .attr('sc-data-value', function (d) {
            return d.scData.value;
        })
        .text(function (d) {
            return d.text;
        })
        .style('cursor', 'pointer')
        .attr('alignment-baseline', 'central')
        .attr('x', function (d) {
            return d.x;
        })
        .attr('y', function (d) {
            return d.y;
        })
        .attr('font-size', config.valueLabel.fontSize)
        .attr('font-weight', 'normal')
        .attr('fill', function (d) {
            return d.color;
        })
        .attr('fill-opacity', function () {
            return config.valueLabel.autoHide || config.valueLabel.disable ? 0 : config.valueLabel.fontOpacity;
        })
        .on('mouseenter', function (d) {
            if (config.valueLabel.autoHide || config.valueLabel.disable)
                return;
            // select corresponding ribbon and pass to ribbonMouseEnter event handler
            var ribbon = _self.scRibbons
                .filter('path.ribbon[sc-data-key="' + d.scData.key + '"]'
                    + '[sc-data-attribute="' + d.scData.attribute + '"]').node();
            interactions.onRibbonMouseEnter(ribbon, d);

            // fire callbacks
            eventManager.dispatcher([this], d, 'label.text', events.label.text.mouseEnter);
        })
        .on('mouseleave', function (d) {
            interactions.onRibbonMouseLeave(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d, 'label.text', events.label.text.mouseLeave);
        })
        .on('click', function (d) {
            if (config.valueLabel.autoHide || config.valueLabel.disable)
                return;
            var ribbon = _self.scRibbons
                .filter('path.ribbon[sc-data-key="' + d.scData.key + '"]'
                    + '[sc-data-attribute="' + d.scData.attribute + '"]').node();
            interactions.onRibbonClick(ribbon, d);
            // fire callbacks
            eventManager.dispatcher([this], d, 'label.text', events.label.text.click);
        });

    // value label backdrop
    valueLabelGroup.selectAll('path.value-label-backdrop')
        .data(valueLabelTextsPositions.map(function (d, i) {
            d.color = cc.colorScale(_self.dataAttributes[i]);
            // get bounding box of the corresponding text label to find width of the text
            d.width = d3RootNode.selectAll('text.value-label').nodes()[i].getBBox().width;
            //sc data
            d.scData = {
                attribute: _self.dataAttributes[i],
                value: _self.data.map(function (e) {
                    return {
                        key: e[_self.dataKey],
                        value: e[_self.dataAttributes[i]]
                    }
                })
            };

            return d;
        }))
        .enter()
        .insert('path', ':first-child')
        .classed('value-label-backdrop', true)
        .attr('sc-data-attribute', function (d) {
            return d.scData.attribute;
        })
        .attr('d', function (d) {
            return utils.getValueLabelBackdrop(d.center, d.top, d.bottom, d.width);
        })
        .attr('fill-opacity', function () {
            return config.valueLabel.autoHide || config.valueLabel.disable ? 0 : config.valueLabel.backdropOpacity;
        })
        .attr('fill', function (d) {
            return d.color;
        })
        .on('mouseenter', function (d) {
            if (config.valueLabel.autoHide || config.valueLabel.disable)
                return;
            interactions.onAttributeMouseEnter(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d, 'label', events.label.mouseEnter);
        })
        .on('mouseleave', function (d) {
            interactions.onAttributeMouseLeave(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d, 'label', events.label.mouseLeave);
        })
        .on('click', function (d) {
            if (config.valueLabel.autoHide || config.valueLabel.disable)
                return;
            interactions.onAttributeClick(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d, 'label', events.label.click);
        });
	}

    var baseRectDimensions = d3RootNode.node().getBBox();
    d3RootNode.insert('rect', ':first-child')
        .classed('base', true)
        .attr('x', baseRectDimensions.x)
        .attr('y', baseRectDimensions.y)
        .attr('width', baseRectDimensions.width)
        .attr('height', baseRectDimensions.height)
        .attr('fill-opacity', 0)
        .on('click', function () {
            _self.clickManager.reset();
            _self.highlighting.resetHighlights();
            eventManager.dispatcher([this], {}, 'base', 'onBaseClick');
        });

    // update dimensions of the root element
    d3RootNode
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('font-family', _self.config.fontFamily);

    // reference to all ribbon SVG elements
    _self.scRibbons = d3RootNode
        .selectAll("path.ribbon");

    // reference to all label SVG elements
    _self.scLabels = d3RootNode
        .selectAll('tspan.value-label-element');

    // reference to all backdrop SVG elements
    _self.scBackdrops = d3RootNode
        .selectAll('path.value-label-backdrop');
};
;/**
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
};;/** -------- HIGHLIGHTING ------------*/
_SC.prototype.getHighlighting = function () {
    var _self = this;
    var events = _self.eventManager.getEventNames();

    // Ribbon
    /**
     * Highlight specified ribbon
     * @param {SVGPathElement} e ribbon path element
     * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
     * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
     *                       by user interactions
     */
    function highlightRibbon(e, keepExisting, lock) {
        if (e) {
            if (!keepExisting) {
                var hlightRemoved = _self.scRibbons.filter('.highlighted');

                _self.scRibbons.classed('highlighted', false)
                    .attr('fill-opacity', _self.config.ribbon.hoverInverseOpacity);
                fireRibbonHighlightEvent('', '', hlightRemoved, events.ribbon.highlightRemoved);
            }

            var d = d3.select(e)
                .attr('fill-opacity', _self.config.ribbon.hoverOpacity)
                .classed('highlighted', true)
                .classed('highlight-locked', lock)
                .datum();
            e.parentNode.appendChild(e);

            //fire highlight event
            _self.eventManager.dispatcher([e], d, 'ribbon', events.ribbon.highlight);
        }
    }

    /**
     * Highlight ribbons by value and/or key and/or attribute
     * @param {string} value data value of the ribbon to be highlighted
     * @param {string} [key] data key of the value
     * @param {string} [attribute] data attribute of the value
     * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
     * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
     *                       by user interactions
     */
    function highlightRibbonByValue(value, key, attribute, keepExisting, lock) {
        if (!key && !attribute && !value)
            return;

        var valueFilter = '[sc-data-value="' + value + '"]';
        var attrFilter = '[sc-data-attribute="' + attribute + '"]';
        var keyFilter = '[sc-data-key="' + key + '"]';
        var r = _self.scRibbons;

        if (!keepExisting) {
            if (key)
                r = r.filter(':not(' + keyFilter + ')');
            if (attribute)
                r = r.filter(':not(' + attrFilter + ')');
            if (value)
                r = r.filter(':not(' + valueFilter + ')');

            var hlightRemoved = r.filter('.highlighted');

            r.classed('highlighted', false)
                .attr("fill-opacity", _self.config.ribbon.hoverInverseOpacity);
            fireRibbonHighlightEvent('', '', hlightRemoved, events.ribbon.highlightRemoved);
        }

        r = _self.scRibbons;
        if (key)
            r = r.filter(keyFilter);
        if (attribute)
            r = r.filter(attrFilter);
        if (value)
            r = r.filter(valueFilter);
        r.attr('fill-opacity', _self.config.ribbon.hoverOpacity)
            .classed('highlighted', true)
            .classed('highlight-locked', lock)
            .each(function (d) {
                this.parentNode.appendChild(this);
            });
        //fire highlight event
        fireRibbonHighlightEvent(key, '', r, events.ribbon.highlight);
        return r;
    }

    /**
     * Highlight ribbons by key
     * @param {string} key key name
     * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
     * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
     *                       by user interactions
     */
    function highlightRibbonByKey(key, keepExisting, lock) {
        if (key && typeof key === 'string') {

            var keyFilter = '[sc-data-key="' + key + '"]';

            var r = _self.scRibbons
                .filter(keyFilter)
                .attr('fill-opacity', _self.config.ribbon.hoverOpacity)
                .classed('highlighted', true)
                .classed('highlight-locked', lock)
                .each(function () {
                    this.parentNode.appendChild(this);
                });

            fireRibbonHighlightEvent(key, '', r, events.ribbon.highlight);

            r = _self.scRibbons
                .filter(':not(' + keyFilter + ')');
            if (keepExisting) {
                r = r.filter(':not(.highlighted)');
            }
            if (r.size()) {
                r.classed('highlighted', false)
                    .attr("fill-opacity", _self.config.ribbon.hoverInverseOpacity);

                fireRibbonHighlightEvent(key, '', r, events.ribbon.highlightRemoved);
            }
        }
    }

    /**
     * Highlight ribbons by attribute
     * @param {string} attribute attribute name
     * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
     * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
     *                       by user interactions
     */
    function highlightRibbonByAttribute(attribute, keepExisting, lock) {
        if (attribute && typeof attribute === 'string') {
            var attrFilter = '[sc-data-attribute="' + attribute + '"]';

            var r = _self.scRibbons
                .filter(attrFilter)
                .attr('fill-opacity', _self.config.ribbon.hoverOpacity)
                .classed('highlighted', true)
                .classed('highlight-locked', lock)
                .each(function () {
                    this.parentNode.appendChild(this);
                });

            fireRibbonHighlightEvent('', attribute, r, events.ribbon.highlight);

            r = _self.scRibbons
                .filter(':not(' + attrFilter + ')');
            if (keepExisting) {
                r = r.filter(':not(.highlighted)');
            }
            if (r.size()) {
                r.classed('highlighted', false)
                    .attr("fill-opacity", _self.config.ribbon.hoverInverseOpacity);

                fireRibbonHighlightEvent(attribute, '', r, events.ribbon.highlightRemoved);
            }
        }
    }

    /**
     * Invoke callback for ribbon highlights and highlight removed
     * @param {string} [key] key name
     * @param {string} [attribute] attribute attribute name
     * @param {Object} ribbons d3 selection of ribbons
     * @param {string} event event name
     */
    function fireRibbonHighlightEvent(key, attribute, ribbons, event) {
        if (_self.eventManager.getRegisteredCallback(event)) {
            var eventData = {
                elements: [],
                data: {
                    value: []
                },
                event: event,
                source: 'ribbon'
            };
            if (key)
                eventData.data.key = key;
            if (attribute)
                eventData.data.attribute = attribute;

            ribbons.each(function (d) {
                eventData.elements.push(this);
                eventData.data.value.push(d.scData);
            });

            // fire event
            if (eventData.elements.length > 0) {
                _self.eventManager.invokeCallback(eventData);
            }
        }
    }

    // label

    /**
     * Highlight all label of specified key and attribute
     * @param {string} key key value of the label
     * @param {string} attribute attribute value label
     * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
     */
    function highlightLabel(key, attribute, keepExisting) {
        if (typeof key === 'string' && typeof attribute === 'string') {

            var attrFilter = '[sc-data-attribute="' + attribute + '"]';
            var keyFilter = '[sc-data-key="' + key + '"]';

            _self.scLabels
                .filter(attrFilter + keyFilter)
                .classed('highlighted', true)
                .attr('fill-opacity', _self.config.valueLabel.fontHighlightOpacity)
                .attr('font-size', _self.config.valueLabel.fontSize
                    + _self.config.valueLabel.fontHighlightSizeIncrement)
                .attr('font-weight', 'bold');

            if (!keepExisting) {
                _self.scLabels
                    .filter(attrFilter + ':not(' + keyFilter + ')')
                    .classed('highlighted', false)
                    .attr('font-weight', 'normal')
                    .attr('font-size', _self.config.valueLabel.fontSize)
                    .attr('fill-opacity', _self.config.valueLabel.fontOpacity)
                    .attr('fill', _self.config.valueLabel.fontHighlightInverseColor);
            }
            if (_self.config.valueLabel.autoHide) {
                _self.scBackdrops
                    .filter(attrFilter)
                    .attr('fill-opacity', _self.config.valueLabel.backdropHighlightOpacity);
            }
        }
    }

    /**
     * Highlight all label of specified key
     * @param {string} key key value of the label
     * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
     */
    function highlightLabelByKey(key, keepExisting) {
        if (typeof key === 'string') {

            var keyFilter = '[sc-data-key="' + key + '"]';

            _self.scLabels
                .filter(keyFilter)
                .classed('highlighted', true)
                .attr('fill-opacity', _self.config.valueLabel.fontHighlightOpacity)
                .attr('font-size', _self.config.valueLabel.fontSize
                    + _self.config.valueLabel.fontHighlightSizeIncrement)
                .attr('font-weight', 'bold');

            if (!keepExisting) {
                _self.scLabels
                    .filter(':not(' + keyFilter + ')')
                    .classed('highlighted', false)
                    .attr('font-size', _self.config.valueLabel.fontSize)
                    .attr('fill-opacity', _self.config.valueLabel.fontOpacity)
                    .attr('font-weight', 'normal')
                    .attr('fill', _self.config.valueLabel.fontHighlightInverseColor);
            }

            if (_self.config.valueLabel.autoHide) {
                _self.scBackdrops
                    .attr('fill-opacity', _self.config.valueLabel.backdropHighlightOpacity);
            }
        }
    }

    /**
     * Highlight all label of specified attribute
     * @param {string} attribute attribute value of the label
     * @param {boolean} [keepExisting = false] true to preserve
     *                                                       existing highlighted ribbons
     */
    function highlightLabelByAttribute(attribute, keepExisting) {
        if (typeof attribute === 'string') {

            var attrFilter = '[sc-data-attribute="' + attribute + '"]';

            _self.scLabels
                .filter(attrFilter)
                .classed('highlighted', true)
                .attr('fill-opacity', _self.config.valueLabel.fontHighlightOpacity)
                .attr('font-weight', 'bold');

            if (!keepExisting) {
                _self.scLabels
                    .filter(':not(' + attrFilter + ')')
                    .classed('highlighted', false)
                    .attr('font-size', _self.config.valueLabel.fontSize)
                    .attr('fill-opacity', _self.config.valueLabel.fontOpacity)
                    .attr('font-weight', 'normal')
                    .attr('fill', _self.config.valueLabel.fontHighlightInverseColor);
            }

            if (_self.config.valueLabel.autoHide) {
                _self.scBackdrops
                    .filter(attrFilter)
                    .attr('fill-opacity', _self.config.valueLabel.backdropHighlightOpacity);
            }
        }
    }

    /**
     * Reset all highlighting
     * @param {boolean} removeLocks true to reset highlights for locked elements as well
     */
    var resetHighlights = function (removeLocks) {
        if (_self.clickManager.isClicked())
            return;

        var r = _self.scRibbons.filter(".highlighted"); // ribbon highlights to be removed

        if (removeLocks) {
            r = _self.scRibbons.filter(":not(.highlight-locked)");
        }

        r.classed('highlighted', false)
            .classed('highlight-locked', false)
            .attr("fill-opacity", _self.config.ribbon.opacity);

        fireRibbonHighlightEvent('', '', r, events.ribbon.highlightRemoved);

        _self.scLabels
            .classed('highlighted', false)
            .attr('fill-opacity', function () {
                return _self.config.valueLabel.autoHide ?
                    0 : _self.config.valueLabel.fontOpacity;
            })
            .attr('font-size', _self.config.valueLabel.fontSize)
            .attr('fill', function (d) {
                return d.color;
            })
            .attr('font-weight', 'normal');
        _self.scBackdrops
            .classed('highlighted', false)
            .attr('fill-opacity', function () {
                return _self.config.valueLabel.autoHide ?
                    0 : _self.config.valueLabel.backdropOpacity;
            });

    };

    return {
        highlightRibbon: highlightRibbon,
        highlightRibbonByValue: highlightRibbonByValue,
        highlightRibbonByKey: highlightRibbonByKey,
        highlightRibbonByAttribute: highlightRibbonByAttribute,
        highlightLabel: highlightLabel,
        highlightLabelByKey: highlightLabelByKey,
        highlightLabelByAttribute: highlightLabelByAttribute,
        resetHighlights: resetHighlights
    }
};;_SC.prototype.getExport = function () {
    var _self = this;
    return {
        /**
         * Get or set the config object
         * @param {Object} [c] new config object to set
         */
        config: function (c) {
            if (c) {
                _self.config = c;
				_self.validateConfig();
                _self.update();
            }
            return _self.config;
        },

        /**
         * Update semi-cord with new data
         * @param {[Object]} d JSON data for the chart
         * @param {[string]} [dA] Data Attributes : array of attribute names corresponding to the
         *                        property names in the given data. By default, all
         *                        properties of the 1st object in the given data array
         *                        are treated as the attributes
         * @param {string} [dK] Data Key : property to be treated as the key in the given data.
         *                                 By default, 1st property of the 1st object in the given
         *                                 data array is treated as key
         */
        update: function (d, dA, dK) {
            _self.data = d || _self.data;
            _self.dataAttributes = dA || _self.dataAttributes;
            _self.dataKey = dK || _self.dataKey;
            _self.update();
        },

        /**
         * Redraw semi-chord
         */
        redraw: function(){
			_self.redraw();
		},

        /**
         * Delete the semi-chord
         */
        delete: function () {
            _self.d3RootNode.remove();
            _self.d3RootNode = d3.select(_self.parentElement);
        },

        elements: {

            /**
             * Get the semi chord SVG element
             * @returns {SVGGroupElement} semi chord SVG element
             */
            getSVGElement: function () {
                return _self.d3RootNode.node();
            },

            /**
             * Get the color associated with specified attribute
             * @param {string} attribute attribute name
             * @returns {string} color of the specified attribute
             */
            getAttributeColor: function (attribute) {
                if (attribute)
                    return _self.cc.colorScale(attribute);
            }
        },

        events: {
            /**
             * Register for event
             * @param {string} event event name. use getEventNames() method for available event names
             * @param {function} callback callback function
             * @returns {boolean} true, iff event registered successfully
             */
            registerCallback: function (event, callback) {
                return _self.eventManager.registerCallback(event, callback);
            },

            /**
             * Get all available event names
             * @returns {Object} heirarchical event names
             */
            getEventNames: function () {
                return _self.eventManager.getEventNames();
            },

            /**
             * Get registered callback for the specified event
             * @param {string} event event name
             * @returns {function} callback function for the specified event.
             *                     undefined if no callback is registered for the specified event
             */
            getRegisteredCallback: function (event) {
                if (typeof event === 'string')
                    return _self.eventManager.getRegisteredCallback(event);
                else
                    return null;
            },

            /**
             * Clear all registered callback
             */
            clearRegisteredCallbacks: function () {
                _self.eventManager.clearRegisteredCallbacks();
            }
        },

        interactions: {
            /**
             * Enable or disable interactions
             * @param {boolean} [value = true] true to enable, false to disable
             */
            enable: function (value) {
                value = (typeof value === 'undefined') ? true : value;
                _self.config.disableInteractions = !value;
            },

            /**
             * Highlight specified ribbon
             * @param {SVGPathElement} e SVG element corresponding to the ribbon
             * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
             * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
             *                       by user interactions
             * @param {boolean} [excludeLabel = false] true to prevent highlighting of associated
             *                                         label text
             */
            highlightRibbonByElement: function (e, keepExisting, lock, excludeLabel) {
                _self.highlighting.highlightRibbon(e, keepExisting, lock);

                if (!excludeLabel) {
                    var d = d3.select(e).data()[0];
                    // highlight label text
                    _self.highlighting.highlightLabel(d.scData.key, d.scData.attribute, lock);
                }
            },

            /**
             * Highlight specified ribbon
             * @param {string} value value of the ribbon
             * @param {string} key key name
             * @param {string} attribute attribute name
             * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
             * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
             *                       by user interactions
             * @param {boolean} [excludeLabel = false] true to prevent highlighting of associated
             *                                         label text
             */
            highlightRibbonByValue: function (value, key, attribute, keepExisting,
                                              lock, excludeLabel) {
                var r = _self.highlighting.highlightRibbonByValue(value, key, attribute,
                    keepExisting, lock);

                if (!excludeLabel) {
                    r.each(function (d) {
                        _self.highlighting.highlightLabel(d.scData.key, d.scData.attribute, lock);
                    });
                }
            },

            /**
             * Highlight ribbon by key
             * @param {string} key key name
             * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
             * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
             *                       by user interactions
             * @param {boolean} [excludeLabel = false] true to prevent highlighting of associated
             *                                         label text
             */
            highlightRibbonByKey: function (key, keepExisting, lock, excludeLabel) {
                _self.highlighting.highlightRibbonByKey(key, keepExisting, lock);

                if (!excludeLabel) {
                    // highlight label text
                    _self.highlighting.highlightLabelByKey(key, keepExisting, lock);
                }
            },

            /**
             * Highlight ribbon by key
             * @param {string} attribute attribute name
             * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
             * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
             *                       by user interactions
             * @param {boolean} [excludeLabel = false] true to prevent highlighting of associated
             *                                         label text
             */
            highlightRibbonByAttribute: function (attribute, keepExisting, lock, excludeLabel) {
                _self.highlighting.highlightRibbonByAttribute(attribute, keepExisting, lock);

                if (!excludeLabel) {
                    // highlight label text
                    _self.highlighting.highlightLabelByAttribute(attribute, keepExisting, lock);
                }
            },
			
			resetHighlights: function(){
				_self.clickManager.reset();
				_self.highlighting.resetHighlights();
			}
        }
    };
};;'use strict';

/**
 * Create a Semi-Chord chart
 * @param {string | SVGElement | HTMLElement} parentElement container for the chart
 * @param {[Object]} data JSON data for the chart
 * @param {Object} [config] configuration data
 * @param {[string]} [dataAttributes] array of attribute names corresponding to the property names
 *                                    in the given data. By default, all properties of the 1st 
 *                                    object in the given data array are treated as the attributes
 * @param {string} [dataKey] property to be treated as the key in the given data. By default, 1st
 *                           property of the 1st object in the given data array is treated as key
 */
function semiChord(parentElement, data, config, dataAttributes, dataKey) {
    // check if D3 is loaded
    if (!d3) {
        throw 'semi-chord: D3.js required. Please visit https://d3js.org/';
    }

    var sc = new _SC(parentElement, data, config, dataAttributes, dataKey);
    return sc.getExport();
}