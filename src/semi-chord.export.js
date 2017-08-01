_SC.prototype.getExport = function () {
    var _self = this;
    return {
        /**
         * Get or set the config object
         * @param {Object} [c] new config object to set
         */
        config: function (c) {
            if (c) {
                _self.config = _self.validateConfig(c);
                _self.update();
            }
            return this.config;
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
        redraw: _self.redraw,

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
             * @param {boolean} [excludeLabel = false] true to prevent highlighting of associated
             *                                         label text
             */
            highlightRibbonByElement: function (e, keepExisting, excludeLabel) {
                _self.highlighting.highlightRibbon(e, keepExisting);

                if (!excludeLabel) {
                    var d = d3.select(e).data()[0];
                    // highlight label text
                    _self.highlighting.highlightLabel(d.scData.key, d.scData.attribute);
                }
            },

            /**
             * Highlight specified ribbon
             * @param {string} value value of the ribbon
             * @param {string} key key name
             * @param {string} attribute attribute name
             * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
             * @param {boolean} [excludeLabel = false] true to prevent highlighting of associated
             *                                         label text
             */
            highlightRibbonByValue: function (value, key, attribute, keepExisting, excludeLabel) {
                var r = _self.highlighting.highlightRibbonByValue(value, key, attribute,
                    keepExisting);

                if (!excludeLabel) {
                    r.each(function (d) {
                        _self.highlighting.highlightLabel(d.scData.key, d.scData.attribute);
                    });
                }
            },

            /**
             * Highlight ribbon by key
             * @param {string} key key name
             * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
             * @param {boolean} [excludeLabel = false] true to prevent highlighting of associated
             *                                         label text
             */
            highlightRibbonByKey: function (key, keepExisting, excludeLabel) {
                _self.highlighting.highlightRibbonByKey(key, keepExisting);

                if (!excludeLabel) {
                    // highlight label text
                    _self.highlighting.highlightLabelByKey(key, keepExisting);
                }
            },

            /**
             * Highlight ribbon by key
             * @param {string} attribute attribute name
             * @param {boolean} [keepExisting = false] true to preserve existing highlighted ribbons
             * @param {boolean} [excludeLabel = false] true to prevent highlighting of associated
             *                                         label text
             */
            highlightRibbonByAttribute: function (attribute, keepExisting, excludeLabel) {
                _self.highlighting.highlightRibbonByAttribute(attribute, keepExisting);

                if (!excludeLabel) {
                    // highlight label text
                    _self.highlighting.highlightLabelByAttribute(attribute, keepExisting);
                }
            }
        }
    };
};