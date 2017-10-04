/** -------- HIGHLIGHTING ------------*/
_SC.prototype.getHighlighting = function() {
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
                .classed('highlight-locked', function() {
                    return lock || d3.select(this).classed('highlight-locked');
                })
                .datum();

            e.parentNode.appendChild(e);

            //fire highlight event
            _self.eventManager.dispatcher([e], d, 'ribbon', events.ribbon.highlight);

            return d;
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
            .classed('highlight-locked', function() {
                return lock || d3.select(this).classed('highlight-locked');
            })
            .each(function(d) {
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
                .classed('highlight-locked', function() {
                    return lock || d3.select(this).classed('highlight-locked');
                })
                .each(function() {
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

            return r;
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
                .classed('highlight-locked', function() {
                    return lock || d3.select(this).classed('highlight-locked');
                })
                .each(function() {
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

            return r;
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
        // rest paint order for keys to prevent ribbons showing over keys
        _self.d3RootNode.select("g.key-group").each(function() {
            this.parentNode.appendChild(this);
        });

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

            ribbons.each(function(d) {
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
     * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
     *                       by user interactions

     */
    function highlightLabel(key, attribute, keepExisting, lock) {
        if (typeof key === 'string' && typeof attribute === 'string') {

            var attrFilter = '[sc-data-attribute="' + attribute + '"]';
            var keyFilter = '[sc-data-key="' + key + '"]';

            _self.scLabels
                .filter(attrFilter + keyFilter)
                .classed('highlighted', true)
                .classed('highlight-locked', function() {
                    return lock || d3.select(this).classed('highlight-locked');
                })
                .attr('fill', function(d) {
                    return d.color;
                })
                .attr('fill-opacity', _self.config.valueLabel.fontHighlightOpacity)
                .attr('font-size', _self.config.valueLabel.fontSize +
                    _self.config.valueLabel.fontHighlightSizeIncrement)
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
     * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
     *                       by user interactions
     */
    function highlightLabelByKey(key, keepExisting, lock) {
        if (typeof key === 'string') {

            var keyFilter = '[sc-data-key="' + key + '"]';

            _self.scLabels
                .filter(keyFilter)
                .classed('highlighted', true)
                .classed('highlight-locked', function() {
                    return lock || d3.select(this).classed('highlight-locked');
                })
                .attr('fill', function(d) {
                    return d.color;
                })
                .attr('fill-opacity', _self.config.valueLabel.fontHighlightOpacity)
                .attr('font-size', _self.config.valueLabel.fontSize +
                    _self.config.valueLabel.fontHighlightSizeIncrement)
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
     * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
     * @param {boolean} lock true to lock highlighting. This prevents highlights from being reset
     *                       by user interactions
     */
    function highlightLabelByAttribute(attribute, keepExisting, lock) {
        if (typeof attribute === 'string') {

            var attrFilter = '[sc-data-attribute="' + attribute + '"]';

            _self.scLabels
                .filter(attrFilter)
                .classed('highlighted', true)
                .classed('highlight-locked', function() {
                    return lock || d3.select(this).classed('highlight-locked');
                })
                .attr('fill', function(d) {
                    return d.color;
                })
                .attr('fill-opacity', _self.config.valueLabel.fontHighlightOpacity)
                .attr('font-size', _self.config.valueLabel.fontSize +
                    _self.config.valueLabel.fontHighlightSizeIncrement)
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
     * @param {boolean} includeLocks true to reset highlights for locked elements as well
     */
    var resetHighlights = function(includeLocks) {
        if (_self.clickManager.isClicked())
            return;

        var r = _self.scRibbons;

        if (!includeLocks) {
            var locked = _self.scRibbons.filter(".highlight-locked");
            if (locked.size() > 0) {
                r = _self.scRibbons.filter(":not(.highlight-locked)");
                r.classed('highlighted', false)
                    .attr("fill-opacity", _self.config.ribbon.hoverInverseOpacity);
                locked.attr("fill-opacity", _self.config.ribbon.hoverOpacity);
            } else {
                r.classed('highlighted', false)
                    .attr("fill-opacity", _self.config.ribbon.opacity);
            }
        } else {
            r.classed('highlighted', false)
                .classed('highlight-locked', false)
                .attr("fill-opacity", _self.config.ribbon.opacity);
        }

        fireRibbonHighlightEvent('', '', r, events.ribbon.highlightRemoved);

        var l = _self.scLabels;
        var lLocked = l.filter(".highlight-locked");
        var b = _self.scBackdrops;

        if (!includeLocks && lLocked.size() > 0) {
            lLocked
                .attr('font-size', _self.config.valueLabel.fontSize +
                    _self.config.valueLabel.fontHighlightSizeIncrement)
                .attr('font-weight', 'bold')
                .attr('font-size', _self.config.valueLabel.fontSize)
                .attr('fill', function(d) {
                    return d.color;
                })
                .attr('fill-opacity', function() {
                    return _self.config.valueLabel.autoHide ?
                        0 : _self.config.valueLabel.fontOpacity;
                });

            l.filter(":not(.highlight-locked)")
                .classed('highlighted', false)
                .attr('font-size', _self.config.valueLabel.fontSize)
                .attr('fill', _self.config.valueLabel.fontHighlightInverseColor)
                .attr('font-weight', 'normal')
                .attr('fill-opacity', function() {
                    return _self.config.valueLabel.autoHide ?
                        0 : _self.config.valueLabel.fontOpacity;
                });
            //TODO: highlight-locked for backdrop
        } else {
            _self.scLabels
                .classed('highlighted', false)
                .attr('fill-opacity', function() {
                    return _self.config.valueLabel.autoHide ?
                        0 : _self.config.valueLabel.fontOpacity;
                })
                .attr('font-size', _self.config.valueLabel.fontSize)
                .attr('fill', function(d) {
                    return d.color;
                })
                .attr('font-weight', 'normal');
            _self.scBackdrops
                .classed('highlighted', false)
                .attr('fill-opacity', function() {
                    return _self.config.valueLabel.autoHide ?
                        0 : _self.config.valueLabel.backdropOpacity;
                });
        }

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
};