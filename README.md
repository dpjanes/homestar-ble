# homestar-ble
IOTDB HomeStar Controller for Bluetooth Low Energy Devices

# BLEBridge

This talks BLE by sending buffers with characteristic UUIDs.
See the various bindings for examples.
You are much better using the Models (below) though obviously
if you want to support new BLE devices you'll have some
familarity with this.

# Quick Start

Change Cortado LightBle Bean to Red

	$ npm install -g homestar ## with 'sudo' if error
	$ npm install iotdb
	$ homestar install homestar-ble
	$ node
	>>> iotdb = require('iotdb')
	>>> iot = iotdb.iot()
	>>> things = iot.connect("BeanLight")
	>>> things.set(":color', "#FF0000")

# Models

## BeanLight

The Bean\* classes work with 
[LighBlue Bean](https://punchthrough.com/bean/).

This Model sets RGB color.

e.g.

    {
        "color": "#FF0000"
    }

## BeanTemperature

This Model reads the temperature in Celsius.

e.g.

    {
        "temperature": 20
    }

## BeanXYZ

This Model read the XYZ Orientation.

e.g.

    {
        "x": 10,
        "y": -250,
        "z": 48
    }

## TIKeyFob

This Model reads the the buttons on a 
[TIKeyFob](http://processors.wiki.ti.com/index.php/Category:KeyFobDemo).

This actually will create 2 Things for each Key Fob - one
for the left button and one for the right buton.
