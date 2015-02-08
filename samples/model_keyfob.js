/*
 *  Use a Model to manipulate semantically
 */

var iotdb = require("iotdb");

var TIKeyFob = require('../TIKeyFob');

wrapper = iotdb.bridge_wrapper(TIKeyFob.binding);
wrapper.on('model', function(model) {
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
