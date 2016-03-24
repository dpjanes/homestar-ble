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
    initd: {},
    discover: false,
    connectd: {},
};
