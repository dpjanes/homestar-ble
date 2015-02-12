/*
 *  TIKeyFob.js
 *
 *  David Janes
 *  IOTDB
 *  2014-02-06
 */

"use strict";

var homestar = require("homestar")

exports.Model = homestar.make_model('TIKeyFob')
    .i("on", homestar.boolean.on)
    .i("left", homestar.boolean.on)
    .i("right", homestar.boolean.on)
    .make();

exports.binding = {
    model: exports.Model,
    bridge: require('./BLEBridge').Bridge,
    matchd: {
        'iot:vendor/advertisement-name': 'Keyfobdemo',
        'iot:vendor/service-uuid': 'ffe0',
    },
    connectd: {
        subscribes: [ "ffe1", ],
        data_in: function(paramd) {
            if (paramd.rawd["ffe1"]) {
                var v = paramd.rawd["ffe1"];
                paramd.cookd.on = (v & 0x03) ? true : false
                paramd.cookd.left = (v & 0x01) ? true : false
                paramd.cookd.right = (v & 0x02) ? true : false
            }
        },
    },
};
