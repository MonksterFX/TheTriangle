import { Controller } from '../controller';
import { Stripe } from '../stripe';

let starteAt: Date;

export function sin(controller: Controller, channel: number) {
  const speed = 2;
  const sinceLast = (+new Date() - +starteAt) / 1000;
  const value = Math.abs(Math.sin(sinceLast * speed)) * 0xff;
  controller.update(channel, value);
}

export function strobe(device: Stripe, frequency: number) {
  let lastValue = false;
  return setInterval(() => {
    lastValue ? device.full() : device.reset();
    lastValue = !lastValue;
  }, frequency * 1000);
}
