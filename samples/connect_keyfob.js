/*
 *  Refernce only: prefer model_keyfob.js
 *  Connect to TI Key Fob
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb.helpers;

var BLEBridge = require('../BLEBridge').Bridge;
var TIKeyFob = require('../models/TIKeyFob');

var bridge_exemplar = new BLEBridge();
bridge_exemplar.discovered = function (bridge) {
    var meta = _.ld.compact(bridge.meta());
    if (!_.d.is.superset(meta, TIKeyFob.binding.matchd)) {
        return;
    }

    console.log("+ got one\n ", meta);

    bridge.pulled = function (state) {
        console.log("+ state-change\n ", state);
    };
    bridge.connect(TIKeyFob.binding.connectd);
};
bridge_exemplar.discover();
