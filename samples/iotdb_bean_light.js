/*
 *  Cortado LightBlue Bean: change light colors
 */

var iotdb = require('iotdb');
var _ = iotdb._;
var iot = iotdb.iot();

var things = iot.connect("BeanLight");
things.on("state", function(thing) {
    console.log("+ state\n ", thing.thing_id(), thing.state());
});
things.on("meta", function(thing) {
    console.log("+ meta\n ", thing.thing_id(), _.ld.compact(thing.meta().state()));
});
things.on("thing", function(thing) {
    console.log("+ discovered\n ", _.ld.compact(thing.meta().state()), "\n ", thing.thing_id());
});

var count = 0;
var colors = [ "#FF0000", "#00FF00", "#0000FF", "#00FFFF", "#FF00FF", "#FFFF00", "#FFFFFF", ];
var timer = setInterval(function() {
    things.set(":color", colors[count++ % colors.length]);
}, 2500);
