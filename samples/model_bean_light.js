/*
 *  Cortado LightBlue Bean: change light colors
 */

try {
    var module = require('homestar-ble')
} catch (x) {
    var module = require('../index')
}
var _ = module.homestar._;

var wrapper = module.wrap("BeanLight");
wrapper.on('thing', function(model) {
    model.on("state", function(model) {
        console.log("+ state\n ", model.thing_id(), model.state());
    });
    model.on("meta", function(model) {
        console.log("+ meta\n ", model.thing_id(), _.ld.compact(model.meta().state()));
    });
    
    console.log("+ discovered\n ", _.ld.compact(model.meta().state()), "\n ", model.thing_id());

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
    console.log("+ ignored\n ", _.ld.compact(bridge.meta()));
});
