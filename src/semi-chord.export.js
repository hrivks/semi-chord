_SC.prototype.getExport = function() {
    var _self = this;
    return {
        /**
         * Get or set the config object
         * @param {Object} [c] new config object to set
         */
        config: function(c) {
            if (c) {
                _self.config = c;
                _self.validateConfig();
                _self.update();
            }
            return _self.config;
        },

        /**
         * Update semi-cord with new data
         * @param {Object} d updated data for the chart
         * @property {[Object]} d.data JSON data for the chart
         * @property {[string]} [d.dataAttributes] Data Attributes : array of attribute names corresponding to the
         *                        property names in the given data. By default, all
         *                        properties of the 1st object in the given data array
         *                        are treated as the attributes
         * @property {string} [d.dataKey] Data Key : property to be treated as the key in the given data.
         *                                 By default, 1st property of the 1st object in the given
         *                                 data array is treated as key
         */
        update: function(d) {
            _self.data = d.data || _self.data;
            _self.dataAttributes = d.dataAttributes || _self.dataAttributes;
            _self.dataKey = d.datakey || _self.dataKey;
            _self.update();
        },

        /**
         * Redraw semi-chord
         */
        redraw: function() {
            _self.redraw();
        },

        /**
         * Delete the semi-chord
         */
        delete: function() {
            _self.d3RootNode.remove();
            _self.d3RootNode = d3.select(_self.parentElement);
        },

        elements: {

            /**
             * Get the semi chord SVG element
             * @returns {SVGGroupElement} semi chord SVG element
             */
            getSVGElement: function() {
                return _self.d3RootNode.node();
            },

            /**
             * Get the color associated with specified attribute
             * @param {string} attribute attribute name
             * @returns {string} color of the specified attribute
             */
            getAttributeColor: function(attribute) {
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
            registerCallback: function(event, callback) {
                return _self.eventManager.registerCallback(event, callback);
            },

            /**
             * Get all available event names
             * @returns {Object} heirarchical event names
             */
            getEventNames: function() {
                return _self.eventManager.getEventNames();
            },

            /**
             * Get registered callback for the specified event
             * @param {string} event event name
             * @returns {function} callback function for the specified event.
             *                     undefined if no callback is registered for the specified event
             */
            getRegisteredCallback: function(event) {
                if (typeof event === 'string')
                    return _self.eventManager.getRegisteredCallback(event);
                else
                    return null;
            },

            /**
             * Clear all registered callback
             */
            clearRegisteredCallbacks: function() {
                _self.eventManager.clearRegisteredCallbacks();
            }
        },

        interactions: {
            /**
             * Enable or disable interactions
             * @param {boolean} [value = true] true to enable, false to disable
             */
            enable: function(value) {
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
            highlightRibbonByElement: function(e, keepExisting, lock, excludeLabel) {
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
            highlightRibbonByValue: function(value, key, attribute, keepExisting,
                lock, excludeLabel) {
                var r = _self.highlighting.highlightRibbonByValue(value, key, attribute,
                    keepExisting, lock);

                if (!excludeLabel) {
                    r.each(function(d) {
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
            highlightRibbonByKey: function(key, keepExisting, lock, excludeLabel) {
                var r = _self.highlighting.highlightRibbonByKey(key, keepExisting, lock);

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
            highlightRibbonByAttribute: function(attribute, keepExisting, lock, excludeLabel) {
                _self.highlighting.highlightRibbonByAttribute(attribute, keepExisting, lock);

                if (!excludeLabel) {
                    // highlight label text
                    _self.highlighting.highlightLabelByAttribute(attribute, keepExisting, lock);
                }
            },

            /**
             * reset highlighted ribbons
             * @param {Boolean} includeLocks  true, to reset highlight locked elements
             */
            resetHighlights: function(includeLocks) {
                _self.clickManager.reset();
                _self.highlighting.resetHighlights(includeLocks);
            },

            /**
             * clear highlight-lock 
             */
            clearLocks: function() {
                _self.highlighting.clearLocks();
            }
        }
    };
};