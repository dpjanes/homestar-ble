# homestar-ble
[IOTDB](https://github.com/dpjanes/node-iotdb) Bridge for Bluetooth Low Energy Devices

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

* [Read about Bridges](https://github.com/dpjanes/node-iotdb/blob/master/docs/bridges.md)

# About

This talks BLE by sending buffers with characteristic UUIDs.
See the various bindings for examples.
You are much better using the Models (below) though obviously
if you want to support new BLE devices you'll have some
familarity with this.

# Installation

* [Read this first](https://github.com/dpjanes/node-iotdb/blob/master/docs/install.md)

Then:

    $ npm install homestar-ble

# Use

Change Cortado LightBle Bean to Red

	const iotdb = require('iotdb')
    iotdb.use("homestar-ble")

	const things = iotdb.connect("BeanLight")
	things.set(":color', "#FF0000")

See <a href="samples/">the samples</a> for details how to add to your project,
particularly ones called <code>iotdb\_\*</code>.

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

## BLEHeartRate

This model reads the standard BLE Heart Rate Profile.

e.g.

    {
        "rate": 65,
        "connected": true
    }

## TIKeyFob

This Model reads the the buttons on a 
[TIKeyFob](http://processors.wiki.ti.com/index.php/Category:KeyFobDemo).

This actually will create 2 Things for each Key Fob - one
for the left button and one for the right buton.
