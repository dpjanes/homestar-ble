/*
 *  BeanXYZ.js
 *
 *  David Janes
 *  IOTDB
 *  2014-10-08
 *
 *  LightBlue Bean XYZ
 */

'use strict'
var iotdb = require('iotdb')
var util = require('util')

exports.Model = iotdb.make_model('BeanXYZ')
    .facet(":sensor.spatial")
    .i("x", iotdb.vector.number.xyz.x)
    .i("y", iotdb.vector.number.xyz.y)
    .i("z", iotdb.vector.number.xyz.z)
    .make();

exports.binding = {
    name: "BeanXYZ",
    model: exports.Model,
    matchd: {
        'iot:vendor/service-uuid': 'a495ff10c5b14b44b5121370f02d74de',
    },
    connectd: {
        poll: 1,
        subcribes: [ 'a495ff11c5b14b44b5121370f02d74de' ],
        data_poll: function(paramd) {
            if (paramd.scratchd.count === undefined) {
                paramd.scratchd.count = 0
            }
            paramd.rawd['a495ff11c5b14b44b5121370f02d74de'] = [
                0x80 + ((0x20 * paramd.scratchd.count++) & 0x7F),
                    0x02, // Length
                    0x00, // Reserved
                        0x20, 0x10, // MSG_ID_CC_ACCEL_READ
                    0x00, 0x00  // CRC
            ];
        },
        data_in: function(paramd) {
            var value = paramd.rawd['a495ff11c5b14b44b5121370f02d74de']
            if (value !== undefined) {
                if (value.length < 12) {
                    console.log("# BeanTemperature.driver_in", "expected value.length>=12", value.length, value)
                } else if ((value[1] != 8) && (value != 9)) {
                    console.log("# BeanTemperature.driver_in", "expected value[1]==8 or 9", value)
                } else if (value[3] != 0x20) {
                    console.log("# BeanTemperature.driver_in", "expected value[3]==0x20", value)
                } else if (value[4] != 0x90) {
                    console.log("# BeanTemperature.driver_in", "expected value[4]==0x90", value)
                } else {
                    paramd.cookd.x = (((value[5+1] << 8) | value[5+0]) << 16) >> 16
                    paramd.cookd.y = (((value[7+1] << 8) | value[7+0]) << 16) >> 16
                    paramd.cookd.z = (((value[9+1] << 8) | value[9+0]) << 16) >> 16
                }
            }
        },
    },
};
