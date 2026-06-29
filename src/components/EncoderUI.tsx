import { useRef, useState } from 'react'
import { EVENT_CARDS, type EventCard } from '../data/events'
import { renderStrip, renderPrintPage, downloadPNG, type DPIOption } from '../renderer/strip-renderer'

export default function EncoderUI() {
  const [selectedId, setSelectedId] = useState<string>(EVENT_CARDS[0].id)
  const [dpi, setDpi] = useState<DPIOption>(600)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rawRef = useRef<Uint8Array | null>(null)

  const selectedCard = EVENT_CARDS.find((c) => c.id === selectedId)!

  async function loadAndRender(card: EventCard, chosenDpi: DPIOption) {
    setLoading(true)
    setError(null)
    setCanvasReady(false)
    try {
      const res = await fetch(card.file)
      if (!res.ok) throw new Error(`Failed to fetch ${card.file}: ${res.status}`)
      const buffer = await res.arrayBuffer()
      const raw = new Uint8Array(buffer)
      rawRef.current = raw
      const canvas = renderStrip(raw, chosenDpi)
      canvasRef.current = canvas
      const container = canvasContainerRef.current!
      container.innerHTML = ''
      canvas.style.maxWidth = '100%'
      canvas.style.display = 'block'
      container.appendChild(canvas)
      setCanvasReady(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const buffer = ev.target?.result as ArrayBuffer
      const raw = new Uint8Array(buffer)
      rawRef.current = raw
      setLoading(true)
      setError(null)
      setCanvasReady(false)
      try {
        const canvas = renderStrip(raw, dpi)
        canvasRef.current = canvas
        const container = canvasContainerRef.current!
        container.innerHTML = ''
        canvas.style.maxWidth = '100%'
        canvas.style.display = 'block'
        container.appendChild(canvas)
        setCanvasReady(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleDownloadStrip() {
    if (!canvasRef.current) return
    const name = selectedCard.name.replace(/\s+/g, '_').toLowerCase()
    downloadPNG(canvasRef.current, `${name}_dotcode_${dpi}dpi.png`)
  }

  function handleDownloadPrintSheet() {
    if (!rawRef.current) return
    const name = selectedCard.name.replace(/\s+/g, '_').toLowerCase()
    const page = renderPrintPage(rawRef.current, dpi)
    downloadPNG(page, `${name}_print_sheet_${dpi}dpi.png`)
  }

  return (
    <div>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <h1 style={s.headerTitle}>e-Reader Encoder</h1>
          <p style={s.headerSubtitle}>
            Select an event card below and generate a printable dotcode strip for the Game Boy Advance e-Reader.
          </p>
        </div>
      </header>

      <div style={s.content}>
        {/* Card Gallery */}
        <section style={s.panel}>
          <h2 style={s.sectionTitle}>Select Event Card</h2>
          <div style={s.gallery}>
            {EVENT_CARDS.map((card) => {
              const selected = card.id === selectedId
              return (
                <button
                  key={card.id}
                  onClick={() => setSelectedId(card.id)}
                  style={{
                    ...s.tile,
                    ...(selected ? s.tileSelected : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) Object.assign((e.currentTarget as HTMLElement).style, s.tileHoverStyle)
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) Object.assign((e.currentTarget as HTMLElement).style, s.tileLeaveStyle)
                  }}
                >
                  <div style={s.tileImgWrap}>
                    <img
                      src={card.image}
                      alt={card.name}
                      style={s.tileImg}
                    />
                  </div>
                  <div style={s.tileName}>{card.name}</div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Controls */}
        <section style={s.panel}>
          <div style={s.controlsRow}>
            <label style={s.label}>
              <span style={s.labelText}>Output DPI</span>
              <select
                style={s.select}
                value={dpi}
                onChange={(e) => setDpi(Number(e.target.value) as DPIOption)}
              >
                <option value={600}>600 DPI</option>
                <option value={1200}>1200 DPI</option>
              </select>
            </label>

            <button
              style={{ ...s.btn, ...s.btnPrimary, ...(loading ? s.btnDisabled : {}) }}
              onClick={() => loadAndRender(selectedCard, dpi)}
              disabled={loading}
            >
              {loading ? 'Rendering…' : 'Render Strip'}
            </button>
          </div>

          <div style={s.uploadRow}>
            <span style={s.uploadLabel}>Or upload any .raw file:</span>
            <input
              type="file"
              accept=".raw"
              style={s.fileInput}
              onChange={handleFileUpload}
            />
          </div>

          {canvasReady && (
            <div style={s.downloadRow}>
              <button style={{ ...s.btn, ...s.btnSienna }} onClick={handleDownloadStrip}>
                Download Strip
              </button>
              <button style={{ ...s.btn, ...s.btnGreen }} onClick={handleDownloadPrintSheet}>
                Download Print Sheet
              </button>
            </div>
          )}
        </section>

        {error && <div style={s.error}>Error: {error}</div>}

        {/* Preview */}
        <section style={s.previewPanel}>
          {!canvasReady && !loading && (
            <p style={s.previewPlaceholder}>
              Select a card and click <strong>Render Strip</strong> to preview the dotcode.
            </p>
          )}
          {loading && <p style={s.previewPlaceholder}>Rendering…</p>}
          {/* Canvas is appended here directly — no React children inside this div */}
          <div ref={canvasContainerRef} style={{ ...s.preview, display: canvasReady ? 'block' : 'none' }} />
        </section>

        {/* Print tips */}
        {canvasReady && (
          <div style={s.printTips}>
            <strong>Printing tips:</strong> Use semi-glossy or glossy cardstock. Print at <strong>100% scale</strong> (no fit-to-page). Leave at least 0.5 cm margins. Minimum 600 DPI — 1200 DPI preferred. Use <em>Download Print Sheet</em> to get a full Letter-size page with the strip positioned at the bottom for scanning.
          </div>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  header: {
    background: 'linear-gradient(135deg, #A0522D 0%, #E35336 50%, #F4A460 100%)',
    padding: '2.5rem 2rem 2rem',
    marginBottom: '2rem',
  },
  headerInner: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  headerTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.5rem',
    fontFamily: "'Bitter', serif",
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '1rem',
    margin: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  content: {
    padding: '0 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  panel: {
    background: '#FFFDF5',
    border: '1px solid rgba(160,82,45,0.3)',
    borderRadius: '0.625rem',
    padding: '1.25rem 1.5rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#A0522D',
    marginBottom: '1rem',
    fontFamily: "'Bitter', serif",
  },
  gallery: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    gap: '10px',
    paddingBottom: '6px',
  },
  tile: {
    background: '#FFFDF5',
    border: '1px solid rgba(160,82,45,0.3)',
    borderRadius: '0.625rem',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 200ms ease',
    transform: 'scale(1)',
    boxShadow: 'none',
    outline: 'none',
    flex: '0 0 auto',
    width: '140px',
  },
  tileSelected: {
    border: '2px solid #E35336',
    boxShadow: '0 0 0 3px rgba(227,83,54,0.2)',
    transform: 'scale(1.04)',
  },
  tileHoverStyle: {
    transform: 'scale(1.03)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderColor: 'rgba(160,82,45,0.55)',
  },
  tileLeaveStyle: {
    transform: 'scale(1)',
    boxShadow: 'none',
    borderColor: 'rgba(160,82,45,0.3)',
  },
  tileImgWrap: {
    width: '100%',
    height: '185px',
    overflow: 'hidden',
    borderRadius: '0.5rem 0.5rem 0 0',
    background: '#EDE8D5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  tileName: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#3D2B1F',
    padding: '5px 8px 7px',
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.3,
  },
  controlsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'flex-end',
    marginBottom: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  labelText: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#8B7355',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontFamily: "'DM Sans', sans-serif",
  },
  select: {
    padding: '0.45rem 0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid rgba(160,82,45,0.3)',
    background: '#FAF5E8',
    color: '#3D2B1F',
    fontSize: '0.9rem',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    minWidth: 140,
  },
  btn: {
    padding: '0.5rem 1.25rem',
    borderRadius: '0.375rem',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 150ms ease',
    color: '#fff',
  },
  btnPrimary: {
    background: '#E35336',
  },
  btnSienna: {
    background: '#A0522D',
  },
  btnGreen: {
    background: '#2a7d4f',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  uploadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  uploadLabel: {
    fontSize: '0.85rem',
    color: '#8B7355',
    fontFamily: "'DM Sans', sans-serif",
  },
  fileInput: {
    fontSize: '0.85rem',
    color: '#3D2B1F',
    fontFamily: "'DM Sans', sans-serif",
  },
  downloadRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(160,82,45,0.15)',
  },
  error: {
    color: '#d4183d',
    background: '#fff0f0',
    border: '1px solid rgba(212,24,61,0.25)',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  previewPanel: {
    background: '#FFFDF5',
    border: '1px solid rgba(160,82,45,0.3)',
    borderRadius: '0.625rem',
    padding: '1rem',
  },
  preview: {
    overflowX: 'auto',
    background: '#fff',
    borderRadius: '0.375rem',
    minHeight: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  previewPlaceholder: {
    color: '#8B7355',
    fontSize: '0.875rem',
    fontFamily: "'DM Sans', sans-serif",
    padding: '1rem',
    margin: 0,
  },
  printTips: {
    fontSize: '0.82rem',
    color: '#8B7355',
    background: '#EDE8D5',
    borderLeft: '3px solid #E35336',
    padding: '0.75rem 1rem',
    borderRadius: '0 0.375rem 0.375rem 0',
    lineHeight: 1.65,
    fontFamily: "'DM Sans', sans-serif",
  },
}
