// 8/10 modulation: each input byte splits into two 4-bit nibbles.
// Each nibble maps to a 5-bit code. Two codes = 10 bits = 10 dots per byte.
// Source: Nintendo e-Reader dotcode spec (project-information.md).

const NIBBLE_TO_5BIT: ReadonlyArray<number> = [
  0b00000, // 0x0
  0b00001, // 0x1
  0b00010, // 0x2
  0b10010, // 0x3
  0b00100, // 0x4
  0b00101, // 0x5
  0b00110, // 0x6
  0b10110, // 0x7
  0b01000, // 0x8
  0b01001, // 0x9
  0b01010, // 0xA
  0b10100, // 0xB
  0b01100, // 0xC
  0b01101, // 0xD
  0b10001, // 0xE
  0b10000, // 0xF
]

// Reverse lookup: 5-bit code → nibble value (-1 = invalid code)
const FIVEBIT_TO_NIBBLE: ReadonlyArray<number> = (() => {
  const table = new Array<number>(32).fill(-1)
  NIBBLE_TO_5BIT.forEach((code, nibble) => {
    table[code] = nibble
  })
  return table
})()

// Encode one byte into 10 booleans (high nibble first, MSB first within each 5-bit code).
export function encodeByte(b: number): boolean[] {
  const hi = (b >> 4) & 0xf
  const lo = b & 0xf
  const hiCode = NIBBLE_TO_5BIT[hi]
  const loCode = NIBBLE_TO_5BIT[lo]
  const dots: boolean[] = []
  for (let bit = 4; bit >= 0; bit--) dots.push(((hiCode >> bit) & 1) === 1)
  for (let bit = 4; bit >= 0; bit--) dots.push(((loCode >> bit) & 1) === 1)
  return dots
}

// Encode a full 104-byte block into 1040 dot booleans.
export function encodeBlock(bytes: Uint8Array): boolean[] {
  const dots: boolean[] = []
  for (const b of bytes) {
    const ten = encodeByte(b)
    for (const d of ten) dots.push(d)
  }
  return dots
}

// Decode 10 dot booleans back to one byte. Returns null if either 5-bit code is invalid.
export function decodeByte(dots: boolean[]): number | null {
  let hiCode = 0
  let loCode = 0
  for (let i = 0; i < 5; i++) hiCode = (hiCode << 1) | (dots[i] ? 1 : 0)
  for (let i = 5; i < 10; i++) loCode = (loCode << 1) | (dots[i] ? 1 : 0)
  const hi = FIVEBIT_TO_NIBBLE[hiCode]
  const lo = FIVEBIT_TO_NIBBLE[loCode]
  if (hi === -1 || lo === -1) return null
  return (hi << 4) | lo
}

// Decode 1040 dot booleans back to 104 bytes. Invalid codes become 0x00.
export function decodeBlock(dots: boolean[]): Uint8Array {
  const bytes = new Uint8Array(104)
  for (let i = 0; i < 104; i++) {
    const b = decodeByte(dots.slice(i * 10, i * 10 + 10))
    bytes[i] = b ?? 0x00
  }
  return bytes
}
