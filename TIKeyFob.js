/*
 *  TIKeyFob.js
 *
 *  David Janes
 *  IOTDB
 *  2014-02-06
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('TIKeyFob')
    .i("on", iotdb.boolean.on)
    .i("left", iotdb.boolean.on)
    .i("right", iotdb.boolean.on)
    .make();

exports.binding = {
    name: "TIKeyFob",
    model: exports.Model,
    matchd: {
        'iot-ble:advertisement-name': 'Keyfobdemo',
        'iot-ble:service-uuid': 'ffe0',
    },
    connectd: {
        data_in: function(paramd) {
            if (paramd.ind["ffe1"]) {
                var v = paramd.ind["ffe1"];
                paramd.outd.on = (v & 0x03) ? true : false
                paramd.outd.left = (v & 0x01) ? true : false
                paramd.outd.right = (v & 0x02) ? true : false
            }
        },
    },
};
