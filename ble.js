/*
 *  ble.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-02-06
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


"use strict";

var iotdb = require('iotdb');
var _ = iotdb.helpers;

var events = require('events');
var util = require('util');

var noble = require('noble');

var logger = iotdb.bunyan.createLogger({
    name: 'homestar-ble',
    module: 'BLE',
});

/**
 */
var BLE = function () {
    var self = this;

    self.pd = {};
    self.sd = {};

    events.EventEmitter.call(this);
};

util.inherits(BLE, events.EventEmitter);

/**
 */
BLE.prototype.search = function () {
    var self = this;

    if (self.running) {
        return;
    }
    self.running = true;

    noble.on('discover', function (p) {
        self._discover_p(p);
    });

    logger.info({
        method: "search"
    }, "start scanning");

    noble.startScanning([], true);
};


/**
 *  Register for all services. All current services will
 *  be immediately sent to the callback.
 *  Note that this doesn't call search.
 */
BLE.prototype.on_services = function (callback) {
    var self = this;

    for (var k in self.sd) {
        callback(null, self.sd[k]);
    }

    self.on("service", function (s) {
        callback(null, s);
    });
};

BLE.prototype._discover_p = function (p) {
    var self = this;

    if (self.pd[p.uuid]) {
        return;
    }
    self.pd[p.uuid] = p;

    logger.info({
        method: "_discover_p",
        "p-uuid": p.uuid,
        "localName": p.advertisement.localName,
        "advertisement": p.advertisement.manufacturerData ? p.advertisement.manufacturerData.toString('hex') : null,
    }, "p.discover");

    var _on_connect = function () {
        logger.info({
            method: "_discover_p/_on_connect",
            "p-uuid": p.uuid,
        }, "p.connect");

        p.discoverServices();
    };

    var _on_disconnect = function () {
        logger.info({
            method: "_discover_p/_on_disconnect",
            "p-uuid": p.uuid,
        }, "p.disconnect");

        if (_.is.Array(p.services)) {
            p.services.map(function (s) {
                delete self.sd[s.ble_uuid];

                self.emit("disconnect", s);
            });
        }

        delete self.pd[p.uuid];

        p.removeListener('connect', _on_connect);
        p.removeListener('disconnect', _on_disconnect);
        p.removeListener('servicesDiscover', _on_services);
    };

    var _on_services = function (ss) {
        logger.info({
            method: "_discover_p/_on_services",
            "p-uuid": p.uuid,
            "#ss": ss.length
        }, "p.serviceDiscover");

        ss.map(function (s) {
            s.p_uuid = p.uuid;
            s.p_advertisement = p.advertisement;
            s.ble_uuid = "" + p.uuid + "/" + s.uuid;

            if (self.sd[s.ble_uuid]) {
                return;
            }

            self.sd[s.ble_uuid] = s;

            logger.info({
                method: "discover/on(servicesDiscover)",
                "p-uuid": p.uuid,
                "s-uuid": s.uuid,
            }, "p.serviceDiscover");


            s.discoverCharacteristics(null, function (error, cs) {
                if (error) {
                    logger.info({
                        method: "discover/on(servicesDiscover)/on(s.discoverCharacteristics)",
                        "p-uuid": p.uuid,
                        "s-uuid": s.uuid,
                        "error": error,
                    }, "s.discoverCharacteristics");
                    return;
                }

                for (var ci in cs) {
                    var c = cs[ci];
                    logger.info({
                        method: "discover/on(servicesDiscover)/on(s.discoverCharacteristics)",
                        "p-uuid": p.uuid,
                        "s-uuid": s.uuid,
                        "c-uuid": c.uuid,
                    }, "discoverCharacteristics");

                    self.emit("characteristic", s, c);
                }

                self.emit("service", s);
            });
        });
    };

    p.on('connect', _on_connect);
    p.on('disconnect', _on_disconnect);
    p.on('servicesDiscover', _on_services);

    p.connect();
};

exports.BLE = new BLE();
