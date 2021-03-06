/*
 *  BeanTemperature.js
 *
 *  David Janes
 *  IOTDB
 *  2014-10-08
 *
 *  LightBlue Bean RGB light control
 */

'use strict';

exports.binding = {
    model: require('./bean-temperature.json'),
    bridge: require('../BLEBridge').Bridge,
    matchd: {
        'iot:vendor.service-uuid': 'a495ff10c5b14b44b5121370f02d74de',
    },
    discover: false,
    connectd: {
        poll: 30,
        subcribes: ['a495ff11c5b14b44b5121370f02d74de'],
        data_poll: function (paramd) {
            if (paramd.scratchd.count === undefined) {
                paramd.scratchd.count = 0;
            }
            paramd.rawd['a495ff11c5b14b44b5121370f02d74de'] = [
                0x80 + ((0x20 * paramd.scratchd.count++) & 0x7F),
                0x02, // Length
                0x00, // Reserved
                0x20, 0x11, // MSG_ID_CC_TEMP_READ          
                0x00, 0x00 // CRC
            ];
        },
        data_in: function (paramd) {
            var value = paramd.rawd['a495ff11c5b14b44b5121370f02d74de'];
            if (value !== undefined) {
                if (value.length !== 8) {
                    console.log("# BeanLight.driver_in", "expected value.length==8", value);
                } else if (value[1] !== 3) {
                    console.log("# BeanLight.driver_in", "expected value[1]==3", value);
                } else if (value[3] !== 32) {
                    console.log("# BeanLight.driver_in", "expected value[3]==32", value);
                } else if (value[4] !== 145) {
                    console.log("# BeanLight.driver_in", "expected value[4]==145", value);
                } else {
                    paramd.cookd['temperature'] = value[5];
                }
            }
        },
    },
};
