/*
 *  Refernce only: prefer model_keyfob.js
 *  Connect to TI Key Fob
 */

"use strict";

const iotdb = require('iotdb');
const _ = iotdb._;

const BLEBridge = require('../BLEBridge').Bridge;
const TIKeyFob = require('../models/TIKeyFob');

const bridge_exemplar = new BLEBridge();
bridge_exemplar.discovered = function (bridge) {
    var meta = bridge.meta();
    // console.log("+ got one\n ", meta);

    if (!_.d.is.superset(meta, TIKeyFob.binding.matchd)) {
        console.log("#", "ignore", meta, TIKeyFob.binding.matchd);
        return;
    }

    console.log("+ use this", meta);

    bridge.pulled = function (state) {
        console.log("+ state-change\n ", state);
    };
    bridge.connect(TIKeyFob.binding.connectd);
};
bridge_exemplar.discover();
