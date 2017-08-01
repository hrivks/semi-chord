/**
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

    /**---- Value Labels ------**/

        // new values labels to create on attribute arcs    
    var valueLabelGroup = arcTextsGroup.selectAll('g.value-labels')
            .data([_self.dataAttributes])
            .enter()
            .append('g')
            .classed('value-labels', true)
            .attr('fill-opacity', function () {
                return config.valueLabel.autoHide ? 0 : 1;
            });

    var valueLabels = valueLabelGroup.selectAll('text.attribute-value-label')
        .data(_self.dataAttributes.map(function (d, i) {
            // list of all values for current attribute
            var valuesText = data.map(function (e) {
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
                    x: d.x - 5 + Math.abs(dyScale(0)) / 2,
                    y: d.y + dyScale(0) - 15
                },
                bottom: {
                    x: d.x - 5 + Math.abs(dyScale(d.values.length - 1)) / 2,
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
                        key: data[j][_self.dataKey],
                        attribute: d.attribute,
                        value: data[j][d.attribute]
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
            return config.valueLabel.autoHide ? 0 : config.valueLabel.fontOpacity;
        })
        .on('mouseenter', function (d) {
            if (config.valueLabel.autoHide)
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
            if (config.valueLabel.autoHide)
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
                value: data.map(function (e) {
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
            return config.valueLabel.autoHide ? 0 : config.valueLabel.backdropOpacity;
        })
        .attr('fill', function (d) {
            return d.color;
        })
        .on('mouseenter', function (d) {
            if (config.valueLabel.autoHide)
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
            if (config.valueLabel.autoHide)
                return;
            interactions.onAttributeClick(this, d);
            // fire callbacks
            eventManager.dispatcher([this], d, 'label', events.label.click);
        });

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
