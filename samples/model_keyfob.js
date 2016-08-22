/*
 *  TI KeyFob: read buttons
 */

"use strict";

const iotdb = require("iotdb")
const _ = iotdb._;

const homestar_ble = require('homestar-ble');

const wrapper = _.bridge.wrap("TIKeyFob", homestar_ble.bindings);
wrapper.on('thing', function (model) {
    model.on("istate", function (model) {
        console.log("+ istate\n ", model.thing_id(), model.state());
    });
    model.on("meta", function (model) {
        console.log("+ meta\n ", model.thing_id(), model.state("meta"));
    });

    console.log("+ discovered\n ", model.thing_id(), model.state("meta"));
});
wrapper.on('ignored', function (bridge) {
    console.log("+ ignored\n",  bridge.meta());
});
