/**
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
        if (isFinite(s)) {
            return parseFloat(s);
        }
        var num = s.replace(/[^0-9.]/g, "");
        return num ? parseFloat(num) : 0;
    };
};