/*
 *  BLEBridge.js
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

var homestar = require('homestar')
var _ = homestar._;

var ble = require('./ble').BLE;

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'homestar-ble',
    module: 'BLEBridge',
});

/**
 *  EXEMPLAR and INSTANCE
 *  <p>
 *  No subclassing needed! The following functions are 
 *  injected _after_ this is created, and before .discover and .connect
 *  <ul>
 *  <li><code>discovered</code> - tell IOTDB that we're talking to a new Thing
 *  <li><code>pulled</code> - got new data
 *  <li><code>connected</code> - this is connected to a Thing
 *  <li><code>disconnnected</code> - this has been disconnected from a Thing
 *  </ul>
 */
var BLEBridge = function(initd, native) {
    var self = this;

    self.initd = _.defaults(initd, {
        poll: 0
    });
    self.native = native;

    if (self.native) {
        self.stated = {};
        self.scratchd = {};
        self.connectd = {};
        self.cd = {};
        self.queue = _.queue("BLEBridge");
    }
};

/* --- lifecycle --- */

var __noble;

/**
 *  EXEMPLAR. 
 *  Discover Hue
 *  <ul>
 *  <li>look for Things (using <code>self.bridge</code> data to initialize)
 *  <li>find / create a <code>native</code> that does the talking
 *  <li>create an BLEBridge(native)
 *  <li>call <code>self.discovered(bridge)</code> with it
 */
BLEBridge.prototype.discover = function() {
    var self = this;

    ble.on_services(function(error, native) {
        self.discovered(new BLEBridge(self.initd, native));
    });

    logger.info({
        method: "discover"
    }, "start searching for services");

    ble.search();
};

/**
 *  INSTANCE
 *  This is called when the Bridge is no longer needed. When
 */
BLEBridge.prototype.connect = function(connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self.connectd = _.defaults(connectd, {
        subscribes: [],
        data_in: function(paramd) {
        },
    });

    if (self.connectd.poll !== undefined) {
        self.initd.poll = self.connectd.poll;
    }

    self._setup_ble();
    self._setup_characteristics();
    self._setup_polling();
};

BLEBridge.prototype._setup_ble = function() {
    var self = this;

    var _on_disconnect = function(native) {
        if (native !== self.native) {
            return;
        }

        ble.removeListener("disconnect", _on_disconnect);

        self._forget();
    }

    ble.on("disconnect", _on_disconnect);
};

BLEBridge.prototype._setup_characteristics = function() {
    var self = this;

    var _on_charateristic = function(c) {
        self.cd[c.uuid] = c;

        var _on_data = function(data) {
            var value = Array.prototype.slice.call(data, 0);

            var rawd = {}
            rawd[c.uuid] = value;

            var paramd = {
                rawd: rawd,
                cookd: self.stated,
                scratchd: self.scratchd,
            }
            self.connectd.data_in(paramd);
            self.pulled(self.stated);
        };

        if (c.properties.indexOf('notify') !== -1) {
            c.on('read', _on_data);
            c.notify(true, function(error) {
                if (error) {
                }
            });
        } else if (c.properties.indexOf('notify') !== -1) {
            c.on('read', _on_data);
        }
    };

    self.native.discoverCharacteristics(null, function(error, cs) {
        if (error) {
            console.log(error);
            return;
        }

        for (var ci in cs) {
            _on_charateristic(cs[ci]);
        }
    });
};

BLEBridge.prototype._setup_polling = function() {
    var self = this;

    if (!(self.initd.poll > 0)) {
        return;
    }

    var timer = setInterval(function() {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

BLEBridge.prototype._forget = function() {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
}

/**
 *  INSTANCE and EXEMPLAR (during shutdown). 
 *  This is called when the Bridge is no longer needed. 
 */
BLEBridge.prototype.disconnect = function() {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  INSTANCE.
 *  Send data to whatever you're taking to.
 */
BLEBridge.prototype.push = function(pushd) {
    var self = this;
    if (!self.native) {
        return;
    }

    if (!self.connectd.data_out) {
        return;
    }

    // convert from model's representation to BLE's
    var paramd = {
        rawd: {},
        cookd: pushd,
        scratchd: self.scratchd,
    }
    self.connectd.data_out(paramd);
    self._send(paramd);
}

BLEBridge.prototype._send = function(paramd) {
    var self = this;
    var qitem = {
        run: function () {
            logger.info({
                method: "push/qitem(run)",
                unique_id: self.unique_id,
                pushd: paramd.cookd,
                raw_keys: _.keys(paramd.rawd),
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
        }
    };
    self.queue.add(qitem);
};

/**
 *  INSTANCE.
 *  Pull data from whatever we're talking to. You don't
 *  have to implement this if it doesn't make sense
 */
BLEBridge.prototype.pull = function() {
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
    }
    self.connectd.data_poll(paramd);
    self._send(paramd);
};

/* --- state --- */

/**
 *  INSTANCE.
 *  Return the metadata - compact form can be used.
 *  Does not have to work when not reachable
 *  <p>
 *  Really really useful things are:
 *  <ul>
 *  <li><code>iot:thing</code> required - a unique ID
 *  <li><code>iot:device</code> suggested if linking multiple things together
 *  <li><code>iot:name</code>
 *  <li><code>iot:number</code>
 *  <li><code>schema:manufacturer</code>
 *  <li><code>schema:model</code>
 */
BLEBridge.prototype.meta = function() {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing": _.id.thing_urn.unique("BLE", self.native.p_uuid) + "/" + self.native.uuid,
        "iot:device": _.id.thing_urn.unique("BLE", self.native.p_uuid),
        "iot:vendor/advertisement-name": self.native.p_advertisement.localName,
        "iot:vendor/peripheral-uuid": self.native.p_uuid,
        "iot:vendor/service-uuid": self.native.uuid,
    };

};

/**
 *  INSTANCE.
 *  Return True if this is reachable. You 
 *  do not need to worry about connect / disconnect /
 *  shutdown states, they will be always checked first.
 */
BLEBridge.prototype.reachable = function() {
    return this.native !== null;
};

/**
 *  INSTANCE.
 *  Return True if this is configured. Things
 *  that are not configured are always not reachable.
 *  If not defined, "true" is returned
 */
BLEBridge.prototype.configured = function() {
    return true;
};

/* --- injected: THIS CODE WILL BE REMOVED AT RUNTIME, DO NOT MODIFY  --- */
BLEBridge.prototype.discovered = function(bridge) {
    throw new Error("BLEBridge.discovered not implemented");
};

BLEBridge.prototype.pulled = function(pulld) {
    throw new Error("BLEBridge.pulled not implemented");
};

/*
 *  API
 */
exports.Bridge = BLEBridge;
