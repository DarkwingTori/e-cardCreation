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
      {/* ── HERO ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.eyebrow}>Nintendo e-Reader Preservation Tool</div>
          <h1 style={s.headerTitle}>e-Reader Card Encoder</h1>
          <p style={s.headerSubtitle}>
            Generate printable dotcode strips for Pokémon GBA event cards.
            Print at home and scan on real hardware.
          </p>
          <div style={s.heroStats}>
            <span style={s.heroStat}>83 cards</span>
            <span style={s.heroStat}>Ruby · Sapphire</span>
            <span style={s.heroStat}>Emerald</span>
            <span style={s.heroStat}>Battle-e Series 1</span>
          </div>
        </div>
      </header>

      {/* ── BROWSE SECTION ── */}
      <section style={s.browseSection}>
        <div style={s.innerContent}>
          <span style={s.sectionLabel}>Card Library</span>

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

          {/* Card gallery */}
          <div style={s.gallery} className="gallery-scroll">
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
                    <div style={s.tileNameOverlay}>
                      <span style={s.tileNameText}>{card.name}</span>
                      {card.romRevision && (
                        <span style={s.revBadge}>{card.romRevision}</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Card detail panel */}
          <div style={s.detailPanel}>
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
                    <span style={s.revBadgeLarge}>{selectedCard.romRevision}</span>
                  )}
                </div>
                <div style={s.detailGame}>{selectedCard.game}</div>
                <div style={s.compatGames}>
                  {selectedCard.instructions.compatibleGames.join(' · ')}
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
          </div>
        </div>
      </section>

      {/* ── ENCODER SECTION ── */}
      <section style={s.encoderSection}>
        <div style={s.innerContent}>
          <span style={s.sectionLabel}>Generate Dotcode Strip</span>

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
              {loading ? <span>Rendering<LoadingDots /></span> : '▶  Render Strip'}
            </HoverButton>

            <div style={s.uploadGroup}>
              <span style={s.uploadLabel}>or upload a .raw file</span>
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
          </div>

          {error && <div style={s.error}>⚠ {error}</div>}

          {/* Canvas preview — dark viewer */}
          <div style={s.previewPanel}>
            {!canvasReady && !loading && (
              <p style={s.previewPlaceholder}>
                Select a card above and click <strong style={{ color: '#E35336' }}>▶ Render Strip</strong> to preview the dotcode.
              </p>
            )}
            {loading && (
              <p style={s.previewPlaceholder}>
                Rendering<LoadingDots />
              </p>
            )}
            <div
              ref={canvasContainerRef}
              style={{ ...s.preview, display: canvasReady ? 'block' : 'none' }}
            />
          </div>

          {canvasReady && (
            <>
              <div style={s.downloadRow}>
                <HoverButton
                  style={{ ...s.btn, ...s.btnOutline }}
                  hoverStyle={s.btnOutlineHover}
                  onClick={handleDownloadStrip}
                >
                  ↓  Download Strip
                </HoverButton>
                <HoverButton
                  style={{ ...s.btn, ...s.btnOutlineGreen }}
                  hoverStyle={s.btnOutlineGreenHover}
                  onClick={handleDownloadPrintSheet}
                >
                  ↓  Download Print Sheet
                </HoverButton>
              </div>
              <div style={s.printTips}>
                <strong>Print tips:</strong> Use semi-glossy or glossy cardstock. Print at <strong>100% scale</strong> (disable "fit to page"). Minimum 600 DPI — 1200 DPI preferred. Feed paper <strong>bottom-edge-first</strong> into the GBA e-Reader slot. Use <em>Download Print Sheet</em> for a pre-positioned US Letter page.
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span>Fan preservation project — not affiliated with, endorsed by, or sponsored by Nintendo Co., Ltd.</span>
          <span style={s.footerDot}>·</span>
          <span>No ROM files distributed.</span>
        </div>
      </footer>
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
  // ── HERO ────────────────────────────────────────────────────────────────────
  header: {
    background: '#1C1410',
    backgroundImage: [
      'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
      'linear-gradient(160deg, #0D0804 0%, #1C1410 60%, #2A1C14 100%)',
    ].join(', '),
    backgroundSize: '28px 28px, 100% 100%',
    padding: 'clamp(3rem, 6vw, 5rem) 2rem clamp(2.5rem, 5vw, 4rem)',
  },
  headerInner: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#E35336',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: '1rem',
  },
  headerTitle: {
    fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
    fontWeight: 700,
    color: '#FFF8F0',
    letterSpacing: '-0.02em',
    lineHeight: 1.08,
    fontFamily: "'Bitter', serif",
    marginBottom: '1rem',
  },
  headerSubtitle: {
    color: 'rgba(255,248,240,0.6)',
    fontSize: '1.05rem',
    margin: '0 0 0',
    fontFamily: "'DM Sans', sans-serif",
    maxWidth: 500,
    lineHeight: 1.65,
  },
  heroStats: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    marginTop: '1.75rem',
  },
  heroStat: {
    display: 'inline-block',
    padding: '0.3rem 0.8rem',
    borderRadius: '100px',
    background: 'rgba(255,248,240,0.08)',
    border: '1px solid rgba(255,248,240,0.14)',
    color: 'rgba(255,248,240,0.65)',
    fontSize: '0.78rem',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
  },

  // ── LAYOUT ──────────────────────────────────────────────────────────────────
  browseSection: {
    background: '#F7F3EA',
    padding: 'clamp(1.75rem, 3vw, 2.5rem) 2rem',
  },
  encoderSection: {
    background: '#F4F0E8',
    padding: 'clamp(1.75rem, 3vw, 2.5rem) 2rem',
    borderTop: '1px solid rgba(0,0,0,0.07)',
  },
  innerContent: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  sectionLabel: {
    display: 'block',
    fontSize: '0.68rem',
    fontWeight: 800,
    letterSpacing: '0.13em',
    textTransform: 'uppercase' as const,
    color: '#A0522D',
    marginBottom: '1.25rem',
    fontFamily: "'DM Sans', sans-serif",
  },

  // ── TABS ────────────────────────────────────────────────────────────────────
  tabs: {
    display: 'flex',
    gap: '0.25rem',
    background: 'rgba(0,0,0,0.07)',
    borderRadius: '12px',
    padding: '4px',
    alignSelf: 'flex-start' as const,
    marginBottom: '1.5rem',
    width: 'fit-content',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    padding: '0.55rem 1.25rem',
    fontSize: '0.88rem',
    fontWeight: 600,
    color: '#6B4A30',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 150ms ease, color 150ms ease, box-shadow 150ms ease',
  },
  tabActive: {
    background: '#E35336',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(227,83,54,0.4)',
  },
  tabHoverStyle: { background: 'rgba(227,83,54,0.1)', color: '#A0522D' },
  tabLeaveStyle: { background: 'transparent', color: '#6B4A30' },

  // ── GALLERY ─────────────────────────────────────────────────────────────────
  gallery: {
    display: 'flex',
    flexDirection: 'row' as const,
    overflowX: 'auto' as const,
    gap: '12px',
    paddingBottom: '8px',
    marginBottom: '1.5rem',
  },
  tile: {
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    padding: 0,
    cursor: 'pointer',
    outline: 'none',
    flex: '0 0 auto',
    width: '196px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.14), 0 1px 2px rgba(0,0,0,0.08)',
    transition: 'transform 200ms ease, box-shadow 200ms ease',
    overflow: 'hidden',
  },
  tileSelected: {
    boxShadow: '0 0 0 3px #E35336, 0 8px 24px rgba(227,83,54,0.28)',
    transform: 'translateY(-4px)',
  },
  tileHoverStyle: {
    transform: 'translateY(-6px)',
    boxShadow: '0 14px 36px rgba(0,0,0,0.22), 0 4px 8px rgba(0,0,0,0.12)',
  },
  tileLeaveStyle: {
    transform: 'translateY(0)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.14), 0 1px 2px rgba(0,0,0,0.08)',
  },
  tileImgWrap: {
    width: '100%',
    height: '140px',
    background: '#1A1410',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  tileImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  },
  tileNameOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)',
    padding: '22px 8px 7px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
  },
  tileNameText: {
    fontSize: '10.5px',
    fontWeight: 700,
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.3,
    display: 'block',
  },
  revBadge: {
    display: 'inline-block',
    fontSize: '8.5px',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.7)',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '3px',
    padding: '1px 4px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap' as const,
    alignSelf: 'flex-start' as const,
  },

  // ── CARD DETAIL ─────────────────────────────────────────────────────────────
  detailPanel: {
    background: '#FFFDF7',
    borderRadius: '16px',
    padding: '1.75rem',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  },
  detailLayout: {
    display: 'flex',
    gap: '1.75rem',
    alignItems: 'flex-start',
  },
  detailImgWrap: {
    flex: '0 0 224px',
    width: '224px',
    height: '160px',
    background: '#1A1410',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  detailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  detailInfo: {
    flex: 1,
    minWidth: 0,
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.25rem',
    flexWrap: 'wrap' as const,
  },
  detailName: {
    fontSize: '1.45rem',
    fontWeight: 700,
    color: '#1A1008',
    fontFamily: "'Bitter', serif",
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  },
  revBadgeLarge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#A0522D',
    background: '#EDE8D5',
    border: '1px solid rgba(160,82,45,0.3)',
    borderRadius: '5px',
    padding: '2px 7px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap' as const,
  },
  detailGame: {
    fontSize: '0.82rem',
    color: '#A0522D',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    marginBottom: '0.2rem',
  },
  compatGames: {
    fontSize: '0.75rem',
    color: '#8B7355',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: '1rem',
  },
  instructionTabBar: {
    display: 'flex',
    gap: '0.35rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap' as const,
  },
  instrTab: {
    background: '#EDE8D5',
    border: '1px solid rgba(160,82,45,0.18)',
    borderRadius: '7px',
    padding: '0.32rem 0.8rem',
    fontSize: '0.78rem',
    fontWeight: 600,
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
    border: '1px solid rgba(160,82,45,0.14)',
    borderRadius: '8px',
    padding: '0.9rem 1rem',
    maxHeight: '180px',
    overflowY: 'auto' as const,
  },
  instructionPara: {
    fontSize: '0.82rem',
    color: '#3D2B1F',
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.65,
    margin: '0 0 0.6rem 0',
  },

  // ── CONTROLS ─────────────────────────────────────────────────────────────────
  controlsRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    alignItems: 'flex-end',
    marginBottom: '1.25rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
  },
  labelText: {
    fontSize: '0.7rem',
    fontWeight: 800,
    color: '#8B7355',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontFamily: "'DM Sans', sans-serif",
  },
  select: {
    padding: '0.55rem 0.85rem',
    borderRadius: '10px',
    border: '1px solid rgba(160,82,45,0.25)',
    background: '#FFFDF7',
    color: '#1A1008',
    fontSize: '0.9rem',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    minWidth: 140,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  btn: {
    padding: '0.6rem 1.5rem',
    borderRadius: '10px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 150ms ease, transform 100ms ease, box-shadow 150ms ease',
    letterSpacing: '0.01em',
    color: '#fff',
  },
  btnPrimary: {
    background: '#E35336',
    boxShadow: '0 2px 8px rgba(227,83,54,0.35)',
  },
  btnPrimaryHover: {
    background: '#C9412A',
    boxShadow: '0 4px 16px rgba(227,83,54,0.45)',
    transform: 'translateY(-1px)',
  },
  btnOutline: {
    background: 'transparent',
    border: '1.5px solid rgba(160,82,45,0.5)',
    color: '#A0522D',
    boxShadow: 'none',
  },
  btnOutlineHover: {
    background: 'rgba(160,82,45,0.08)',
    borderColor: '#A0522D',
    transform: 'translateY(-1px)',
  },
  btnOutlineGreen: {
    background: 'transparent',
    border: '1.5px solid rgba(42,125,79,0.5)',
    color: '#2a7d4f',
    boxShadow: 'none',
  },
  btnOutlineGreenHover: {
    background: 'rgba(42,125,79,0.08)',
    borderColor: '#2a7d4f',
    transform: 'translateY(-1px)',
  },
  btnDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  uploadGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    flexWrap: 'wrap' as const,
  },
  uploadLabel: {
    fontSize: '0.82rem',
    color: '#8B7355',
    fontFamily: "'DM Sans', sans-serif",
  },
  fileLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.9rem',
    borderRadius: '10px',
    border: '1.5px solid rgba(160,82,45,0.3)',
    background: '#FFFDF7',
    color: '#6B4A30',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  fileInputHidden: {
    position: 'absolute' as const,
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden' as const,
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap' as const,
  },

  // ── ERROR ────────────────────────────────────────────────────────────────────
  error: {
    color: '#c9412a',
    background: 'rgba(227,83,54,0.08)',
    border: '1px solid rgba(227,83,54,0.25)',
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: '1rem',
  },

  // ── CANVAS PREVIEW ───────────────────────────────────────────────────────────
  previewPanel: {
    background: '#1A1410',
    borderRadius: '16px',
    padding: '1.5rem',
    marginTop: '1rem',
    boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.3)',
  },
  preview: {
    overflowX: 'auto' as const,
    background: 'transparent',
    borderRadius: '8px',
  },
  previewPlaceholder: {
    color: 'rgba(255,248,240,0.38)',
    fontSize: '0.875rem',
    fontFamily: "'DM Sans', sans-serif",
    padding: '3rem 1rem',
    margin: 0,
    textAlign: 'center' as const,
  },
  loadingDots: {
    display: 'inline-block',
    animation: 'pulse 1.2s infinite',
  },

  // ── DOWNLOAD ─────────────────────────────────────────────────────────────────
  downloadRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    marginTop: '1.25rem',
  },

  // ── PRINT TIPS ───────────────────────────────────────────────────────────────
  printTips: {
    fontSize: '0.8rem',
    color: '#6B4A30',
    background: 'rgba(227,83,54,0.05)',
    border: '1px solid rgba(227,83,54,0.18)',
    borderLeft: '3px solid #E35336',
    padding: '0.9rem 1.1rem',
    borderRadius: '0 10px 10px 0',
    lineHeight: 1.65,
    fontFamily: "'DM Sans', sans-serif",
    marginTop: '1.25rem',
  },

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  footer: {
    background: '#1A1410',
    padding: '1.25rem 2rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  footerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    fontSize: '0.72rem',
    color: 'rgba(255,248,240,0.35)',
    fontFamily: "'DM Sans', sans-serif",
    alignItems: 'center',
  },
  footerDot: {
    color: 'rgba(255,248,240,0.2)',
  },
}
