// Parses a .raw dotcode file into an array of 104-byte blocks.
// Long strip = 28 blocks = 2912 bytes. Short strip = 18 blocks = 1872 bytes.

export type StripType = 'long' | 'short'

export const BLOCK_BYTES = 104
export const LONG_STRIP_BLOCKS = 28
export const SHORT_STRIP_BLOCKS = 18

export function detectStripType(raw: Uint8Array): StripType {
  if (raw.byteLength === LONG_STRIP_BLOCKS * BLOCK_BYTES) return 'long'
  if (raw.byteLength === SHORT_STRIP_BLOCKS * BLOCK_BYTES) return 'short'
  // Fall back by rounding
  return raw.byteLength >= 2000 ? 'long' : 'short'
}

export function rawToBlocks(raw: Uint8Array): Uint8Array[] {
  const blockCount =
    raw.byteLength === SHORT_STRIP_BLOCKS * BLOCK_BYTES
      ? SHORT_STRIP_BLOCKS
      : LONG_STRIP_BLOCKS
  const blocks: Uint8Array[] = []
  for (let i = 0; i < blockCount; i++) {
    blocks.push(raw.slice(i * BLOCK_BYTES, (i + 1) * BLOCK_BYTES))
  }
  return blocks
}
