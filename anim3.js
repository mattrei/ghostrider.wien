var buildD3Animation = function (route) {

    var d3Layer;

    if (!map.d3Layer) {
        map._panes.svgPane = map._createPane('leaflet-overlay-pane', map.getPanes().labelPane);

        d3Layer = new L.SvgLayer({
            pointerEvents: 'none',
            pane: map._panes.svgPane
        }).addTo(map);

        map.d3Layer = d3Layer;
    } else
        d3Layer = map.d3Layer;


    var svg = d3.select(d3Layer.getPathRoot());
    _buildD3Animation(route, d3Layer, svg);

};

function _buildD3Animation(route, layer, svg) {
    if (!route)
        return;

    var replaySpeed = 1;

    // when the user zooms in or out you need to reset the view
    layer.resetSvg = reset;

    var sumTime = route.summary.totalTime;
    var sumDist = route.summary.totalDistance;

    var index = 0;

    g = svg.append("g");

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


    var featuresdata = collection.features.filter(function (d) {
        return true; // d.properties.id == "route1";
    });

    var transform = d3.geo.transform({
        point: projectPoint
    });


    var d3path = d3.geo.path().projection(transform);

    var toLine = d3.svg.line()
        .interpolate("linear")
        .x(function (d) {
            return applyLatLngToLayer(d).x;
        })
        .y(function (d) {
            return applyLatLngToLayer(d).y;
        });




    var linePath = g.selectAll(".lineConnect")
        .data([featuresdata])
        .enter()
        .append("path")
        .attr("class", "lineConnect")
        .style({
            'stroke': 'Blue',
            'fill': 'none',
            'stroke-width': '6px'
        })
        .style("opacity", ".6");

    // This will be our traveling circle
    var marker = g.append("circle")
        .attr("r", 10)
        .attr("id", "marker")
        .attr("class", "travelMarker");


    var ptFeatures = g.selectAll("circle")
        .data(featuresdata)
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("class", "waypoints");

    // this puts stuff on the map!
    reset();
    transition();

    // Reposition the SVG to cover the features.
    function reset() {
            var bounds = d3path.bounds(collection),
                topLeft = bounds[0],
                bottomRight = bounds[1];


            ptFeatures.attr("transform",
                function (d) {
                    return "translate(" +
                        applyLatLngToLayer(d).x + "," +
                        applyLatLngToLayer(d).y + ")";
                });

            marker.attr("transform",
                function () {
                    var y = featuresdata[0].geometry.coordinates[1];
                    var x = featuresdata[0].geometry.coordinates[0];
                    return "translate(" +
                        map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
                        map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
                });


            // linePath.attr("d", d3path);
            linePath.attr("d", toLine);

        } // end reset

    function transition() {
            linePath.transition()
                .duration(7500)
                .ease("linear")
                .attrTween("stroke-dasharray", tweenDash)
                .each("end", function () {
                    d3.select(this).call(transition); // infinite loop
                });

        } //end transition


    function tweenDash() {
            return function (t) {

                var l = linePath.node().getTotalLength();
                interpolate = d3.interpolateString("0," + l, l + "," + l);
                //t is fraction of time 0-1 since transition began
                var marker = d3.select("#marker");
                var p = linePath.node().getPointAtLength(t * l);

                //Move the marker to that point
                marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
                //console.log(t + " " + l + " " + interpolate(t))
                return interpolate(t);
            };
        } //end tweenDash


    function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        } //end projectPoint
};


function applyLatLngToLayer(d) {
    var y = d.geometry.coordinates[1];
    var x = d.geometry.coordinates[0];
    return map.latLngToLayerPoint(new L.LatLng(y, x));
}
