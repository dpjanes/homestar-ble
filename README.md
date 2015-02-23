# homestar-ble
IOTDB HomeStar Controller for Bluetooth Low Energy Devices

# BLEBridge

This talks BLE by sending buffers with characteristic UUIDs.
See the various bindings for examples.
You are much better using the Models (below) though obviously
if you want to support new BLE devices you'll have some
familarity with this.

# Models

## BeanLight

The Bean\* classes work with 
[LighBlue Bean](https://punchthrough.com/bean/).

This Model sets RGB color.

## BeanTemperature

This Model reads the temperature in Celsius.

## BeanXYZ

This Model read the XYZ Orientation.

## TIKeyFob

This Model reads the the buttons on a 
[TIKeyFob](http://processors.wiki.ti.com/index.php/Category:KeyFobDemo).

This actually will create 2 Things for each Key Fob - one
for the left button and one for the right buton.
