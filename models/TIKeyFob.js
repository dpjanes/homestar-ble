/*
 *  TIKeyFob.js
 *
 *  David Janes
 *  IOTDB
 *  2014-02-06
 */

"use strict";

/*
exports.binding = {
    model: require('./ti-key-fob.json'),
    bridge: require('../BLEBridge').Bridge,
    matchd: {
        'iot:vendor.advertisement-name': 'Keyfobdemo',
        'iot:vendor.service-uuid': 'ffe0',
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
*/

exports.binding = {
    model: require('./ti-key-fob.json'),
    bridge: require('../BLEBridge').Bridge,
    matchd: {
        // 'iot:vendor.advertisement-name': 'Keyfobdemo',
        'iot:vendor.advertisement-name': 'TI BLE Keyfob',
        'iot:vendor.service-uuid': 'ffe0',
    },
    initd: {
        devices: 2,
    },
    discover: false,
    connectd: {
        subscribes: ["ffe1", ],
        data_in: function (paramd) {
            if (paramd.rawd["ffe1"]) {
                var v = paramd.rawd["ffe1"];
                if (paramd.number === 0) {
                    paramd.cookd.on = (v & 0x01) ? true : false;
                } else {
                    paramd.cookd.on = (v & 0x02) ? true : false;
                }
                paramd.cookd.left = (v & 0x01) ? true : false;
                paramd.cookd.right = (v & 0x02) ? true : false;
            }
        },
    },
};
