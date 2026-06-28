import { useRef, useState } from 'react'
import { EVENT_CARDS, type EventCard } from '../data/events'
import { renderStrip, downloadPNG, type DPIOption } from '../renderer/strip-renderer'

export default function EncoderUI() {
  const [selectedId, setSelectedId] = useState<string>(EVENT_CARDS[0].id)
  const [dpi, setDpi] = useState<DPIOption>(600)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

  function handleDownload() {
    if (!canvasRef.current) return
    const name = selectedCard.name.replace(/\s+/g, '_').toLowerCase()
    downloadPNG(canvasRef.current, `${name}_dotcode_${dpi}dpi.png`)
  }

  return (
    <div style={styles.root}>
      <h1 style={styles.title}>Nintendo e-Reader Dotcode Encoder</h1>
      <p style={styles.subtitle}>
        Generate printable dotcode strips for use with a Game Boy Advance e-Reader.
      </p>

      <div style={styles.controls}>
        <label style={styles.label}>
          Event Card
          <select
            style={styles.select}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {EVENT_CARDS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.game}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Output DPI
          <select
            style={styles.select}
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value) as DPIOption)}
          >
            <option value={600}>600 DPI</option>
            <option value={1200}>1200 DPI</option>
          </select>
        </label>

        <button
          style={{ ...styles.button, ...styles.primaryBtn }}
          onClick={() => loadAndRender(selectedCard, dpi)}
          disabled={loading}
        >
          {loading ? 'Rendering…' : 'Render Strip'}
        </button>

        {canvasReady && (
          <button
            style={{ ...styles.button, ...styles.secondaryBtn }}
            onClick={handleDownload}
          >
            Download PNG
          </button>
        )}
      </div>

      <div style={styles.uploadRow}>
        <span style={styles.uploadLabel}>Or upload any .raw file from your collection:</span>
        <input
          type="file"
          accept=".raw"
          style={styles.fileInput}
          onChange={handleFileUpload}
        />
      </div>

      {error && <div style={styles.error}>Error: {error}</div>}

      <div ref={canvasContainerRef} style={styles.preview} />

      {canvasReady && (
        <div style={styles.printTips}>
          <strong>Printing tips:</strong> Use glossy or semi-glossy cardstock.
          Print at 100% scale (no scaling/fit-to-page). Leave at least 0.5 cm
          margins. Minimum 600 DPI — 1200 DPI preferred for best scan results.
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: 'system-ui, sans-serif',
    color: '#e8e8e8',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
    color: '#fff',
  },
  subtitle: {
    color: '#aaa',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  controls: {
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
    fontSize: '0.85rem',
    color: '#ccc',
  },
  select: {
    padding: '0.4rem 0.6rem',
    borderRadius: 6,
    border: '1px solid #444',
    background: '#2a2a3e',
    color: '#e8e8e8',
    fontSize: '0.9rem',
    minWidth: 200,
  },
  button: {
    padding: '0.45rem 1.1rem',
    borderRadius: 6,
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: 600,
  },
  primaryBtn: {
    background: '#e63946',
    color: '#fff',
  },
  secondaryBtn: {
    background: '#2a7d4f',
    color: '#fff',
  },
  uploadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  uploadLabel: {
    fontSize: '0.85rem',
    color: '#aaa',
  },
  fileInput: {
    color: '#ccc',
    fontSize: '0.85rem',
  },
  error: {
    color: '#ff6b6b',
    background: '#3a1a1a',
    padding: '0.5rem 0.75rem',
    borderRadius: 6,
    marginBottom: '1rem',
    fontSize: '0.85rem',
  },
  preview: {
    overflowX: 'auto',
    background: '#fff',
    borderRadius: 6,
    padding: '0.5rem',
    marginBottom: '1rem',
    minHeight: 60,
  },
  printTips: {
    fontSize: '0.8rem',
    color: '#aaa',
    background: '#222',
    padding: '0.6rem 0.8rem',
    borderRadius: 6,
    lineHeight: 1.6,
  },
}
