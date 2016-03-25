/*
 *  BLEPresence.js
 *
 *  David Janes
 *  IOTDB
 *  2014-03-02
 */

"use strict";

exports.binding = {
    model: require('./ble-presence.json'),
    bridge: require('../BLEBridge').Bridge,
    initd: {
        presence: true,
    },
    matchd: {
        "iot:vendor.service-uuid": "presence",
    },
    discover: false,
    connectd: {},
};

