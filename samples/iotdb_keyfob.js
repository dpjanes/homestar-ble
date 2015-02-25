/*
 */

var iotdb = require('iotdb');
var _ = iotdb._;
var iot = iotdb.iot();

var things = iot.connect("TIKeyFob");
things.on("state", function(thing) {
    console.log("+ state\n ", thing.thing_id(), thing.state());
});
things.on("meta", function(thing) {
    console.log("+ meta\n ", thing.thing_id(), _.ld.compact(thing.meta().state()));
});
things.on("thing", function(thing) {
    console.log("+ discovered\n ", _.ld.compact(thing.meta().state()), "\n ", thing.thing_id());
});
