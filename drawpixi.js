var points = [
        L.latLng(57.7088, 11.90),
        L.latLng(57.6792, 11.949),
        L.latLng(57.69754, 11.98144),
        L.latLng(57.742556, 12.0240211),
        L.latLng(57.771405, 11.9948387),
      ];



var pixi_layer;
var map
var stage;
var bunny;

var renderer;
function init() {
    
    map = L.map('map', { zoomControl: false, maxZoom: 16, minZoom: 10 });
    map.setView([57.679, 11.94], 10);
    L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', 
                {
      maxZoom: 16,
        minZoom: 10,
        noWrap: true,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery <a href="http://stamen.com">Stamen</a>'
    }
               )
    .addTo(map);
    
    
    
    var PIXILayer = L.CanvasLayer.extend({
      render: function() {
      }
    });
    pixi_layer = new PIXILayer();
    pixi_layer.addTo(map);
    
    
    var width = document.getElementById("pixi-canvas").width;
    var height = document.getElementById("pixi-canvas").height;
    
    renderer = PIXI.autoDetectRenderer(width,height,{transparent: true, view:document.getElementById("pixi-canvas")});
    


    //map.setView([40.70531887544228, -74.00976419448853], 15);
    map.setView([57.679, 11.94], 10);

    var wps = [
        L.latLng(57.74, 11.94),
        L.latLng(57.6792, 11.949)
      ];

    var rr = L.Routing.control({
        waypoints: wps,
        geocoder: null,
        transitemode: 'bicycle',
    }).addTo(map);
    

map.on('click', function(e) {
    console.log("clicked");
    console.log(e.latlng);
    console.log(map.latLngToLayerPoint(new L.LatLng(e.latlng.lat, e.latlng.lng)));
    console.log(map.latLngToContainerPoint(e.latlng));
});


    




stage = new PIXI.Container();
//stage.position.x = 200;
var texture = PIXI.Texture.fromImage('img/creature.png');


bunny = new PIXI.Sprite(texture);

// center the sprite's anchor point
bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;

bunny.position.x = 57.74;
bunny.position.y = 11.91;

stage.addChild(bunny);

var tween = new TimelineMax({onUpdate:animate, onUpdateScope:bunny});

bunny.lat = 57.63;
bunny.lng = 11.8;
    
var ntween = new TimelineMax();
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
            return {lat: x, lng: y};
        });
        console.log(values);
        
        bunny.lat = values[0].lat;
        bunny.lng = values[0].lng;

        var bezTween = new TweenMax(bunny, /*route.summary.totalTime/4*/5, {
            bezier:{
              type:"soft", 
              values: values, 
              autoRotate:["lat","lng","rotation",0,true]
            }, 
            ease:Linear.easeNone, autoCSS:false});
        
        //tween.add(bezTween);

    });

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
