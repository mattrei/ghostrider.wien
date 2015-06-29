var buildD3Animation = function (route) {

    var d3Layer;

    if (!map.d3Layer) {
        // create a separate pane for the xmap labels, so they are displayed on top of the route line
        // http://bl.ocks.org/rsudekum/5431771
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
            .x(function(d) {
                return applyLatLngToLayer(d).x
            })
            .y(function(d) {
                return applyLatLngToLayer(d).y
            });



        var ptFeatures = g.selectAll("circle")
            .data(featuresdata)
            .enter()
            .append("circle")
            .attr("r", 3)
            .attr("class", "waypoints");


        var linePath = g.selectAll(".lineConnect")
            .data([featuresdata])
            .enter()
            .append("path")
            .attr("class", "lineConnect");


        var marker = g.append("circle")
            .attr("r", 10)
            .attr("id", "marker")
            .attr("class", "travelMarker");


        var originANDdestination = [featuresdata[0], featuresdata[featuresdata.length - 1]]

        var begend = g.selectAll(".drinks")
            .data(originANDdestination)
            .enter()
            .append("circle", ".drinks")
            .attr("r", 5)
            .style("fill", "red")
            .style("opacity", "1");

        // I want names for my coffee and beer
        var text = g.selectAll("text")
            .data(originANDdestination)
            .enter()
            .append("text")
            .text(function(d) {
                return d.properties.name
            })
            .attr("class", "locnames")
            .attr("y", function(d) {
                return -10
            })


        // when the user zooms in or out you need to reset
        // the view
        map.on("viewreset", reset);

        // this puts stuff on the map!
        reset();
        transition();

        // Reposition the SVG to cover the features.
        function reset() {
            var bounds = d3path.bounds(collection),
                topLeft = bounds[0],
                bottomRight = bounds[1];


            text.attr("transform",
                function(d) {
                    return "translate(" +
                        applyLatLngToLayer(d).x + "," +
                        applyLatLngToLayer(d).y + ")";
                });


            // for the points we need to convert from latlong
            // to map units
            begend.attr("transform",
                function(d) {
                    return "translate(" +
                        applyLatLngToLayer(d).x + "," +
                        applyLatLngToLayer(d).y + ")";
                });

            ptFeatures.attr("transform",
                function(d) {
                    return "translate(" +
                        applyLatLngToLayer(d).x + "," +
                        applyLatLngToLayer(d).y + ")";
                });

            // again, not best practice, but I'm harding coding
            // the starting point

            marker.attr("transform",
                function() {
                    var y = featuresdata[0].geometry.coordinates[0]
                    var x = featuresdata[0].geometry.coordinates[1]
                    return "translate(" +
                        map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
                        map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
                });


            // Setting the size and location of the overall SVG container
            svg.attr("width", bottomRight[0] - topLeft[0] + 120)
                .attr("height", bottomRight[1] - topLeft[1] + 120)
                .style("left", topLeft[0] - 50 + "px")
                .style("top", topLeft[1] - 50 + "px");


            // linePath.attr("d", d3path);
            linePath.attr("d", toLine)
            // ptPath.attr("d", d3path);
            g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");

        } // end reset


        function transition() {
            linePath.transition()
                .duration(20000)
                .attrTween("stroke-dasharray", tweenDash)
                .each("end", function() {
                    d3.select(this).call(transition);// infinite loop
                });
        } //end transition


        function tweenDash() {
            return function(t) {
                //total length of path (single value)
                var l = linePath.node().getTotalLength();


                interpolate = d3.interpolateString("0," + l, l + "," + l);
                //t is fraction of time 0-1 since transition began
                var marker = d3.select("#marker");

                var p = linePath.node().getPointAtLength(t * l);

                //Move the marker to that point
                marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
                return interpolate(t);
            }
        } //end tweenDash


        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        } //end projectPoint



    function applyLatLngToLayer(d) {
        var y = d.geometry.coordinates[0]
        var x = d.geometry.coordinates[1]
        return map.latLngToLayerPoint(new L.LatLng(y, x))
    }

}
