/*
 *  Cortado LightBlue Bean: change light colors
 */

"use strict";

var m;
try {
    m = require('homestar-ble');
} catch (x) {
    m = require('../index');
}
var _ = m.iotdb._;

var wrapper = m.wrap("BeanLight");
wrapper.on('thing', function (model) {
    model.on("state", function (model) {
        console.log("+ state\n ", model.thing_id(), model.state("istate"));
    });
    model.on("meta", function (model) {
        console.log("+ meta\n ", model.thing_id(), model.state("meta"));
    });

    console.log("+ meta\n ", model.thing_id(), model.state("discovered"));

    var count = 0;
    var colors = ["#FF0000", "#00FF00", "#0000FF", "#00FFFF", "#FF00FF", "#FFFF00", "#FFFFFF", ];
    var timer = setInterval(function () {
        if (!model.reachable()) {
            console.log("+ forgetting unreachable model");
            clearInterval(timer);
            return;
        }

        model.set(":color", colors[count++ % colors.length]);
    }, 2500);
});
wrapper.on('ignored', function (bridge) {
    console.log("+ ignored\n ", _.ld.compact(bridge.meta()));
});
