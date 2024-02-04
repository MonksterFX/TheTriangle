function set(buffer: Buffer, bitIndex: number) {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitPosition = bitIndex % 8;

  // Set the bit using bitwise OR operation
  buffer[byteIndex] = buffer[byteIndex] | (1 << bitPosition);
}

function unset(buffer: Buffer, bitIndex: number) {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitPosition = bitIndex % 8;

  // Clear the bit using bitwise AND operation with the complement of the bit
  buffer[byteIndex] &= ~(1 << bitPosition);
}

function get(buffer: Buffer, bitIndex: number) {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitPosition = bitIndex % 8;

  // Clear the bit using bitwise AND operation with the complement of the bit
  return buffer[byteIndex] >> bitPosition === 1;
}

function shiftUp(buffer: Buffer) {
  let lastDrop = 0x00;
  for (let i = 0; i < buffer.byteLength; i++) {
    const nextDrop = (buffer[i] >> 7) & 0xff;
    const shiftResult = (buffer[i] << 1) & 0xff;
    buffer[i] = shiftResult | lastDrop;
    lastDrop = nextDrop;
  }
  return buffer;
}

function shiftDown(buffer: Buffer) {
  let lastDrop = 0x00;
  for (let i = buffer.byteLength - 1; i >= 0; i--) {
    const nextDrop = (buffer[i] << 7) & 0xff;
    const shiftResult = (buffer[i] >> 1) & 0xff;
    buffer[i] = shiftResult | lastDrop;
    lastDrop = nextDrop;
  }
  return buffer;
}

function clone(buffer: Buffer) {
  const copy = Buffer.alloc(buffer.byteLength, 0);
  buffer.copy(copy);
  return copy;
}

function binaryToString(buffer: Buffer) {
  return Array.from(buffer, (byte) => {
    return ('00000000' + byte.toString(2)).slice(-8);
  }).join(' ');
}

function binaryToPatternString(buffer: Buffer) {
  return Array.from(buffer, (byte) => {
    return ('00000000' + byte.toString(2))
      .slice(-8)
      .split('')
      .reverse()
      .join('');
  }).join(' ');
}

export const BufferHelper = {
  clone,
  unset,
  set,
  get,
  shiftUp,
  shiftDown,
  binaryToString,
  binaryToPatternString,
};
