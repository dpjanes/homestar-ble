/*
 *  Cortado LightBlue Bean: temperature
 */

try {
    var model = require('homestar-ble')
} catch (x) {
    var model = require('../index')
}
var _ = model.homestar._;

var wrapper = model.wrap("BeanTemperature");
wrapper.on('discovered', function(model) {
    model.on_change(function(model) {
        console.log("+ state\n ", model.thing_id(), model.state());
    });
    model.on_meta(function(model) {
        console.log("+ meta\n ", model.thing_id(), _.ld.compact(model.meta().state()));
    });
    
    console.log("+ discovered\n ", _.ld.compact(model.meta().state()), "\n ", model.thing_id());
})
wrapper.on('ignored', function(bridge) {
    console.log("+ ignored\n ", _.ld.compact(bridge.meta()));
});
