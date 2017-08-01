'use strict';

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