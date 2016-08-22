/*
 *  Cortado LightBlue Bean: XYZ orientation
 */

"use strict";

try {
    var m = require('homestar-ble');
} catch (x) {
    m = require('../index');
}
const _ = m.iotdb._;

const wrapper = m.wrap("BeanXYZ");
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
