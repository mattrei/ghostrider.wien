
var canvas;
var map;
var animRoute;
var features;

var P5Layer;

function asetup() {

    canvas = createCanvas(windowWidth, windowHeight);




    
    var BigPointLayer = L.CanvasLayer.extend({
      renderCircle: function(ctx, point, radius) {
        ctx.fillStyle = 'rgba(255, 60, 60, 0.2)';
        ctx.strokeStyle = 'rgba(255, 60, 60, 0.9)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2.0, true, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      },
      render: function() {
        var canvas = this.getCanvas();
        var ctx = canvas.getContext('2d');
        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // get center from the map (projected)
        var point = this._map.latLngToContainerPoint(new L.LatLng(11, 57));
        // render
        this.renderCircle(ctx, point, (1.0 + Math.sin(Date.now()*0.001))*300);
        this.redraw();
      }
    });
    var layer = new BigPointLayer();
    layer.addTo(map);
    
    P5Layer = L.CanvasLayer.extend({
      render: function() {
        var canvas = this.getCanvas();
        var ctx = canvas.getContext('2d');
        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // get center from the map (projected)
        var point = this._map.latLngToContainerPoint(new L.LatLng(11, 0));
        // render
        this.renderCircle(ctx, point, (1.0 + Math.sin(Date.now()*0.001))*300);
        draw();
        this.redraw();
      }
    });
    var layer = new BigPointLayer();
    //layer.addTo(map);


    


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
    return P5Layer._map.latLngToLayerPoint(new L.LatLng(y, x))
    //    return L.point(x, y, false);
        //return map.latLngToContainerPoint(new L.LatLng(y, x))
}


function reset() {
    clear();
}

function adraw() {
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
    
    L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery <a href="http://stamen.com">Stamen</a>'
    }).addTo(map);




    map.setView([40.70531887544228, -74.00976419448853], 15);

    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");


var sketch = function (p) {
  var gray = 0;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function () {
    //p.background(gray);
      p.fill('green');
    p.rect(p.width/2, p.height/2, 200, 200);
  };

  p.mousePressed = function () {
    gray = (gray + 16) % 256;
  };
};

new p5(sketch, map.getPanes().overlayPane);

    var BigPointLayer = L.CanvasLayer.extend({
      renderCircle: function(ctx, point, radius) {
        ctx.fillStyle = 'rgba(255, 60, 60, 0.2)';
        ctx.strokeStyle = 'rgba(255, 60, 60, 0.9)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2.0, true, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      },
      render: function() {
        var canvas = this.getCanvas();
        var ctx = canvas.getContext('2d');
        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // get center from the map (projected)
        var point = this._map.latLngToContainerPoint(new L.LatLng(11, 57));
        // render
        this.renderCircle(ctx, point, (1.0 + Math.sin(Date.now()*0.001))*300);
        this.redraw();
      }
    });
    var layer = new BigPointLayer();
    layer.addTo(map);

