L.CanvasOverlay = L.Class.extend({

    initialize: function (userDrawFunc, options) {
        this._userDrawFunc = userDrawFunc;
        L.setOptions(this, options);
    },

    p5Canvas: function (canvas) {
        this._canvas = canvas.canvas;
        return this;
    },

    drawing: function (userDrawFunc) {
        this._userDrawFunc = userDrawFunc;
        return this;
    },

    params: function (options) {
        L.setOptions(this, options);
        return this;
    },

    canvas: function () {
        return this._canvas;
    },

    redraw: function () {
        if (!this._frame) {
            this._frame = L.Util.requestAnimFrame(this._redraw, this);
        }
        return this;
    },



    onAdd: function (map) {
        this._map = map;
        var canvas2 = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');

        var size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));


        map._panes.overlayPane.appendChild(this._canvas);

        map.on('moveend', this._reset, this);
        map.on('resize', this._resize, this);

        if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }

        this._reset();
    },

    onRemove: function (map) {
        map.getPanes().overlayPane.removeChild(this._canvas);

        map.off('moveend', this._reset, this);
        map.off('resize', this._resize, this);

        if (map.options.zoomAnimation) {
            map.off('zoomanim', this._animateZoom, this);
        }
        this_canvas = null;

    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    _resize: function (resizeEvent) {
        this._canvas.width = resizeEvent.newSize.x;
        this._canvas.height = resizeEvent.newSize.y;
    },
    _reset: function () {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._redraw();
    },

    _redraw: function () {
        var size = this._map.getSize();
        var bounds = this._map.getBounds();
        var zoomScale = (size.x * 180) / (20037508.34 * (bounds.getEast() - bounds.getWest())); // resolution = 1/zoomScale
        var zoom = this._map.getZoom();

        // console.time('process');

        if (this._userDrawFunc) {
            this._userDrawFunc(this, {
                canvas: this._canvas,
                bounds: bounds,
                size: size,
                zoomScale: zoomScale,
                zoom: zoom,
                options: this.options
            });
        }


        // console.timeEnd('process');

        this._frame = null;
    },

    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom),
            offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

        this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';

    }
});

L.canvasOverlay = function (userDrawFunc, options) {
    return new L.CanvasOverlay(userDrawFunc, options);
};



var canvas;
var map;
var animRoute;
var features;

function setup() {

    canvas = createCanvas();


    map = L.map('map', {
        zoomControl: false
    });
    /*
    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    });

    layer.addTo(map);
    */
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);


    map.setView([40.70531887544228, -74.00976419448853], 15);

    L.canvasOverlay()
        .p5Canvas(canvas)
        .drawing(drawingOnCanvas)
        .addTo(map);



    var wps = [
        L.latLng(57.74, 11.94),
        L.latLng(57.6792, 11.949)
      ];

    var rr = L.Routing.control({
        waypoints: wps,
        geocoder: null,
        transitemode: 'bicycle',
    }).addTo(map);

    //map.on("viewreset", reset);
    //map.on("move", reset);

    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");


    var transform = d3.geo.transform({
        point: projectPoint
    });
    var d3path = d3.geo.path().projection(transform);

    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }

    rr.on('routesfound', function (e) {
        data = getData(e.routes[0]);

        var marker = svg.append("circle")
            .attr('id', 'marker');

        var lineGeneratorBasis = d3.svg.line()
            .x(function (d) {
                return applyLatLngToLayer(d).x
            })
            .y(function (d) {
                return applyLatLngToLayer(d).y
            })
            .interpolate('monotone');


        var wps = g.selectAll('.wps')
            .data([data])
            .enter()
            .append("path")
            .attr('class', 'wps')
            .attr('id', 'waypoint')
            .attr('d', lineGeneratorBasis);



        wps
            .transition()
            .duration(9000)
            .attrTween("stroke-dasharray", tweenDash);


        function tweenDash() {
            return function (t) {
                var l = wps.node().getTotalLength();
                var p = wps.node().getPointAtLength(l * t);
                var marker = d3.select('#marker');
                marker.attr('x', p.x);
                marker.attr('y', p.y);
                return d3.interpolate(l);
            }
        }

    });

}

function drawingOnCanvas(canvasOverlay, params) {
    var ctx = params.canvas.getContext('2d');
    
    draw();
};


function getData(route) {

    var collection = {};
    collection.features = [];

    for (var i = 0; i < route.coordinates.length; i++) {
        collection.features[i] = {
            type: "feature",
            properties: {
                time: i + 1,
                name: i + 1,
                id: "route1"
            },
            geometry: {
                type: "Point",
                coordinates: [route.coordinates[i][0], route.coordinates[i][1]]
            }
        }
    }


    return collection.features.filter(function (d) {
        return true; // d.properties.id == "route1";
    });
}


function applyLatLngToLayer(d) {
    var y = d.geometry.coordinates[0]
    var x = d.geometry.coordinates[1]
    return map.latLngToLayerPoint(new L.LatLng(y, x))
        //return L.point(x, y, false);
        //return map.latLngToContainerPoint(new L.LatLng(y, x))
}


function reset() {
    clear();
}

function draw() {
    fill('green');
    ellipse(1000, 1000, 120, 120);
    clear();
    var m = getElement('marker');
    if (m) {
        push();
        translate(m.attribute('x'), m.attribute('y'));
        console.log(m.attribute('x') + ' ' + m.attribute('y'));
        fill('blue');
        ellipse(0, 0, 400, 400);
        pop();
    }

}