import { BufferHelper } from './utils';

type Postion = {
  x: number;
  y: number;
  z: number;
  angle: number;
  length: number;
};

type StripeConstructor = {
  length: number;
};

export class Stripe {
  private pattern: Buffer;
  private numberOfPixels: number;
  private intensity: number = 0;
  private color = Buffer.alloc(4, 0x00);

  constructor({ length }: StripeConstructor) {
    this.numberOfPixels = length;
    this.pattern = Buffer.alloc(Math.ceil(length / 8), 0x00);
  }

  /** number of pixels */
  get length() {
    return this.numberOfPixels;
  }

  /** get readonly cloned buffer */
  get patternBuffer() {
    return BufferHelper.clone(this.pattern);
  }

  getChannels() {
    return Buffer.from([this.intensity, ...this.color, ...this.pattern]);
  }

  setColor(red: number, green: number, blue: number, white: number) {
    this.color = Buffer.from([red, green, blue, white]);
  }

  setIntensity(intensity: number) {
    this.intensity = intensity;
  }

  execute(fn: (buffer: Buffer) => Buffer) {
    this.pattern = fn(BufferHelper.clone(this.pattern));
  }

  setPixel(pixelIndex: number) {
    BufferHelper.set(this.pattern, pixelIndex - 1);
  }

  unsetPixel(pixelIndex: number) {
    BufferHelper.unset(this.pattern, pixelIndex - 1);
  }

  reset() {
    this.pattern = Buffer.alloc(Math.ceil(this.length / 8), 0x00);
  }

  full() {
    this.pattern = Buffer.alloc(Math.ceil(this.length / 8), 0xff);
  }

  shiftUp(options: { cycle: boolean } = { cycle: false }) {
    let cycleBit = false;
    if (options.cycle) {
      cycleBit = BufferHelper.get(
        this.pattern,
        this.pattern.byteLength * 8 - 1
      );
    }

    BufferHelper.shiftUp(this.pattern);

    if (options.cycle && cycleBit) {
      BufferHelper.set(this.pattern, 0);
    }
  }

  shiftDown(options: { cycle: boolean } = { cycle: false }) {
    let cycleBit = false;
    if (options.cycle) {
      cycleBit = BufferHelper.get(this.pattern, 0);
    }

    BufferHelper.shiftDown(this.pattern);

    if (options.cycle && cycleBit) {
      BufferHelper.set(this.pattern, this.pattern.byteLength * 8 - 1);
    }
  }
}
