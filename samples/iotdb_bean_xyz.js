/*
 *  Note: to work, this package must have been installed by 'homestar install' 
 */

"use strict";

const iotdb = require('iotdb');
const _ = iotdb._;

iotdb.use("homestar-ble");

const things = iotdb.connect("BeanXYZ");
things.on("istate", function (thing) {
    console.log("+", "istate\n ", thing.thing_id(), thing.state("istate"));
});
things.on("meta", function (thing) {
    console.log("+ meta\n ", thing.thing_id(), thing.state("meta"));
});
things.on("thing", function (thing) {
    console.log("+ discovered\n ", thing.thing_id(), thing.state("meta"));
});
