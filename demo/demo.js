// just demo. globals are oK!
var scObj;

/**
 * Parse data from textarea
 **/
function parseData() {
    return JSON.parse(document.getElementsByTagName('textarea')[0].value);
}

/**
 * create chart and other UI elements
 */
function onLoad() {
    var data = parseData();
    var dataKey = document.getElementById("dataKey").value;
    scObj = semiChord({
        selector: '#scContainer1',
        data: data,
        dataKey: dataKey
    });
    loadUi();
}

/**
 * Update chart with new JSON data
 */
function onDataUpdate() {
    var data = JSON.parse(document.getElementsByTagName('textarea')[0].value);
    var dataKey = document.getElementById("dataKey").value;
    scObj.update({
        data: data,
        dataKey: dataKey
    });
}

/**
 * Turn on / off chart interactions
 */
function toggleInteractions() {
    scObj.interactions.enable(document.getElementById("enableInteractions").checked);
}

/**
 * Load buttons for interactions based on data
 */
function loadUi() {
    var data = JSON.parse(document.getElementsByTagName('textarea')[0].value);
    var dataKey = document.getElementById("dataKey").value;

    // create highlight by key buttons
    var buttonsHtml = [];
    var buttonBaseHtml = '<div class="btn btn-sm btn-secondary m-1" onclick="highlightByKey(\'{key}\')">{key}</div>';
    data.forEach(function(i) {
        buttonsHtml.push(buttonBaseHtml.toString().replace(/{key}/g, i[dataKey]));
    });

    document.getElementById('highlight-by-key-wrap').innerHTML = buttonsHtml.join('');
    buttonBaseHtml = '<div class="btn btn-sm btn-secondary m-1" onclick="highlightByAttr(\'{attr}\')">{attr}</div>';

    // create highlight by attr buttons
    buttonsHtml = [];
    var allAttr = [];
    data.forEach(function(i) {
        for (var prop in i) {
            if (i.hasOwnProperty(prop) && prop !== dataKey && allAttr.indexOf(prop) == -1)
                allAttr.push(prop);
        }
    });

    allAttr.forEach(function(i) {
        buttonsHtml.push(buttonBaseHtml.toString().replace(/{attr}/g, i));
    });
    document.getElementById('highlight-by-attr-wrap').innerHTML = buttonsHtml.join('');

    // populate first attribute value 
    document.getElementById('highlight-by-value').value = data[0][allAttr[0]];
}

/**
 * Highlight chart by key
 */
function highlightByKey(k) {
    var preserve = document.getElementById('preserve-previous-highlights').checked;
    var lock = document.getElementById('lock-highlights').checked;

    scObj.interactions.highlightRibbonByKey(k, preserve, lock);
}

/**
 * Highlight chart by attribute
 */
function highlightByAttr(a) {
    var preserve = document.getElementById('preserve-previous-highlights').checked;
    var lock = document.getElementById('lock-highlights').checked;

    scObj.interactions.highlightRibbonByAttribute(a, preserve, lock);
}

/**
 * Highlight chart by value
 */
function highlightByValue() {
    var val = document.getElementById('highlight-by-value').value;
    var preserve = document.getElementById('preserve-previous-highlights').checked;
    var lock = document.getElementById('lock-highlights').checked;
    scObj.interactions.highlightRibbonByValue(val, false, false, preserve, lock);
}

/**
 * Reset all highlights
 */
function resetHighlights() {
    scObj.interactions.resetHighlights(true);
}

/**
 * toggle accordian chevron up or down
 * @param {HTMLElement} e the accordian heading element
 */
function toggleAccordianChevron(e) {
    $("#side-bar .card-header").each(function(i, elem) {
        if (elem === e) {
            $(elem).find('.fa').toggleClass('fa-chevron-down');
        } else {
            $(elem).find('.fa').addClass('fa-chevron-down');
        }
    });
}

// on page load
$(function() {
    onLoad();
});