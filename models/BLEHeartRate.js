/*
 *  BLEHeartRate.js
 *
 *  David Janes
 *  IOTDB
 *  2014-03-02
 */

"use strict";

var iotdb = require("iotdb");

exports.Model = iotdb.make_model('BLEHeartRate')
    .i("connected", iotdb.sensor.boolean.connected)
    .i("rate", iotdb.integer, {
        "iot:unit": "iot-unit:math.frequency.bpm",
        "iot:related": "http://en.wikipedia.org/wiki/Heart_rate",
    })
    .i("expended", iotdb.number, {
        "iot:unit": "iot-unit:energy.si.joule",
    })
    .make();

exports.binding = {
    model: exports.Model,
    bridge: require('../BLEBridge').Bridge,
    matchd: {
        'iot:vendor/service-uuid': '180d',
    },
    initd: {},
    discover: false,
    connectd: {
        subscribes: ["2a37", ],
        data_in: function (paramd) {
            if (paramd.rawd["2a37"]) {
                var next = 1;
                var v = paramd.rawd["2a37"];
                // console.log("V", v)
                if (v[0] & 0x01) {
                    paramd.cookd.rate = v[next++] * v[next++] * 256;
                } else {
                    paramd.cookd.rate = v[next++];
                }

                if (paramd.cookd.rate === 0) {
                    paramd.cookd.rate = null;
                }

                paramd.cookd.connected = (paramd.cookd.rate !== null) ? true : false;

                if ((v[0] & 0x04) && (v.length > (next + 1))) {
                    paramd.cookd.expended = v[next++] * 256 + v[next++];
                }
            }
        },
    },
};
