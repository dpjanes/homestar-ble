/*
 *  Use a Model to manipulate semantically
 */

var iotdb = require("iotdb");

var BLEBridge = require('../BLEBridge').Bridge;
var BeanLight = require('../BeanLight');

wrapper = iotdb.bridge_wrapper(new BLEBridge(), BeanLight.binding);
wrapper.on('discovered', function(bridge) {
    var model = new BeanLight.Model();
    model.bind_bridge(bridge);

    model.on_change(function(model) {
        console.log("+ state\n ", model.thing_id(), model.state());
    });
    model.on_meta(function(model) {
        console.log("+ meta\n ", model.thing_id(), model.meta().state());
    });
    
    console.log("+ discovered\n ", model.meta().state(), "\n ", model.thing_id());

    var count = 0;
    var colors = [ "#FF0000", "#00FF00", "#0000FF", "#00FFFF", "#FF00FF", "#FFFF00", "#FFFFFF", ];
    var timer = setInterval(function() {
        if (!model.reachable()) {
            console.log("+ forgetting unreachable model");
            clearInterval(timer);
            return;
        }

        model.set(":color", colors[count++ % colors.length]);
    }, 2500);
})
wrapper.on('ignored', function(bridge) {
    console.log("+ ignored\n ", bridge.meta());
});
