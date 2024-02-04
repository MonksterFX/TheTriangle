# The Triangle - Hardware

## DMX Channels V2

| Ch1    | Ch2 | Ch3   | Ch4  | Ch5   | Ch6         | Ch7      | Ch8      | Ch9      | Ch10     |
| ------ | --- | ----- | ---- | ----- | ----------- | -------- | -------- | -------- | -------- |
| Dimmer | Red | Green | Blue | White | Functions\* | Pattern1 | Pattern3 | Pattern3 | Pattern4 |

> Note: Function Channel is planned for special effects like blurring but not yet implemented

## Limitations

With the current implementation and hardware there are some limitations:

- No galvanic isolation between arduino and the serial bus
- Use of multiple stripes in parrallel (multiple instances of Adafruit_NeoPixel) is not recommended
- Not every pixel can be dimmed or colored individually (dmx has to few channels for that)
- Max Addressable Pixels = Number of Pattern CH \* 8 (Currently fixed for 32bit = 32 Pixel)
- Only 1 Dmx Universe is addressable
- Speed of NodeJS
