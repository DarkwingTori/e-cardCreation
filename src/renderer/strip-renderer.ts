import { encodeBlock } from '../encoder/modulation'
import { rawToBlocks } from '../encoder/strip-builder'

// Block geometry (from Nintendo e-Reader dotcode spec)
// Data area: 3 rows×26 wide + 26 rows×34 wide + 3 rows×26 wide = 1040 dots
const DATA_ROW_WIDTHS: ReadonlyArray<number> = [
  ...Array(3).fill(26),
  ...Array(26).fill(34),
  ...Array(3).fill(26),
] // 32 rows total

const DATA_ROWS = 32       // total rows in the data area
const MAX_DATA_WIDTH = 34  // widest data row

// Structural elements surrounding each data block
// Guide bar: horizontal row at top & bottom (calibration stripes)
const GUIDE_ROWS = 2
// Address column: 1-dot-wide vertical strip on the left (encodes block index)
const ADDR_COLS = 1
// Corner calibration dots: large black squares at each block corner
const CORNER_SIZE = 2

// Full block dimensions in dots
const BLOCK_HEIGHT_DOTS =
  CORNER_SIZE + GUIDE_ROWS + DATA_ROWS + GUIDE_ROWS + CORNER_SIZE
const BLOCK_WIDTH_DOTS =
  CORNER_SIZE + ADDR_COLS + MAX_DATA_WIDTH + CORNER_SIZE

export type DPIOption = 600 | 1200

// Pixel size of one dot at each DPI setting
// Physical dot ≈ 0.22mm; at 600 DPI (25.4mm/inch) → ~5.2px, use 5
const DOT_PX: Record<DPIOption, number> = { 600: 5, 1200: 10 }

// Encode the block index into 32 address bits (MSB first, simple binary)
// Each of the 32 address rows gets 1 bit from the index (padded with zeros).
function addressBit(blockIndex: number, row: number): boolean {
  // Encode the block index in the top 5 bits of the 32 address rows
  if (row < 32 && row < 5) return ((blockIndex >> (4 - row)) & 1) === 1
  return false
}

// Draw one block onto the canvas context.
function drawBlock(
  ctx: CanvasRenderingContext2D,
  blockBytes: Uint8Array,
  blockIndex: number,
  offsetX: number,
  dotPx: number,
): void {
  const dots = encodeBlock(blockBytes)

  const bx = offsetX
  const totalH = BLOCK_HEIGHT_DOTS * dotPx

  const fillDot = (dotCol: number, dotRow: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(bx + dotCol * dotPx, dotRow * dotPx, dotPx, dotPx)
  }

  // --- Corner calibration dots (top-left, top-right, bottom-left, bottom-right) ---
  const corners = [
    { c: 0, r: 0 },
    { c: BLOCK_WIDTH_DOTS - CORNER_SIZE, r: 0 },
    { c: 0, r: BLOCK_HEIGHT_DOTS - CORNER_SIZE },
    { c: BLOCK_WIDTH_DOTS - CORNER_SIZE, r: BLOCK_HEIGHT_DOTS - CORNER_SIZE },
  ]
  for (const { c, r } of corners) {
    for (let dc = 0; dc < CORNER_SIZE; dc++) {
      for (let dr = 0; dr < CORNER_SIZE; dr++) {
        fillDot(c + dc, r + dr, '#000000')
      }
    }
  }

  // --- Guide bars (top and bottom, between corners) ---
  const guideTopStart = CORNER_SIZE
  const guideTopEnd = CORNER_SIZE + GUIDE_ROWS
  const guideBotStart = totalH / dotPx - CORNER_SIZE - GUIDE_ROWS
  const guideBotEnd = totalH / dotPx - CORNER_SIZE
  const guideColStart = CORNER_SIZE
  const guideColEnd = BLOCK_WIDTH_DOTS - CORNER_SIZE

  for (let c = guideColStart; c < guideColEnd; c++) {
    for (let r = guideTopStart; r < guideTopEnd; r++) fillDot(c, r, '#000000')
    for (let r = guideBotStart; r < guideBotEnd; r++) fillDot(c, r, '#000000')
  }

  // --- Address column (left side, between guide rows) ---
  const dataRowOffset = CORNER_SIZE + GUIDE_ROWS
  for (let row = 0; row < DATA_ROWS; row++) {
    const bit = addressBit(blockIndex, row)
    fillDot(CORNER_SIZE, dataRowOffset + row, bit ? '#000000' : '#ffffff')
  }

  // --- Data area ---
  const dataColStart = CORNER_SIZE + ADDR_COLS
  let dotIdx = 0
  for (let row = 0; row < DATA_ROWS; row++) {
    const rowWidth = DATA_ROW_WIDTHS[row]
    for (let col = 0; col < rowWidth; col++) {
      const black = dots[dotIdx++]
      fillDot(dataColStart + col, dataRowOffset + row, black ? '#000000' : '#ffffff')
    }
    // Fill the remaining columns in narrow rows with white
    for (let col = rowWidth; col < MAX_DATA_WIDTH; col++) {
      fillDot(dataColStart + col, dataRowOffset + row, '#ffffff')
    }
  }
}

export function renderStrip(raw: Uint8Array, dpi: DPIOption = 600): HTMLCanvasElement {
  const blocks = rawToBlocks(raw)
  const dotPx = DOT_PX[dpi]

  const canvasW = blocks.length * BLOCK_WIDTH_DOTS * dotPx
  const canvasH = BLOCK_HEIGHT_DOTS * dotPx

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasW, canvasH)

  for (let i = 0; i < blocks.length; i++) {
    drawBlock(ctx, blocks[i], i, i * BLOCK_WIDTH_DOTS * dotPx, dotPx)
  }

  return canvas
}

export function downloadPNG(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

export function blockDimensions() {
  return { BLOCK_WIDTH_DOTS, BLOCK_HEIGHT_DOTS, DATA_ROWS, MAX_DATA_WIDTH }
}
