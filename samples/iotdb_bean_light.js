/*
 *  Note: to work, this package must have been installed by 'homestar install' 
 */

var iotdb = require('iotdb');
var _ = iotdb._;
var iot = iotdb.iot();

var things = iot.connect("BeanLight");
things.on("state", function(thing) {
    console.log("+ state\n ", thing.thing_id(), thing.state("istate"));
});
things.on("meta", function(thing) {
    console.log("+ meta\n ", thing.thing_id(), thing.state("meta"));
});
things.on("thing", function(thing) {
    console.log("+ discovered\n ", thing.thing_id(), thing.state("meta"));
});

var count = 0;
var colors = [ "#FF0000", "#00FF00", "#0000FF", "#00FFFF", "#FF00FF", "#FFFF00", "#FFFFFF", ];
var timer = setInterval(function() {
    things.set(":color", colors[count++ % colors.length]);
}, 2500);
