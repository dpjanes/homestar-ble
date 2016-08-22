/*
 *  Cortado LightBlue Bean: temperature
 */

"use strict";

const iotdb = require("iotdb")
const _ = iotdb._;

const homestar_ble = require('homestar-ble');

const wrapper = _.bridge.wrap("BeanTemperature", homestar_ble.bindings);
wrapper.on('thing', function (model) {
    model.on("state", function (model) {
        console.log("+ state\n ", model.thing_id(), model.state());
    });
    model.on("meta", function (model) {
        console.log("+ meta\n ", model.thing_id(), model.state("meta"));
    });

    console.log("+ discovered\n ", model.thing_id(), model.state("meta"));
});
wrapper.on('ignored', function (bridge) {
    console.log("+ ignored\n ", _.ld.compact(bridge.meta()));
});
