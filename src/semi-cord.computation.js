/**
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

