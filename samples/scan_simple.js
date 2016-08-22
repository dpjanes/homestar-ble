/*
 *  scan_simple.js
 *
 *  David Janes
 *  IOTDB
 *  2016-03-24
 *
 *  Scan for BLE devices but do not connect to them
 */

"use strict";

let idleTimer = null;

const noble = require('noble');
const BLE = require('../ble').BLE;
const ble = new BLE({
    connect: false,
});
ble.on("discovered", p => {
    dump();

    if (idleTimer) {
        clearTimeout(idleTimer);
    }

    idleTimer = setInterval(() => {
        dump();
    }, 5000);

});
ble.search();

const dump = function() {
    ble.peripherals(function(p) {
        if (!p) {
            console.log("");
            return;
        }

        var now = (new Date).getTime();
        p.iotdb_age = now - p.iotdb_seen;
        console.log(p.uuid, p.rssi, Math.round(p.iotdb_age / 1000), p.advertisement.localName);
    });
}
