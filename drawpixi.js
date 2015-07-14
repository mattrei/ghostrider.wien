var points = [
        L.latLng(57.7088, 11.90),
        L.latLng(57.6792, 11.949),
        L.latLng(57.69754, 11.98144),
        L.latLng(57.742556, 12.0240211),
        L.latLng(57.771405, 11.9948387),
      ];

var rr;
var plan = L.Routing.plan();

var pixi_layer;
var map
var stage;
var bunny;



var renderer;

function init() {

    map = L.map('map', {
        zoomControl: false,
        maxZoom: 16,
        minZoom: 10
    });
    map.setView([57.679, 11.94], 10);
    L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
            maxZoom: 16,
            minZoom: 10,
            noWrap: true,
        })
        .addTo(map);

    var PIXILayer = L.CanvasLayer.extend({
        render: function () {}
    });
    pixi_layer = new PIXILayer();
    pixi_layer.addTo(map);


    var width = document.getElementById("pixi-canvas").width;
    var height = document.getElementById("pixi-canvas").height;

    renderer = PIXI.autoDetectRenderer(width, height, {
        transparent: true,
        view: document.getElementById("pixi-canvas")
    });
    
    stage = new PIXI.Container();
    var texture = PIXI.Texture.fromImage('img/creature.png');


    bunny = new PIXI.Sprite(texture);

    // center the sprite's anchor point
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;
    bunny.lat = 0;
    bunny.lng = 0;

    stage.addChild(bunny);

    map.setView([57.679, 11.94], 10);
    map.on('click', function (e) {
        console.log("clicked");
        console.log(e.latlng);
        console.log(map.latLngToLayerPoint(new L.LatLng(e.latlng.lat, e.latlng.lng)));
        console.log(map.latLngToContainerPoint(e.latlng));
    });

    rr = L.Routing.control({
        //waypoints: wps,
        plan: plan,
        geocoder: null,
        transitemode: 'bicycle',
        //geocoder: L.Control.Geocoder.nominatim()
    }).addTo(map);


    play(getRndPoint(points));
}

function play(startPoint) {

    var targetPoint = getRndPointExcept(points, startPoint);

    var wps = [startPoint, targetPoint];
    plan.setWaypoints(wps);
    

  //  var tween = new TimelineMax({
//        onUpdate: animate,
//        onUpdateScope: bunny
//    });
    //var ntween = new TimelineMax();
    //ntween.to(bunny, 3.5, {lat: 57.69, lng: 11.93})
    //.to(bunny.scale, 2, {x: 10, y:10})
    //.to(bunny, 2, {alpha: 0})
    //.to(bunny.position, 3, {x: (window.innerWidth / 2), ease:  Bounce.easeOut})
    //var ntween2 = TweenMax.to(bunny.position, 3, {x: (window.innerWidth / 2), ease:  Bounce.easeOut})
    //tween.add(ntween);

    rr.on('routesfound', function (e) {
        console.log(e);
        var route = e.routes[0];
        data = getData(route);

        var values = data.map(function (d) {
            var x = d.geometry.coordinates[0]
            var y = d.geometry.coordinates[1]
            return {
                lat: x,
                lng: y
            };
        });
        console.log(values);

        bunny.lat = values[0].lat;
        bunny.lng = values[0].lng;

        var bezTween = new TweenMax(bunny, /*route.summary.totalTime/4*/ 2, {
            bezier: {
                type: "soft",
                values: values,
                autoRotate: ["lat", "lng", "rotation", 0, true]
            },
            ease: Linear.easeNone,
            autoCSS: false,
            onUpdate: animate,
            onComplete: routeCompleted,
            onCompleteParams: [targetPoint],
            callbackScope: bunny
        });
        
        //tween.add(bezTween);

    });

}

function routeCompleted(targetPoint) {
        
    console.log(targetPoint);
    var tween = new TimelineMax({
        onComplete: nextRoute, 
        onCompleteParams: [targetPoint]});
    tween.to(this.scale, 1, {x: 2, y:2})
    tween.to(this.scale, 1, {x: 1, y:1})
    
}

function nextRoute(targetPoint) {
    play(targetPoint);   
}

function animate() {
    requestAnimationFrame(animate);

    var p = map.latLngToContainerPoint(new L.LatLng(bunny.lat, bunny.lng));
    bunny.position.x = p.x;
    bunny.position.y = p.y;
    renderer.render(stage);
}

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

function getRndPoint(a) {
    return a[Math.floor(Math.random() * a.length)];
}

function getRndPointExcept(a, p) {
    var r = p;
    while (r === p) {
        r = a[Math.floor(Math.random() * a.length)];
    }
    return r;
}