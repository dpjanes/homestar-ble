/*
 *  Refernce only: prefer iotdb_presence.js
 *  Connect to iBeacon
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb.helpers;

var BLEBridge = require('../BLEBridge').Bridge;
var BLEPresence = require('../models/BLEPresence');

var bridge_exemplar = new BLEBridge({
    presence: true,
});
bridge_exemplar.discovered = function (bridge) {
    var meta = bridge.meta();
    console.log("+ got one\n ", meta);

    meta = _.ld.compact(meta);
    if (!_.d.is.superset(meta, BLEPresence.binding.matchd)) {
        return;
    }

    console.log("+ use this");

    bridge.pulled = function (state) {
        console.log("+ state-change\n ", meta['iot:thing-id'], meta['schema:name'], "\n ", state);
    };
    bridge.connect(BLEPresence.binding.connectd);
};
bridge_exemplar.discover();
