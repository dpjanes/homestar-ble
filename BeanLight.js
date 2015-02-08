/*
 *  BeanLight.js
 *
 *  David Janes
 *  IOTDB
 *  2014-10-08
 *
 *  LightBlue Bean RGB light control
 */

'use strict'

var iotdb = require('iotdb')

exports.Model = iotdb.make_model('BeanLight')
    .o("color", iotdb.string.color)
    .make();

exports.binding = {
    model: exports.Model,
    bridge: require('./BLEBridge').Bridge,
    matchd: {
        'iot:vendor/service-uuid': 'a495ff10c5b14b44b5121370f02d74de',
    },
    connectd: {
        data_out: function(paramd) {
            if (paramd.cookd.color) {
                if (paramd.scratchd.count === undefined) {
                    paramd.scratchd.count = 0
                }

                var color = new iotdb.libs.Color(paramd.cookd.color);
                paramd.rawd['a495ff11c5b14b44b5121370f02d74de'] = [
                    0x80 + ((0x20 * paramd.scratchd.count++) & 0x7F),
                        0x05, // Length
                        0x00, // Reserved
                            0x20, 0x01, // MSG_ID_CC_LED_WRITE_ALL
                                color.r * 0xFF, // Inner Payload
                                color.g * 0xFF, 
                                color.b * 0xFF,
                    0x00, 0x00  // CRC
                    // 0x0A,
                    // 0x39
                ];
            }
        },
    },
};
