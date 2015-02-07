/*
 *  Use a Model to manipulate semantically
 */

var iotdb = require("iotdb");

var BLEBridge = require('../BLEBridge').Bridge;
var BeanXYZ = require('../BeanXYZ');

wrapper = iotdb.bridge_wrapper(new BLEBridge(), BeanXYZ.binding);
wrapper.on('discovered', function(bridge) {
    var model = new BeanXYZ.Model();
    model.bind_bridge(bridge);

    model.on_change(function(model) {
        console.log("+ state\n ", model.thing_id(), model.state());
    });
    model.on_meta(function(model) {
        console.log("+ meta\n ", model.thing_id(), model.meta().state());
    });
    
    console.log("+ discovered\n ", model.meta().state(), "\n ", model.thing_id());
})
wrapper.on('ignored', function(bridge) {
    console.log("+ ignored\n ", bridge.meta());
});