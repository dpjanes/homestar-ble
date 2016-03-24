/*
 *  Scan around for BLE devices for fun
 */

"use strict";

var idleTimer = null;

var noble = require('noble');
var BLE = require('../ble').BLE;
var ble = new BLE({
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

var dump = function() {
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
