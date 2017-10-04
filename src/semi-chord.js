'use strict';

/**
 * Create a Semi-Chord chart
 * @param {Object} init initilization data
 * @property {string | SVGElement | HTMLElement} init.selector container for the chart
 * @property {[Object]} init.data JSON data for the chart
 * @property {Object} [init.config] configuration data
 * @property {[string]} [init.dataAttributes] array of attribute names corresponding to the property names
 *                                    in the given data. By default, all properties of the 1st 
 *                                    object in the given data array are treated as the attributes
 * @property {string} [init.dataKey] property to be treated as the key in the given data. By default, 1st
 *                           property of the 1st object in the given data array is treated as key
 */
function semiChord(init) {
    // check if D3 is loaded
    if (!d3) {
        throw 'semi-chord: D3.js required. Please visit https://d3js.org/';
    }

    var sc = new _SC(init.selector, init.data, init.config, init.dataAttributes, init.dataKey);
    return sc.getExport();
}