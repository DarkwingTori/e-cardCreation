import { useRef, useState } from 'react'
import { EVENT_CARDS, type EventCard } from '../data/events'
import { renderStrip, renderPrintPage, downloadPNG, type DPIOption } from '../renderer/strip-renderer'

type Category = 'rs-event' | 'emerald-event' | 'battle-e'
type InstructionTab = 'activation' | 'eReaderSetup' | 'cable'

const CATEGORY_LABELS: Record<Category, string> = {
  'rs-event': 'Ruby / Sapphire',
  'emerald-event': 'Emerald',
  'battle-e': 'Battle-e Series 1',
}

export default function EncoderUI() {
  const [activeCategory, setActiveCategory] = useState<Category>('rs-event')
  const [selectedId, setSelectedId] = useState<string>(EVENT_CARDS[0].id)
  const [instructionTab, setInstructionTab] = useState<InstructionTab>('activation')
  const [dpi, setDpi] = useState<DPIOption>(600)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rawRef = useRef<Uint8Array | null>(null)

  const visibleCards = EVENT_CARDS.filter((c) => c.category === activeCategory)
  const selectedCard = EVENT_CARDS.find((c) => c.id === selectedId) ?? EVENT_CARDS[0]

  function handleCategoryChange(cat: Category) {
    setActiveCategory(cat)
    const first = EVENT_CARDS.find((c) => c.category === cat)
    if (first) setSelectedId(first.id)
  }

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
      canvas.style.opacity = '0'
      canvas.style.transition = 'opacity 300ms ease'
      container.appendChild(canvas)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { canvas.style.opacity = '1' })
      })
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
        canvas.style.opacity = '0'
        canvas.style.transition = 'opacity 300ms ease'
        container.appendChild(canvas)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { canvas.style.opacity = '1' })
        })
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

  const instructionText =
    instructionTab === 'activation'
      ? selectedCard.instructions.activation
      : instructionTab === 'eReaderSetup'
      ? selectedCard.instructions.eReaderSetup
      : selectedCard.instructions.cable

  return (
    <div>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <h1 style={s.headerTitle}>e-Reader Encoder</h1>
          <p style={s.headerSubtitle}>
            Generate printable dotcode strips from Pokémon event cards for the Game Boy Advance e-Reader.
          </p>
        </div>
      </header>

      <div style={s.content}>

        {/* Category tabs */}
        <div style={s.tabs}>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                ...s.tab,
                ...(activeCategory === cat ? s.tabActive : {}),
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat)
                  Object.assign((e.currentTarget as HTMLElement).style, s.tabHoverStyle)
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat)
                  Object.assign((e.currentTarget as HTMLElement).style, s.tabLeaveStyle)
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Card Gallery */}
        <section style={s.panel}>
          <h2 style={s.sectionTitle}>Select Event Card</h2>
          <div style={s.gallery}>
            {visibleCards.map((card) => {
              const selected = card.id === selectedId
              return (
                <button
                  key={card.id}
                  onClick={() => setSelectedId(card.id)}
                  style={{ ...s.tile, ...(selected ? s.tileSelected : {}) }}
                  onMouseEnter={(e) => {
                    if (!selected)
                      Object.assign((e.currentTarget as HTMLElement).style, s.tileHoverStyle)
                  }}
                  onMouseLeave={(e) => {
                    if (!selected)
                      Object.assign((e.currentTarget as HTMLElement).style, s.tileLeaveStyle)
                  }}
                >
                  <div style={s.tileImgWrap}>
                    <img
                      src={card.image}
                      alt={card.name}
                      style={s.tileImg}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                  <div style={s.tileMeta}>
                    <span style={s.tileName}>{card.name}</span>
                    {card.romRevision && (
                      <span style={s.revBadge}>{card.romRevision}</span>
                    )}
                  </div>
                  <div style={s.tileGame}>{card.game}</div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Card Detail + Instructions */}
        <section style={s.detailPanel}>
          <div style={s.detailLayout}>
            <div style={s.detailImgWrap}>
              <img
                src={selectedCard.image}
                alt={selectedCard.name}
                style={s.detailImg}
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
            <div style={s.detailInfo}>
              <div style={s.detailHeader}>
                <span style={s.detailName}>{selectedCard.name}</span>
                {selectedCard.romRevision && (
                  <span style={s.revBadge}>{selectedCard.romRevision}</span>
                )}
              </div>
              <div style={s.detailGame}>{selectedCard.game} · English</div>
              <div style={s.compatGames}>
                {selectedCard.instructions.compatibleGames.join(', ')}
              </div>

              <div style={s.instructionTabBar}>
                {(['activation', 'eReaderSetup', 'cable'] as InstructionTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInstructionTab(tab)}
                    style={{
                      ...s.instrTab,
                      ...(instructionTab === tab ? s.instrTabActive : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (instructionTab !== tab)
                        Object.assign((e.currentTarget as HTMLElement).style, s.instrTabHoverStyle)
                    }}
                    onMouseLeave={(e) => {
                      if (instructionTab !== tab)
                        Object.assign((e.currentTarget as HTMLElement).style, s.instrTabLeaveStyle)
                    }}
                  >
                    {tab === 'activation'
                      ? 'Activate in Game'
                      : tab === 'eReaderSetup'
                      ? 'e-Reader Setup'
                      : 'Cable & Hardware'}
                  </button>
                ))}
              </div>

              <div style={s.instructionText}>
                {instructionText.split('\n\n').map((para, i) => (
                  <p key={i} style={s.instructionPara}>{para}</p>
                ))}
              </div>
            </div>
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

            <HoverButton
              style={{ ...s.btn, ...s.btnPrimary, ...(loading ? s.btnDisabled : {}) }}
              hoverStyle={s.btnPrimaryHover}
              onClick={() => loadAndRender(selectedCard, dpi)}
              disabled={loading}
            >
              {loading ? 'Rendering…' : 'Render Strip'}
            </HoverButton>
          </div>

          <div style={s.uploadRow}>
            <span style={s.uploadLabel}>Or upload any .raw file:</span>
            <label style={s.fileLabel}>
              <span>Choose File</span>
              <input
                type="file"
                accept=".raw"
                style={s.fileInputHidden}
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {canvasReady && (
            <div style={s.downloadRow}>
              <HoverButton
                style={{ ...s.btn, ...s.btnSienna }}
                hoverStyle={s.btnSiennaHover}
                onClick={handleDownloadStrip}
              >
                Download Strip
              </HoverButton>
              <HoverButton
                style={{ ...s.btn, ...s.btnGreen }}
                hoverStyle={s.btnGreenHover}
                onClick={handleDownloadPrintSheet}
              >
                Download Print Sheet
              </HoverButton>
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
          {loading && <p style={s.previewPlaceholder}>Rendering<LoadingDots /></p>}
          <div
            ref={canvasContainerRef}
            style={{ ...s.preview, display: canvasReady ? 'block' : 'none' }}
          />
        </section>

        {/* Print tips */}
        {canvasReady && (
          <div style={s.printTips}>
            <strong>Printing tips:</strong> Use semi-glossy or glossy cardstock. Print at <strong>100% scale</strong> (disable "fit to page"). Minimum 600 DPI — 1200 DPI preferred. Feed the paper <strong>bottom-edge-first</strong> into the GBA e-Reader slot. Use <em>Download Print Sheet</em> for a pre-positioned US Letter page.
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingDots() {
  return <span style={s.loadingDots}>...</span>
}

function HoverButton({
  style,
  hoverStyle,
  onClick,
  disabled,
  children,
}: {
  style: React.CSSProperties
  hoverStyle: React.CSSProperties
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      style={{ ...style, ...(hovered && !disabled ? hoverStyle : {}) }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}

const s: Record<string, React.CSSProperties> = {
  header: {
    background: 'linear-gradient(135deg, #A0522D 0%, #E35336 50%, #F4A460 100%)',
    padding: '2.5rem 2rem 2rem',
    marginBottom: '2rem',
  },
  headerInner: { maxWidth: 1100, margin: '0 auto' },
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
    padding: '0 2rem 3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    maxWidth: 1100,
    margin: '0 auto',
  },

  // Category tabs
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    background: '#EDE8D5',
    borderRadius: '0.625rem',
    padding: '0.375rem',
    alignSelf: 'flex-start',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    borderRadius: '0.4rem',
    padding: '0.45rem 1.1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#6B4A30',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 150ms ease, color 150ms ease',
  },
  tabActive: {
    background: '#FFFDF5',
    color: '#E35336',
    fontWeight: 700,
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
  },
  tabHoverStyle: { background: 'rgba(255,253,245,0.6)', color: '#A0522D' },
  tabLeaveStyle: { background: 'transparent', color: '#6B4A30' },

  // Panels
  panel: {
    background: '#FFFDF5',
    border: '1px solid rgba(160,82,45,0.3)',
    borderRadius: '0.625rem',
    padding: '1.25rem 1.5rem',
  },
  sectionTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#A0522D',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: "'DM Sans', sans-serif",
  },

  // Gallery
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
    transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
    transform: 'scale(1)',
    boxShadow: 'none',
    outline: 'none',
    flex: '0 0 auto',
    width: '140px',
  },
  tileSelected: {
    border: '2px solid #E35336',
    boxShadow: '0 0 0 3px rgba(227,83,54,0.18)',
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
  tileMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 8px 2px',
    flexWrap: 'wrap',
  },
  tileName: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#3D2B1F',
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.3,
  },
  tileGame: {
    fontSize: '10px',
    color: '#8B7355',
    padding: '0 8px 6px',
    fontFamily: "'DM Sans', sans-serif",
  },
  revBadge: {
    display: 'inline-block',
    fontSize: '9px',
    fontWeight: 700,
    color: '#8B7355',
    background: '#EDE8D5',
    border: '1px solid rgba(160,82,45,0.3)',
    borderRadius: '3px',
    padding: '1px 4px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },

  // Card detail panel
  detailPanel: {
    background: '#FFFDF5',
    border: '1px solid rgba(160,82,45,0.3)',
    borderRadius: '0.625rem',
    padding: '1.5rem',
  },
  detailLayout: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  detailImgWrap: {
    flex: '0 0 100px',
    width: '100px',
    minHeight: '132px',
    background: '#EDE8D5',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  detailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  detailInfo: {
    flex: 1,
    minWidth: 0,
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.2rem',
    flexWrap: 'wrap',
  },
  detailName: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#3D2B1F',
    fontFamily: "'Bitter', serif",
  },
  detailGame: {
    fontSize: '0.8rem',
    color: '#A0522D',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: '0.2rem',
    fontWeight: 600,
  },
  compatGames: {
    fontSize: '0.75rem',
    color: '#8B7355',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: '1rem',
  },
  instructionTabBar: {
    display: 'flex',
    gap: '0.375rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  instrTab: {
    background: '#EDE8D5',
    border: '1px solid rgba(160,82,45,0.2)',
    borderRadius: '0.375rem',
    padding: '0.3rem 0.75rem',
    fontSize: '0.78rem',
    fontWeight: 500,
    color: '#6B4A30',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 120ms ease, color 120ms ease',
  },
  instrTabActive: {
    background: '#E35336',
    color: '#fff',
    border: '1px solid #E35336',
    fontWeight: 700,
  },
  instrTabHoverStyle: { background: 'rgba(227,83,54,0.12)', color: '#A0522D' },
  instrTabLeaveStyle: { background: '#EDE8D5', color: '#6B4A30' },
  instructionText: {
    background: '#FAF5E8',
    border: '1px solid rgba(160,82,45,0.15)',
    borderRadius: '0.375rem',
    padding: '0.875rem 1rem',
    maxHeight: '180px',
    overflowY: 'auto',
  },
  instructionPara: {
    fontSize: '0.82rem',
    color: '#3D2B1F',
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.65,
    margin: '0 0 0.6rem 0',
  },

  // Controls
  controlsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'flex-end',
    marginBottom: '1rem',
  },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  labelText: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#8B7355',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
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
    transition: 'background 150ms ease, transform 80ms ease',
    color: '#fff',
  },
  btnPrimary: { background: '#E35336' },
  btnPrimaryHover: { background: '#c9412a' },
  btnSienna: { background: '#A0522D' },
  btnSiennaHover: { background: '#7d3e22' },
  btnGreen: { background: '#2a7d4f' },
  btnGreenHover: { background: '#1f5c3a' },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },

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
  fileLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.85rem',
    borderRadius: '0.375rem',
    border: '1px solid rgba(160,82,45,0.35)',
    background: '#EDE8D5',
    color: '#6B4A30',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  fileInputHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
  downloadRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(160,82,45,0.15)',
  },

  // Error
  error: {
    color: '#d4183d',
    background: '#fff0f0',
    border: '1px solid rgba(212,24,61,0.25)',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: "'DM Sans', sans-serif",
  },

  // Preview
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
  },
  previewPlaceholder: {
    color: '#8B7355',
    fontSize: '0.875rem',
    fontFamily: "'DM Sans', sans-serif",
    padding: '1rem',
    margin: 0,
  },
  loadingDots: {
    display: 'inline-block',
    animation: 'pulse 1.2s infinite',
  },

  // Print tips
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
