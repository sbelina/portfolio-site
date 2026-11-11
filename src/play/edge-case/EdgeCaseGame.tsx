import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { collected, createGame, drainEvents, reachable, step, STEP, type DiscoveryId, type GameEvent, type GameState } from './engine'
import { levels } from './levels'
import { createMemory, draw, noteGateTurn, noteShift, readPalette, type View } from './render'
import { load, prefersReducedMotion, save, type Saved, type Settings } from './settings'
import { binary, discoveries, operations } from './system-index'
import { Sound } from './audio'

type Screen = 'title' | 'levels' | 'settings' | 'index' | 'playing' | 'paused' | 'failed' | 'won'
interface Hud { taken: number; total: number; reach: '' | 'junction' | 'gate' }
interface Summary { seconds: number; attempts: number; shifts: number; found: DiscoveryId[] }

const MOVE: Record<string, [number, number]> = {
  ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0],
}
const ACTION = new Set(['Space', 'Enter', 'ShiftLeft', 'ShiftRight'])
const isControl = (target: EventTarget | null) => target instanceof HTMLElement && !!target.closest('button, a, input, select, textarea, summary')
const isTextEntry = (target: EventTarget | null) => target instanceof HTMLElement && !!target.closest('input, select, textarea')
const axisWords = (axis: string) => axis === 'ns' ? 'north–south' : 'east–west'
const discoveryOf = (id: string) => discoveries.find(d => d.id === id)!

function hudOf(s: GameState): Hud {
  const target = reachable(s)
  return { taken: collected(s), total: s.samples.length, reach: target ? target.kind : '' }
}

export function EdgeCaseGame() {
  const headingId = useId()
  const [saved, setSaved] = useState<Saved>(() => load())
  const [screen, setScreen] = useState<Screen>('title')
  const [returnTo, setReturnTo] = useState<Screen>('title')
  const [levelIndex, setLevelIndex] = useState(0)
  const [hud, setHud] = useState<Hud>({ taken: 0, total: 0, reach: '' })
  const [announcement, setAnnouncement] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [summary, setSummary] = useState<Summary>({ seconds: 0, attempts: 1, shifts: 0, found: [] })
  const [failCause, setFailCause] = useState<'tracer' | 'field'>('tracer')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const game = useRef<GameState>(createGame(levels[0]))
  const memory = useRef<View['memory']>(createMemory())
  const ghost = useRef<[number, number][] | null>(null)
  const attempts = useRef(1)
  const runFound = useRef<DiscoveryId[]>([])
  const tile = useRef(36)
  const keys = useRef(new Set<string>())
  const pad = useRef({ dx: 0, dy: 0 })
  const padKey = useRef({ dx: 0, dy: 0 })
  const action = useRef(false)
  const sound = useRef(new Sound())
  const settingsRef = useRef(saved.settings)
  const screenRef = useRef(screen)
  const hudCache = useRef('')
  const settings = saved.settings
  settingsRef.current = settings
  screenRef.current = screen
  sound.current.enabled = settings.sound
  sound.current.volume = settings.volume

  const savedRef = useRef(saved)
  // Persist synchronously so discovery checks always read the latest record.
  const persist = useCallback((update: (current: Saved) => Saved) => { const next = update(savedRef.current); savedRef.current = next; setSaved(next); save(next) }, [])
  const updateSettings = (patch: Partial<Settings>) => persist(current => ({ ...current, settings: { ...current.settings, ...patch } }))

  const record = useCallback((id: DiscoveryId) => {
    if (!savedRef.current.discovered.includes(id)) persist(current => ({ ...current, discovered: [...current.discovered, id] }))
    const d = discoveryOf(id)
    // Announce once per level run, including rediscoveries.
    if (!runFound.current.includes(id)) {
      runFound.current.push(id)
      setNotice(`Discovery ${d.code} · ${d.name}`)
      setAnnouncement(`Discovery ${d.code}: ${d.name}. ${d.text}`)
      sound.current.play('discovery')
    }
  }, [persist])

  const paint = useCallback(() => {
    const canvas = canvasRef.current, root = rootRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !root) return
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const s = settingsRef.current
    draw(ctx, game.current, { tile: tile.current, previews: s.previews, reducedMotion: prefersReducedMotion(s), highContrast: s.highContrast, ghost: ghost.current, memory: memory.current, now: performance.now() }, readPalette(root))
  }, [])

  const layout = useCallback(() => {
    const canvas = canvasRef.current, stage = stageRef.current
    if (!canvas || !stage) return
    const s = game.current
    const viewport = window.visualViewport?.height ?? window.innerHeight
    const reserved = (hudRef.current?.offsetHeight ?? 48) + (controlsRef.current?.offsetHeight ?? 150) + 24
    const byWidth = stage.clientWidth / s.width
    const byHeight = (viewport - reserved) / s.height
    tile.current = Math.max(22, Math.min(64, Math.floor(Math.min(byWidth, byHeight))))
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(s.width * tile.current * dpr)
    canvas.height = Math.round(s.height * tile.current * dpr)
    canvas.style.width = `${s.width * tile.current}px`
    canvas.style.height = `${s.height * tile.current}px`
    paint()
  }, [paint])

  const syncHud = useCallback(() => {
    const next = hudOf(game.current)
    const key = JSON.stringify(next)
    if (key !== hudCache.current) { hudCache.current = key; setHud(next) }
  }, [])

  const begin = useCallback((index: number, keepGhost = false) => {
    sound.current.unlock()
    const previous = game.current
    if (!keepGhost) { ghost.current = null; attempts.current = 1 }
    else { ghost.current = previous.trail.length ? [...previous.trail, [previous.player.x, previous.player.y]] : ghost.current; attempts.current++ }
    runFound.current = keepGhost ? runFound.current : []
    game.current = createGame(levels[index])
    memory.current = createMemory()
    keys.current.clear(); pad.current = { dx: 0, dy: 0 }; padKey.current = { dx: 0, dy: 0 }; action.current = false
    setLevelIndex(index)
    setScreen('playing')
    syncHud()
    const level = levels[index]
    if (!keepGhost) {
      setHint(`${level.code} · ${level.hint}`)
      setAnnouncement(`Level ${level.code}, ${level.title}. ${level.hint} Find the samples, then reach the exit.`)
      sound.current.play('start')
    } else setAnnouncement(`Attempt ${attempts.current}. Your previous route is drawn on the map.`)
    requestAnimationFrame(() => {
      layout()
      // While playing, the arena and controls should fill the screen together.
      rootRef.current?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion(settingsRef.current) ? 'auto' : 'smooth' })
      stageRef.current?.focus({ preventScroll: true })
    })
  }, [layout, syncHud])

  const restart = useCallback(() => begin(levelIndex, true), [begin, levelIndex])

  const handleEvents = useCallback((events: GameEvent[]) => {
    const s = settingsRef.current
    const buzz = (ms: number) => { if (s.haptics) try { navigator.vibrate?.(ms) } catch { /* unsupported */ } }
    for (const event of events) {
      if (event.type === 'sample') { sound.current.play('sample'); setAnnouncement(`Sample collected. ${event.remaining} left.`) }
      if (event.type === 'exit-open') { sound.current.play('exit-open'); setAnnouncement('The exit is open.') }
      if (event.type === 'shift') {
        sound.current.play('shift'); buzz(20)
        noteShift(memory.current, event.x, event.y, performance.now())
        setAnnouncement(event.carried ? `Shifted. ${event.carried === 1 ? 'One thing' : `${event.carried} things`} moved one pocket clockwise.` : 'Shifted. Nothing was inside.')
      }
      if (event.type === 'gate') {
        sound.current.play('gate'); buzz(20)
        const target = reachable(game.current)
        const g = target?.kind === 'gate' ? target.gate : game.current.gates[0]
        noteGateTurn(memory.current, g.x, g.y, event.axis, performance.now())
        setAnnouncement(`Turned. It now opens ${axisWords(event.axis)}.`)
      }
      if (event.type === 'jammed') {
        sound.current.play('jammed'); buzz(40)
        const target = reachable(game.current)
        if (target?.kind === 'gate') memory.current.jam = { x: target.gate.x, y: target.gate.y, until: performance.now() + 450 }
        setAnnouncement('Jammed. Something is inside it.')
      }
      if (event.type === 'discovery') record(event.id)
      if (event.type === 'fail') {
        sound.current.play('fail'); buzz(90)
        setFailCause(event.cause)
        setScreen('failed')
        setAnnouncement(event.cause === 'tracer' ? 'Caught by a tracer.' : 'Caught in an active field.')
      }
      if (event.type === 'won') {
        sound.current.play('won')
        const id = levels[levelIndex].id
        setSummary({ seconds: game.current.time, attempts: attempts.current, shifts: game.current.shifts + game.current.gateTurns, found: [...runFound.current] })
        persist(current => ({ ...current, completed: current.completed.includes(id) ? current.completed : [...current.completed, id] }))
        setScreen('won')
        setAnnouncement(`Level ${levels[levelIndex].code} complete.`)
      }
    }
  }, [levelIndex, persist, record])

  // Fixed-step simulation: movement speed never depends on frame rate.
  useEffect(() => {
    if (screen !== 'playing') { paint(); return }
    let frame = 0, last = performance.now(), accumulator = 0
    const loop = (now: number) => {
      accumulator += Math.min(0.1, (now - last) / 1000) * settingsRef.current.speed
      last = now
      let steps = 0
      while (accumulator >= STEP && steps < 6 && screenRef.current === 'playing') {
        let dx = 0, dy = 0
        for (const code of keys.current) { const m = MOVE[code]; if (m) { dx += m[0]; dy += m[1] } }
        dx += pad.current.dx + padKey.current.dx; dy += pad.current.dy + padKey.current.dy
        step(game.current, { dx: Math.max(-1, Math.min(1, dx)), dy: Math.max(-1, Math.min(1, dy)), action: action.current })
        action.current = false
        accumulator -= STEP
        steps++
        const events = drainEvents(game.current)
        if (events.length) handleEvents(events)
        if (game.current.status !== 'playing') break
      }
      syncHud()
      paint()
      if (game.current.status === 'playing' && screenRef.current === 'playing') frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [screen, paint, handleEvents, syncHud])

  useEffect(() => {
    syncHud()
    layout()
    const onResize = () => layout()
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    let observer: ResizeObserver | null = null
    try { if (stageRef.current && typeof ResizeObserver === 'function') { observer = new ResizeObserver(onResize); observer.observe(stageRef.current) } } catch { observer = null }
    return () => { window.removeEventListener('resize', onResize); window.visualViewport?.removeEventListener('resize', onResize); observer?.disconnect() }
  }, [layout, syncHud])

  useEffect(() => { paint() }, [settings, paint])
  useEffect(() => { if (!hint) return; const timer = window.setTimeout(() => setHint(null), 3200); return () => window.clearTimeout(timer) }, [hint])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 3600); return () => window.clearTimeout(timer) }, [notice])

  // Keyboard: arrows/WASD move; Shift, Space or Enter shifts; Escape pauses; R restarts.
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const current = screenRef.current
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (current === 'playing') {
        if (MOVE[event.code] && !isTextEntry(event.target)) { event.preventDefault(); keys.current.add(event.code); return }
        if (ACTION.has(event.code) && !isControl(event.target)) { event.preventDefault(); if (!event.repeat) action.current = true; return }
        if (event.code === 'Escape' || event.code === 'KeyP') { event.preventDefault(); setScreen('paused'); setAnnouncement('Paused.'); return }
        if (event.code === 'KeyR' && !isTextEntry(event.target)) { event.preventDefault(); restart() }
      } else if (current === 'paused' && event.code === 'Escape') { event.preventDefault(); setScreen('playing'); stageRef.current?.focus({ preventScroll: true }) }
      else if (current === 'failed' && event.code === 'KeyR') { event.preventDefault(); restart() }
    }
    const up = (event: KeyboardEvent) => { keys.current.delete(event.code) }
    const release = () => { keys.current.clear(); pad.current = { dx: 0, dy: 0 }; padKey.current = { dx: 0, dy: 0 } }
    const away = () => { release(); if (screenRef.current === 'playing') { setScreen('paused'); setAnnouncement('Paused while the page was in the background.') } }
    const visibility = () => { if (document.visibilityState === 'hidden') away() }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', away)
    document.addEventListener('visibilitychange', visibility)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', away); document.removeEventListener('visibilitychange', visibility) }
  }, [restart])

  // One pad, eight directions, held while the finger stays down.
  const padMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ox = event.clientX - (rect.left + rect.width / 2), oy = event.clientY - (rect.top + rect.height / 2)
    if (Math.hypot(ox, oy) < rect.width * 0.12) { pad.current = { dx: 0, dy: 0 }; return }
    pad.current = { dx: Math.abs(ox) > Math.abs(oy) * 0.414 ? Math.sign(ox) : 0, dy: Math.abs(oy) > Math.abs(ox) * 0.414 ? Math.sign(oy) : 0 }
  }
  const padDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (screenRef.current !== 'playing') return
    event.preventDefault()
    sound.current.unlock()
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* synthetic pointer */ }
    padMove(event)
  }
  const padEnd = () => { pad.current = { dx: 0, dy: 0 } }
  const padButtonKey = (dx: number, dy: number) => ({
    onKeyDown: (event: ReactKeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); padKey.current = { dx, dy } } },
    onKeyUp: (event: ReactKeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); padKey.current = { dx: 0, dy: 0 } } },
    onBlur: () => { padKey.current = { dx: 0, dy: 0 } },
  })

  const shift = () => {
    sound.current.unlock()
    if (screenRef.current !== 'playing') return
    if (!reachable(game.current)) { setAnnouncement('Nothing within reach shifts.'); return }
    action.current = true
    stageRef.current?.focus({ preventScroll: true })
  }

  const openIndex = (from: Screen) => {
    setReturnTo(from)
    setScreen('index')
    persist(current => ({ ...current, indexOpens: current.indexOpens + 1 }))
    if (savedRef.current.indexOpens === 2) record('ten-types')
  }
  const openSettings = (from: Screen) => { setReturnTo(from); setScreen('settings') }

  const level = levels[levelIndex]
  const open = hud.total > 0 && game.current.status !== 'failed' && hud.taken >= game.current.required
  const stateLabel = `Level ${level.code}, ${level.title}. ${hud.taken} of ${hud.total} samples collected. Exit ${open ? 'open' : 'closed'}.${hud.reach === 'junction' ? ' A junction is within reach.' : hud.reach === 'gate' ? ' Something within reach can turn.' : ''}`
  const nextIncomplete = Math.max(0, levels.findIndex(item => !saved.completed.includes(item.id)))
  const reduced = prefersReducedMotion(settings)
  const ready = hud.reach !== '' && screen === 'playing'

  return (
    <section ref={rootRef} className="ps" aria-labelledby={headingId} data-screen={screen} data-reduced-motion={reduced ? 'true' : 'false'} data-contrast={settings.highContrast ? 'high' : 'standard'}>
      <h2 id={headingId} className="ps-visually-hidden">Edge Case game</h2>
      <div className="ps-hud" ref={hudRef}>
        <p className="ps-level"><span className="ps-level-code">{level.code}</span> {level.title}</p>
        <p className="ps-samples">
          {Array.from({ length: hud.total }, (_, i) => <span key={i} className={i < hud.taken ? 'ps-diamond is-taken' : 'ps-diamond'} aria-hidden="true"/>)}
          <span className="ps-visually-hidden">Samples collected: </span>
          <span>{hud.taken}/{hud.total}</span>
        </p>
        <div className="ps-hud-actions">
          <button type="button" className="ps-icon-button" aria-pressed={settings.sound} onClick={() => { sound.current.unlock(); updateSettings({ sound: !settings.sound }) }}>
            <span aria-hidden="true">{settings.sound ? '♪' : '×'}</span><span className="ps-visually-hidden">Sound</span>
          </button>
          <button type="button" className="ps-icon-button" disabled={screen !== 'playing' && screen !== 'failed' && screen !== 'paused'} onClick={restart}>
            <span aria-hidden="true">↻</span><span className="ps-visually-hidden">Restart level</span>
          </button>
          <button type="button" className="ps-icon-button" disabled={screen !== 'playing'} onClick={() => { setScreen('paused'); setAnnouncement('Paused.') }}>
            <span aria-hidden="true">❙❙</span><span className="ps-visually-hidden">Pause</span>
          </button>
        </div>
      </div>

      <div className="ps-stage" ref={stageRef} tabIndex={-1}>
        <canvas ref={canvasRef} className="ps-canvas" role="img" aria-label={stateLabel}/>
        {hint && screen === 'playing' && !notice && <p className="ps-hint" aria-hidden="true">{hint}</p>}
        {notice && <p className="ps-notice" aria-hidden="true"><span>Discovery</span>{notice.replace(/^Discovery /, '')}</p>}
        {screen === 'title' && (
          <Card title="EDGE CASE" kicker="Producing Curiosity / ARCADE_01" focus>
            <p className="ps-tagline">Every rule has an exception.</p>
            <p>Watch what repeats. Change what you can. There is usually more than one way through.</p>
            <div className="ps-card-actions">
              <button type="button" className="ps-primary" onClick={() => begin(nextIncomplete)}>{saved.completed.length && saved.completed.length < levels.length ? `Continue: ${levels[nextIncomplete].code}` : 'Play'}</button>
              <button type="button" onClick={() => setScreen('levels')}>Choose level</button>
              <button type="button" onClick={() => openIndex('title')}>System index</button>
              <button type="button" onClick={() => openSettings('title')}>Settings</button>
            </div>
            <Legend/>
          </Card>
        )}
        {screen === 'levels' && (
          <Card title="Choose a level" focus>
            <ol className="ps-level-list">
              {levels.map((item, i) => (
                <li key={item.id}><button type="button" onClick={() => begin(i)}><span><span className="ps-level-code">{item.code}</span> {item.title}</span>{saved.completed.includes(item.id) && <span className="ps-done"> ✓ <span className="ps-visually-hidden">completed</span></span>}</button></li>
              ))}
            </ol>
            <div className="ps-card-actions"><button type="button" onClick={() => setScreen('title')}>Back</button></div>
          </Card>
        )}
        {screen === 'index' && (
          <Card title="System index" kicker="EDGE CASE" focus wide>
            <SystemIndex discovered={saved.discovered}/>
            <div className="ps-card-actions"><button type="button" className="ps-primary" onClick={() => setScreen(returnTo)}>Done</button></div>
          </Card>
        )}
        {screen === 'settings' && (
          <Card title="Settings" focus>
            <SettingsForm settings={settings} update={updateSettings}/>
            <div className="ps-card-actions"><button type="button" className="ps-primary" onClick={() => setScreen(returnTo)}>Done</button></div>
          </Card>
        )}
        {screen === 'paused' && (
          <Card title="Paused" focus>
            <div className="ps-card-actions">
              <button type="button" className="ps-primary" onClick={() => { setScreen('playing'); stageRef.current?.focus({ preventScroll: true }) }}>Resume</button>
              <button type="button" onClick={restart}>Restart level</button>
              <button type="button" onClick={() => setScreen('levels')}>Choose level</button>
              <button type="button" onClick={() => openIndex('paused')}>System index</button>
              <button type="button" onClick={() => openSettings('paused')}>Settings</button>
            </div>
          </Card>
        )}
        {screen === 'failed' && (
          <Card title={failCause === 'tracer' ? 'Caught by a tracer' : 'Caught in an active field'} focus compact>
            <p>{failCause === 'tracer' ? 'Tracers repeat their route. The dotted line shows where they go next.' : 'Fields switch on in a steady rhythm. The hatching appears just before.'}</p>
            <div className="ps-card-actions"><button type="button" className="ps-primary" onClick={restart}>Try again <kbd>R</kbd></button></div>
          </Card>
        )}
        {screen === 'won' && (
          <Card title={levelIndex === levels.length - 1 ? 'Chapter complete' : 'Level complete'} kicker={`${level.code} · ${level.title}`} focus>
            <dl className="ps-summary">
              <div><dt>Time</dt><dd>{summary.seconds.toFixed(1)} s</dd></div>
              <div><dt>Attempts</dt><dd>{summary.attempts}</dd></div>
              <div><dt>Shifts</dt><dd>{summary.shifts}</dd></div>
            </dl>
            {summary.found.length > 0 && (
              <ul className="ps-found" aria-label="Discovered this level">
                {summary.found.map(id => { const d = discoveryOf(id); return <li key={id}><span className="ps-code">{d.code}</span> {d.name}</li> })}
              </ul>
            )}
            {levelIndex === levels.length - 1 && <p>That is all of chapter 000–010 for now.</p>}
            <div className="ps-card-actions">
              {levelIndex < levels.length - 1 && <button type="button" className="ps-primary" onClick={() => begin(levelIndex + 1)}>Next level</button>}
              <button type="button" className={levelIndex === levels.length - 1 ? 'ps-primary' : undefined} onClick={() => begin(levelIndex)}>Replay</button>
              <button type="button" onClick={() => openIndex('won')}>System index</button>
            </div>
          </Card>
        )}
      </div>

      <div className="ps-controls" ref={controlsRef}>
        <div className="ps-pad" role="group" aria-label="Movement pad" onPointerDown={padDown} onPointerMove={event => { if (event.buttons || event.pointerType === 'touch') padMove(event) }} onPointerUp={padEnd} onPointerCancel={padEnd} onLostPointerCapture={padEnd}>
          <button type="button" className="ps-pad-up" aria-label="Move up" disabled={screen !== 'playing'} {...padButtonKey(0, -1)}><span aria-hidden="true">▲</span></button>
          <button type="button" className="ps-pad-left" aria-label="Move left" disabled={screen !== 'playing'} {...padButtonKey(-1, 0)}><span aria-hidden="true">◀</span></button>
          <button type="button" className="ps-pad-right" aria-label="Move right" disabled={screen !== 'playing'} {...padButtonKey(1, 0)}><span aria-hidden="true">▶</span></button>
          <button type="button" className="ps-pad-down" aria-label="Move down" disabled={screen !== 'playing'} {...padButtonKey(0, 1)}><span aria-hidden="true">▼</span></button>
        </div>
        <button type="button" className="ps-action" aria-disabled={!ready} data-ready={ready ? 'true' : 'false'} onClick={shift}>
          <span className="ps-action-icon" aria-hidden="true">⇧</span>
          <span>Shift</span>
        </button>
      </div>
      <p className="ps-visually-hidden" aria-live="polite" role="status">{announcement}</p>
    </section>
  )
}

function Card({ title, kicker, children, focus, compact, wide }: { title: string; kicker?: string; children: ReactNode; focus?: boolean; compact?: boolean; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  useEffect(() => {
    if (!focus) return
    ref.current?.querySelector<HTMLElement>('.ps-primary, button, input, select')?.focus({ preventScroll: true })
  }, [focus, title])
  return (
    <div ref={ref} className={['ps-card', compact && 'ps-card--compact', wide && 'ps-card--wide'].filter(Boolean).join(' ')} role="dialog" aria-modal="false" aria-labelledby={id}>
      {kicker && <p className="ps-kicker">{kicker}</p>}
      <h3 id={id}>{title}</h3>
      {children}
    </div>
  )
}

function SystemIndex({ discovered }: { discovered: string[] }) {
  const [showUnavailable, setShowUnavailable] = useState(true)
  const known = operations.filter(op => !op.discovery || discovered.includes(op.discovery))
  const count = discoveries.filter(d => discovered.includes(d.id)).length
  return (
    <div className="ps-index">
      <section aria-labelledby="ec-ops">
        <div className="ps-index-head">
          <h4 id="ec-ops">Known operations<span className="ps-cursor" aria-hidden="true">_</span></h4>
          <p className="ps-register"><span aria-hidden="true">{String(known.length).padStart(2, '0')} / {String(operations.length).padStart(2, '0')}</span><span className="ps-visually-hidden">{known.length} of {operations.length} known</span></p>
        </div>
        <label className="ps-check"><input type="checkbox" checked={showUnavailable} onChange={e => setShowUnavailable(e.target.checked)}/> Show unavailable operations</label>
        <ul className="ps-ops">
          {operations.map(op => {
            const isKnown = known.includes(op)
            if (!isKnown && !showUnavailable) return null
            return (
              <li key={op.id} className={isKnown ? 'is-known' : 'is-unknown'}>
                <span className="ps-op-symbol" aria-hidden="true">{isKnown ? op.symbol : '?'}</span>
                <span className="ps-op-body">
                  <strong>{isKnown ? op.name : <><span aria-hidden="true">???</span><span className="ps-visually-hidden">Undiscovered operation</span></>}</strong>
                  <span>{isKnown ? op.text : op.clue ?? 'Unknown operation.'}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <p className="ps-small">Some operations may be discovered through unintended interactions. All of them follow the rules.</p>
      </section>
      <section aria-labelledby="ec-disc">
        <div className="ps-index-head">
          <h4 id="ec-disc">Discoveries</h4>
          <p className="ps-register"><span aria-hidden="true">{binary(count)} / {binary(discoveries.length)}</span><span className="ps-visually-hidden">{count} of {discoveries.length} discovered</span></p>
        </div>
        <p className="ps-small" aria-hidden="true">{count} of {discoveries.length}. Yes, the counter is in binary.</p>
        <ol className="ps-discoveries">
          {discoveries.map(d => {
            const found = discovered.includes(d.id)
            return (
              <li key={d.id} className={found ? 'is-known' : 'is-unknown'}>
                <span className="ps-code">{d.code}</span>
                <span className="ps-op-body">
                  <strong>{found ? d.name : <><span aria-hidden="true">???</span><span className="ps-visually-hidden">Undiscovered</span></>}</strong>
                  <span>{found ? d.text : d.clue ?? 'No record.'}</span>
                </span>
              </li>
            )
          })}
        </ol>
        <p className="ps-unknown-entry"><span className="ps-code">0x??</span> <strong>UNKNOWN</strong> <span>Not counted. This list may not describe everything.</span></p>
      </section>
    </div>
  )
}

function Legend() {
  return (
    <ul className="ps-legend" aria-label="What you will see">
      <li><span className="ps-key ps-key--player" aria-hidden="true"/>You</li>
      <li><span className="ps-key ps-key--tracer" aria-hidden="true"/>Tracer: repeats a route</li>
      <li><span className="ps-key ps-key--junction" aria-hidden="true"/>Junction: shift it to turn its pockets</li>
      <li><span className="ps-key ps-key--sample" aria-hidden="true"/>Sample</li>
      <li><span className="ps-key ps-key--field" aria-hidden="true"/>Field: switches on and off</li>
      <li><span className="ps-key ps-key--exit" aria-hidden="true"/>Exit: closes the circle when open</li>
    </ul>
  )
}

function SettingsForm({ settings, update }: { settings: Settings; update: (patch: Partial<Settings>) => void }) {
  const id = useId()
  const vibration = typeof navigator !== 'undefined' && 'vibrate' in navigator
  return (
    <div className="ps-settings">
      <label className="ps-check"><input type="checkbox" checked={settings.sound} onChange={e => update({ sound: e.target.checked })}/> Sound</label>
      <label className="ps-field" htmlFor={`${id}-volume`}>Volume <input id={`${id}-volume`} type="range" min={0} max={1} step={0.1} value={settings.volume} disabled={!settings.sound} onChange={e => update({ volume: Number(e.target.value) })}/></label>
      <fieldset className="ps-field">
        <legend>Motion</legend>
        {(['system', 'reduce', 'full'] as const).map(value => (
          <label key={value} className="ps-check"><input type="radio" name={`${id}-motion`} checked={settings.motion === value} onChange={() => update({ motion: value })}/> {value === 'system' ? 'Match my device' : value === 'reduce' ? 'Reduced' : 'Full'}</label>
        ))}
      </fieldset>
      <label className="ps-field" htmlFor={`${id}-speed`}>Game speed
        <select id={`${id}-speed`} value={settings.speed} onChange={e => update({ speed: Number(e.target.value) as Settings['speed'] })}>
          <option value={1}>100%</option><option value={0.75}>75%</option><option value={0.5}>50%</option>
        </select>
      </label>
      <label className="ps-check"><input type="checkbox" checked={settings.previews} onChange={e => update({ previews: e.target.checked })}/> Show where tracers go next</label>
      <label className="ps-check"><input type="checkbox" checked={settings.highContrast} onChange={e => update({ highContrast: e.target.checked })}/> Bolder lines</label>
      {vibration && <label className="ps-check"><input type="checkbox" checked={settings.haptics} onChange={e => update({ haptics: e.target.checked })}/> Vibration</label>}
    </div>
  )
}
