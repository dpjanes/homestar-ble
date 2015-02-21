/*
 *  TI KeyFob: read buttons
 */

try {
    var module = require('homestar-ble')
} catch (x) {
    var module = require('../index')
}
var _ = module.homestar._;

var wrapper = module.wrap("TIKeyFob");
wrapper.on('model', function(model) {
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
