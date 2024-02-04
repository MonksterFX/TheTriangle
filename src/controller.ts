// TODO: refractor

import { SerialPort } from 'serialport';
import { Stripe } from './stripe';

// Original from: https://github.com/node-dmx/dmx/blob/d189100a6caf62346cc9548a752ab5d23333957a/drivers/enttec-usb-dmx-pro.js
const options = {
  dmx_speed: 40,
};

// where is this specification?
const ENTTEC_PRO_DMX_STARTCODE = 0x00;
const ENTTEC_PRO_START_OF_MSG = 0x7e;
const ENTTEC_PRO_END_OF_MSG = 0xe7;
const ENTTEC_PRO_SEND_DMX_RQ = 0x06;
// var ENTTEC_PRO_RECV_DMX_PKT = 0x05;

export class Controller {
  /** buffer representation of the universe */
  private buffer: Buffer = Buffer.alloc(513, 0);
  private port: SerialPort;

  private refreshInterval = 1000 / options.dmx_speed;
  private refreshHandle?: NodeJS.Timeout = undefined;

  private header: Buffer;
  private readyToWrite: boolean = true;

  // TODO: Controller should als work as emulator, or if you want to attach it later
  constructor(devicePath: string) {
    this.port = new SerialPort({
      path: devicePath,
      baudRate: 250_000,
      dataBits: 8,
      stopBits: 2,
      parity: 'none',
    });

    this.header = Buffer.from([
      ENTTEC_PRO_START_OF_MSG,
      ENTTEC_PRO_SEND_DMX_RQ,
      this.buffer.length & 0xff,
      (this.buffer.length >> 8) & 0xff,
      ENTTEC_PRO_DMX_STARTCODE,
    ]);
  }

  sendUniverse() {
    if (!this.port.writable || !this.readyToWrite) {
      return;
    }

    const message = Buffer.concat([
      this.header,
      this.buffer.slice(1),
      Buffer.from([ENTTEC_PRO_END_OF_MSG]),
    ]);

    this.readyToWrite = false;
    this.port.write(message);
    this.port.drain((err) => {
      this.readyToWrite = true;
      if (err) console.log(err);
    });
  }

  update(channel: number, data: number) {
    this.buffer[channel] = data;
  }

  start() {
    this.refreshHandle = setInterval(
      this.sendUniverse.bind(this),
      this.refreshInterval
    );
  }
}
