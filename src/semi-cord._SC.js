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
    this.validateData();

    // validate config
    this.validateConfig();

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

