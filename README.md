# semi-chord

A D3.js based chart similar to a chord diagram with all the bells and whisles

### :zap: [live demo](http://meetvikas.net/projects/semi-chord/demo/index.html) :zap:

*preview image:*
![semi-chord sample image](https://github.com/hrivks/blob/raw/master/semi-chord-sample.png)

### Installation

##### Through NPM

```
npm install semi-chord
```
##### Include in HTML

```html
<!-- D3.js (REQUIRED) -->
<script src="https://d3js.org/d3.v4.min.js"></script>
<!-- semi-chord.js -->
<script src="semi-chord.min.js"></script>
```

### Basic Use

```javascript
var myData = [
			{ "product" : "Foo",
			  "2014" : "34.5K",
			  "2015": "24.1K",
              "2016": "12.5K",
              "2017": "29.9K" }
			  //, {...} more JSON objects
			  ];
			  
var sc = semiChord({
            selector: '#my-div',
            data: data,
            dataKey: 'product' 
        });
// sc object can be used to manipulate the chart
```

The data for the chart must be a valid JSON array.

**key:**
One property of the JSON object must be specified as the key. This forms the small gray dots on the left side of the circle.

**attributes:**
All properties of the JSON object other than the key constitute the attributes. These form the colored arcs on the right side of the circle

The values of the attributes become the ribbons connecting the key dots and the attribute arcs

**Sample Json**
```javascript
var data = [{
            "product": "Foo",
            "2014": "34.5K",
            "2015": "24.1K",
            "2016": "12.5K",
            "2017": "29.9K"
        }, {
            "product": "Bar",
            "2014": "54.5K",
            "2015": "23.1K",
            "2016": "2.5K",
            "2017": "10.9K"
        }, {
            "product": "Qux",
            "2014": "29.2K",
            "2015": "13.4K",
            "2016": "27.8K",
            "2017": "18.3K"
        }, {
            "product": "Baz",
            "2014": "11.5K",
            "2015": "28.3K",
            "2016": "18.4K",
            "2017": "19.9K"
        }];
```

**selector**
The HTML element into which the chart must be drawn.
If no size is specified through the config object, the size of the selector element is taken.

**config**
the config object can be passed to specify various appearance and behavior. 
```javascript
var config = { ... };
var sc = semiChord({
            selector: '#my-div',
            data: data,
            dataKey: 'product',
            config: config
        });
```
The config object supports the following properties. All properties are optional and defaults to the values given here
```javascript
{
        width: 600, // width of the chart
        height: 400, // height of the chart
        radius: 133, // radius of the outer cirlce
        centerX: 240, // x coordinate of outer cirlce
        centerY: 200, // y coordinate of outer circle
        disableInteractions: false, // turn on / off interactions
        colorScheme: d3.schemeCategory10,
        fontFamily: 'sans-serif',
        outlineCircle: {
            stroke: '#EEE', // line color of the outline circle
            fill: 'none', // background color of the circle
            strokeWidth: '0.25' // line width of the outline circle
        },
        ribbon: {
            opacity: 0.5, // default opacity
            hoverOpacity: 0.7, // opacity on hover
            hoverInverseOpacity: 0.1 // opacity of other ribbons on hover
        },
        arc: {
            innerPadding: 0.02, // padding between arcs
            outerPadding: 0.2, // padding before and after the first and last arc respectively
            rangeStart: 0, // start radian angle. valid range: 0 to 1
            rangeEnd: 0.5,  // end radian angle. valid range: 0 to 1
            width: 15, // thickness of the arc
            titleTextOffset: 15 // space between arc and title text
        },
        key: {
            radius: 10,
            color: '#AAA', // circle fill color
            fontColor: '#AAA', // font color of the key text
            fontSize: 14, // font size of the key text
            rangeStart: 0.65, // start radian angle. valid range: 0 to 1
            rangeEnd: 0.85 // end radian angle. valid range: 0 to 1
        },
        valueLabel: {
            offsetX: 30, // space between attribute title and label text
			backdropOffsetX: 12, // space between attribute title and backdrop beginning point
            backdropOffsetXRight: 1, // right padding for the backdrop
            fontSize: 11, // font size of the label text
            verticalSpace: 12, // vertical space between label texts
            fontOpacity: 0.8, // default opacity of the label texts
            fontHighlightOpacity: 1, // opacity of the highlighted label text
            fontHighlightInverseColor: '#AAA', /* font color of other label texts when one
												  or more label is highlighted */
            fontHighlightSizeIncrement: 0, // font size to increase on highlight
            backdropOpacity: 0.2, // opacity of the backdrop shape
            backdropHighlightOpacity: 0.3, // backdrop opacity when attribute is highlighted
            disable: false,
            autoHide: false
        }
    };
```


### Manipulations
To highlight ribbons by key:
```javascript
sc.interactions.highlightRibbonByKey('Foo');
```

To highlight ribbons by attribute:
```javascript
sc.interactions.highlightRibbonByAttribute('2014');
```
To highlight ribbons by value:
```javascript
sc.interactions.highlightRibbonByValue('34.5K');
// more specific: value within a key or attribute
sc.interactions.highlightRibbonByValue('34.5K', 'Foo', '2014');
```

### More options

for a complete list of available options, check the [wiki page](https://github.com/hrivks/semi-chord/wiki)