/*
 *  BLEBridge.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-02-06
 *
 *  NOTE: Errors in using multiple devices & in reconnecting
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
var _ = iotdb._;

var ble = require('./ble').BLE;

var logger = iotdb.bunyan.createLogger({
    name: 'homestar-ble',
    module: 'BLEBridge',
});

/**
 *  See {iotdb.bridge.Bridge#Bridge} for documentation.
 *  <p>
 *  @param {object|undefined} native
 *  only used for instances, should be 
 */
var BLEBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.keystore().get("bridges/BLEBridge/initd"), {
            devices: 1,
            number: 0,
            poll: 0
        }
    );
    self.native = native;

    if (self.native) {
        self.stated = {};
        self.scratchd = {};
        self.cd = {};
        self.queue = _.queue("BLEBridge");
    }
};

BLEBridge.prototype = new iotdb.Bridge();

BLEBridge.prototype.name = function () {
    return "BLEBridge";
};

/* --- lifecycle --- */

var __noble;

/**
 *  See {iotdb.bridge.Bridge#discover} for documentation.
 */
BLEBridge.prototype.discover = function () {
    var self = this;

    ble.on_services(function (error, native) {
        for (var number = 0; number < self.initd.devices; number++) {
            self.discovered(new BLEBridge(_.defaults({
                number: number,
            }, self.initd), native));
        }
    });

    logger.info({
        method: "discover"
    }, "start searching for services");

    ble.search();
};

/**
 *  See {iotdb.bridge.Bridge#connect} for documentation.
 */
BLEBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._validate_connect(connectd);

    self.connectd = _.defaults(
        connectd, {
            subscribes: [],
        }, self.connectd
    );

    if (self.connectd.poll !== undefined) {
        self.initd.poll = self.connectd.poll;
    }

    self._setup_ble();
    self._setup_characteristics();
    self._setup_polling();
};

BLEBridge.prototype._setup_ble = function () {
    var self = this;

    var _on_disconnect = function (native) {
        if (native !== self.native) {
            return;
        }

        ble.removeListener("disconnect", _on_disconnect);

        self._forget();
    };

    ble.on("disconnect", _on_disconnect);
};

BLEBridge.prototype._setup_characteristics = function () {
    var self = this;

    var _on_charateristic = function (c) {
        self.cd[c.uuid] = c;

        var _on_data = function (data) {
            var value = Array.prototype.slice.call(data, 0);

            var rawd = {};
            rawd[c.uuid] = value;

            var paramd = {
                number: self.initd.number,
                rawd: rawd,
                cookd: self.stated,
                scratchd: self.scratchd,
            };
            self.connectd.data_in(paramd);
            self.pulled(self.stated);
        };

        if (c.properties.indexOf('notify') !== -1) {
            c.on('read', _on_data);
            c.notify(true, function (error) {
                if (error) {}
            });
        } else if (c.properties.indexOf('notify') !== -1) {
            c.on('read', _on_data);
        }
    };

    if (self.native.characteristics) {
        var cs = self.native.characteristics;
        for (var ci in cs) {
            _on_charateristic(cs[ci]);
        }
    }
};

BLEBridge.prototype._setup_polling = function () {
    var self = this;

    if (self.initd.poll <= 0) {
        return;
    }

    var timer = setInterval(function () {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

BLEBridge.prototype._forget = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
};

/**
 *  See {iotdb.bridge.Bridge#disconnect} for documentation.
 */
BLEBridge.prototype.disconnect = function () {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  See {iotdb.bridge.Bridge#push} for documentation.
 */
BLEBridge.prototype.push = function (pushd, done) {
    var self = this;
    if (!self.native) {
        done(new Error("not connected"));
        return;
    }

    self._validate_push(pushd);

    if (!self.connectd.data_out) {
        done(new Error("'data_out' not implemented"));
        return;
    }

    // convert from model's representation to BLE's
    var paramd = {
        number: self.initd.number,
        rawd: {},
        cookd: pushd,
        scratchd: self.scratchd,
    };
    self.connectd.data_out(paramd);
    self._send(paramd, done);
};

BLEBridge.prototype._send = function (paramd, done) {
    var self = this;
    var qitem = {
        run: function () {
            logger.info({
                method: "push/qitem(run)",
                unique_id: self.unique_id,
                pushd: paramd.cookd,
                raw_keys: _.keys(paramd.rawd),
                // rawd: paramd.rawd,
            }, "called");

            for (var uuid in paramd.rawd) {
                var c = self.cd[uuid];
                if (!c) {
                    logger.error({
                        method: "push",
                        uuid: uuid
                    }, "uuid not found");
                    continue;
                }

                var value = paramd.rawd[uuid];
                if (value) {
                    if (Buffer.isBuffer(value)) {
                        c.write(value);
                    } else {
                        c.write(new Buffer(value));
                    }
                }
            }

            self.queue.finished(qitem);
            done(null);
        }
    };
    self.queue.add(qitem);
};

/**
 *  See {iotdb.bridge.Bridge#pull} for documentation.
 */
BLEBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    if (!self.connectd.data_poll) {
        return;
    }

    var paramd = {
        rawd: {},
        cookd: {},
        scratchd: self.scratchd,
    };
    self.connectd.data_poll(paramd);
    self._send(paramd);
};

/* --- state --- */

/**
 *  See {iotdb.bridge.Bridge#meta} for documentation.
 */
BLEBridge.prototype.meta = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing-id": _.id.thing_urn.unique("BLE", self.native.p_uuid, self.native.uuid, self.initd.number),
        "iot:device-id": _.id.thing_urn.unique("BLE", self.native.p_uuid),
        "iot:number": self.initd.number,
        "iot:vendor.advertisement-name": self.native.p_advertisement.localName,
        "iot:vendor.peripheral-uuid": self.native.p_uuid,
        "iot:vendor.service-uuid": self.native.uuid,
    };

};

/**
 *  See {iotdb.bridge.Bridge#reachable} for documentation.
 */
BLEBridge.prototype.reachable = function () {
    return this.native !== null;
};

/**
 *  See {iotdb.bridge.Bridge#configure} for documentation.
 */
BLEBridge.prototype.configure = function (app) {};

/*
 *  API
 */
exports.Bridge = BLEBridge;
