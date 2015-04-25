/*
 *  Note: to work, this package must have been installed by 'homestar install' 
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb._;
var iot = iotdb.iot();

var things = iot.connect("BeanXYZ");
things.on("state", function (thing) {
    console.log("+ state\n ", thing.thing_id(), thing.state("istate"));
});
things.on("meta", function (thing) {
    console.log("+ meta\n ", thing.thing_id(), thing.state("meta"));
});
things.on("thing", function (thing) {
    console.log("+ discovered\n ", thing.thing_id(), thing.state("meta"));
});
