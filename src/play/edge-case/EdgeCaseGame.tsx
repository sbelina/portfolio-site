import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { collected, createGame, drainEvents, exitOpen, fieldPhase, pockets, reachable, step, STEP, tracerCycle, tracerPosition, type DiscoveryId, type GameEvent, type GameState } from './engine'
import { levels } from './levels'
import { createMemory, draw, noteGateTurn, noteShift, readPalette, type Inspect, type View } from './render'
import { load, prefersReducedMotion, save, type Saved, type Settings } from './settings'
import { binary, discoveries, operations } from './system-index'
import { Sound } from './audio'
import { followBase, stickInput } from './stick'
import { appendLog, loadLog, methodOf, rankOf, saveSnapshot, snapshot, standing, thumbnail, type RunRecord } from './records'

/**
 * Screens. `menu` is the nested menu (MECHANICS.md §13), reached from the title and
 * from Pause; the other screens are play and the end-of-attempt cards.
 */
type Screen = 'menu' | 'playing' | 'failed' | 'won' | 'snapshot'
type MenuPage = 'root' | 'levels' | 'index' | 'log' | 'settings' | 'controls' | 'sound' | 'display' | 'gameplay' | 'how'
interface Hud { taken: number; total: number; reach: '' | 'junction' | 'gate'; tile: string }
interface Summary { seconds: number; attempts: number; shifts: number; found: DiscoveryId[]; complete: boolean; taken: number; required: number }

const PAGE_TITLES: Record<MenuPage, string> = {
  root: 'Menu', levels: 'Levels', index: 'System index', log: 'Field log', settings: 'Settings',
  controls: 'Controls', sound: 'Sound', display: 'Display', gameplay: 'Gameplay', how: 'How to play',
}
const MOVE: Record<string, [number, number]> = {
  ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0],
}
const isTextEntry = (target: EventTarget | null) => target instanceof HTMLElement && !!target.closest('input, select, textarea')
const isControl = (target: EventTarget | null) => target instanceof HTMLElement && !!target.closest('button, a, input, select, textarea, summary')
const axisWords = (axis: string) => axis === 'ns' ? 'north–south' : 'east–west'
const discoveryOf = (id: string) => discoveries.find(d => d.id === id)!

function hudOf(s: GameState): Hud {
  const target = reachable(s)
  return { taken: collected(s), total: s.samples.length, reach: target ? target.kind : '', tile: `${s.tile.x},${s.tile.y}` }
}

/** Fullscreen is optional everywhere: iPhone Safari offers none for pages, others may refuse. */
function requestFullscreen() {
  const root = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }
  try {
    if (root.requestFullscreen) void root.requestFullscreen({ navigationUI: 'hide' }).catch(() => {})
    else root.webkitRequestFullscreen?.()
  } catch { /* refused: the window-filling layout still applies */ }
}
/**
 * Some browsers deliver the Escape that leaves full screen to the page as well; others
 * swallow it. Record whether the page handled an Escape while still in full screen.
 */
let escapeSeenInFullscreen = false
const noteEscape = () => { if (inFullscreen()) escapeSeenInFullscreen = true }
const inFullscreen = () => !!(document.fullscreenElement ?? (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement)
function exitFullscreen() {
  const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void }
  try {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else if (doc.webkitFullscreenElement) doc.webkitExitFullscreen?.()
  } catch { /* already out */ }
}

export function EdgeCaseGame() {
  const headingId = useId()
  const [saved, setSaved] = useState<Saved>(() => load())
  const [entered, setEntered] = useState(false)
  const [screen, setScreen] = useState<Screen>('menu')
  const [menuPath, setMenuPath] = useState<MenuPage[]>(['root'])
  const [levelIndex, setLevelIndex] = useState(0)
  const [hud, setHud] = useState<Hud>({ taken: 0, total: 0, reach: '', tile: '' })
  const [announcement, setAnnouncement] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [summary, setSummary] = useState<Summary>({ seconds: 0, attempts: 1, shifts: 0, found: [], complete: true, taken: 0, required: 0 })
  const [failCause, setFailCause] = useState<'tracer' | 'field'>('tracer')
  const [log, setLog] = useState<RunRecord[]>(() => loadLog())
  const [lastRecord, setLastRecord] = useState<RunRecord | null>(null)
  const [hintLevel, setHintLevel] = useState(0)
  const [tipVisible, setTipVisible] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null)
  const snapshotCanvas = useRef<HTMLCanvasElement | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const enterRef = useRef<HTMLButtonElement>(null)
  const game = useRef<GameState>(createGame(levels[0]))
  const started = useRef(false)
  const memory = useRef<View['memory']>(createMemory())
  const ghost = useRef<[number, number][] | null>(null)
  const attempts = useRef(1)
  const runFound = useRef<DiscoveryId[]>([])
  const tile = useRef(36)
  // Reveal (pinch or hold Space) and Inspect (tap) are views of the system, never actions in it (§12b).
  const revealRef = useRef(false)
  const [revealing, setRevealing] = useState(false)
  const inspectRef = useRef<{ target: Inspect; text: string } | null>(null)
  const [inspected, setInspected] = useState<string | null>(null)
  const keys = useRef(new Set<string>())
  const pad = useRef({ dx: 0, dy: 0 })
  const padKey = useRef({ dx: 0, dy: 0 })
  const sound = useRef(new Sound())
  const settingsRef = useRef(saved.settings)
  const screenRef = useRef(screen)
  const enteredRef = useRef(entered)
  const pushedHistory = useRef(false)
  const hudCache = useRef('')
  const hintRef = useRef(0)
  const hintsRequested = useRef(0)
  const logRef = useRef(log)
  const settings = saved.settings
  settingsRef.current = settings
  screenRef.current = screen
  enteredRef.current = entered
  sound.current.enabled = settings.sound
  sound.current.volume = settings.volume

  const savedRef = useRef(saved)
  // Persist synchronously so discovery checks always read the latest record.
  const persist = useCallback((update: (current: Saved) => Saved) => { const next = update(savedRef.current); savedRef.current = next; setSaved(next); save(next) }, [])
  const updateSettings = (patch: Partial<Settings>) => persist(current => ({ ...current, settings: { ...current.settings, ...patch } }))

  /** A level is in progress (so the menu root is Pause, and Enter offers Continue). */
  const inProgress = () => started.current && game.current.status === 'playing'

  const record = useCallback((id: DiscoveryId) => {
    if (!savedRef.current.discovered.includes(id)) persist(current => ({ ...current, discovered: [...current.discovered, id] }))
    const d = discoveryOf(id)
    // Announce once per level run, including rediscoveries.
    if (!runFound.current.includes(id)) {
      runFound.current.push(id)
      setNotice(`${d.code} · ${d.name}`)
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
    draw(ctx, game.current, { tile: tile.current, previews: s.alwaysPaths || revealRef.current, reveal: revealRef.current, inspect: inspectRef.current?.target ?? null, reducedMotion: prefersReducedMotion(s), highContrast: s.highContrast, ghost: ghost.current, memory: memory.current, now: performance.now() }, readPalette(root))
  }, [])

  /** The arena takes the largest whole-pixel tile that fits the stage layer (§13, M5). */
  const layout = useCallback(() => {
    const canvas = canvasRef.current, stage = stageRef.current
    if (!canvas || !stage) return
    const s = game.current
    const byWidth = (stage.clientWidth - 8) / s.width
    const byHeight = (stage.clientHeight - 8) / s.height
    tile.current = Math.max(18, Math.min(72, Math.floor(Math.min(byWidth, byHeight))))
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(s.width * tile.current * dpr)
    canvas.height = Math.round(s.height * tile.current * dpr)
    canvas.style.width = `${s.width * tile.current}px`
    canvas.style.height = `${s.height * tile.current}px`
    paint()
  }, [paint])

  const syncHud = useCallback(() => {
    // Written directly each frame (not through React state) so it never lags the simulation.
    rootRef.current?.setAttribute('data-player-tile', `${game.current.tile.x},${game.current.tile.y}`)
    rootRef.current?.setAttribute('data-tracer-tiles', game.current.tracers.map(t => { const at = tracerPosition(t); return `${Math.floor(at.x)},${Math.floor(at.y)}` }).join(' '))
    const next = hudOf(game.current)
    const key = JSON.stringify(next)
    if (key !== hudCache.current) { hudCache.current = key; setHud(next) }
  }, [])

  const openMenu = useCallback((path: MenuPage[] = ['root']) => { setMenuPath(path); setScreen('menu') }, [])

  const begin = useCallback((index: number, keepGhost = false) => {
    sound.current.unlock()
    const previous = game.current
    if (!keepGhost) { ghost.current = null; attempts.current = 1 }
    else { ghost.current = previous.trail.length ? [...previous.trail, [previous.player.x, previous.player.y]] : ghost.current; attempts.current++ }
    runFound.current = keepGhost ? runFound.current : []
    if (!keepGhost) { hintRef.current = 0; hintsRequested.current = 0; setHintLevel(0) }
    setTipVisible(hintRef.current > 0)
    setSaveStatus('')
    game.current = createGame(levels[index])
    started.current = true
    memory.current = createMemory()
    keys.current.clear(); pad.current = { dx: 0, dy: 0 }; padKey.current = { dx: 0, dy: 0 }
    setLevelIndex(index)
    setScreen('playing')
    syncHud()
    const level = levels[index]
    if (!keepGhost) {
      setHint(`${level.code} · ${level.hint}`)
      setAnnouncement(`Level ${level.code}, ${level.title}. ${level.hint} Find the samples, then reach the exit.`)
      sound.current.play('start')
    } else setAnnouncement(`Attempt ${attempts.current}. Your previous route is drawn on the map.`)
    requestAnimationFrame(() => { layout(); stageRef.current?.focus({ preventScroll: true }) })
  }, [layout, syncHud])

  const restart = useCallback(() => begin(levelIndex, true), [begin, levelIndex])
  const resume = useCallback(() => { setScreen('playing'); requestAnimationFrame(() => stageRef.current?.focus({ preventScroll: true })) }, [])
  const pause = useCallback((message = 'Paused.') => { openMenu(['root']); setAnnouncement(message) }, [openMenu])

  /** Enter (§13, M1): fill the window, ask for true full screen, and make Back leave the game. */
  const enter = () => {
    sound.current.unlock()
    requestFullscreen()
    try { history.pushState({ ...(history.state ?? {}), edgeCase: true }, ''); pushedHistory.current = true } catch { pushedHistory.current = false }
    setMenuPath(['root'])
    setScreen(screenRef.current === 'playing' ? 'menu' : screenRef.current)
    setEntered(true)
  }
  /** Exit (§13, M2): back to the page; a level in progress stays paused for Continue. */
  const leave = useCallback((fromHistory = false) => {
    if (!enteredRef.current) return
    keys.current.clear(); pad.current = { dx: 0, dy: 0 }; padKey.current = { dx: 0, dy: 0 }
    if (screenRef.current === 'playing') setScreen('menu')
    setMenuPath(['root'])
    if (inFullscreen()) { leavingOnPurpose.current = true; exitFullscreen() }
    setEntered(false)
    if (!fromHistory && pushedHistory.current) { pushedHistory.current = false; try { history.back() } catch { /* ignore */ } }
    else pushedHistory.current = false
    requestAnimationFrame(() => enterRef.current?.focus({ preventScroll: true }))
  }, [])

  /**
   * In true full screen the browser keeps Escape for itself: the keypress leaves full
   * screen and never reaches the page. Leaving full screen while entered is therefore
   * treated as that Escape (§13, M2): during play it opens the menu; in a submenu it
   * goes back one level. Our own exit (leave) is ignored.
   */
  const leavingOnPurpose = useRef(false)
  const escapeRef = useRef<() => void>(() => {})
  useEffect(() => {
    // WebKit fires the standard and the prefixed event (and, after a reload in full screen,
    // may never report entering again). Treat each exit once: ignore repeats within 100 ms.
    let lastExit = -Infinity
    const onChange = () => {
      if (inFullscreen()) { escapeSeenInFullscreen = false; return }
      const now = performance.now()
      if (now - lastExit < 100) return
      lastExit = now
      if (!enteredRef.current) return
      if (leavingOnPurpose.current) { leavingOnPurpose.current = false; return }
      // The page already acted on this Escape (the browser delivered it too): do not act twice.
      if (escapeSeenInFullscreen) { escapeSeenInFullscreen = false; return }
      escapeRef.current()
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => { document.removeEventListener('fullscreenchange', onChange); document.removeEventListener('webkitfullscreenchange', onChange) }
  }, [])

  useEffect(() => {
    const onPop = () => { if (enteredRef.current) leave(true) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [leave])

  // Theme (M6): the browser's own toolbar takes the game's surface while entered.
  useEffect(() => {
    if (!entered) return
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previous = meta?.content
    const surface = rootRef.current ? getComputedStyle(rootRef.current).getPropertyValue('--paper').trim() : ''
    if (meta && surface) meta.content = surface
    return () => { if (meta && previous !== undefined) meta.content = previous }
  }, [entered, settings.theme])

  // While entered: the page behind is inert and does not scroll.
  useEffect(() => {
    const page = document.getElementById('root')
    if (!entered) return
    document.documentElement.classList.add('ec-open')
    page?.setAttribute('inert', '')
    requestAnimationFrame(() => layout())
    return () => { document.documentElement.classList.remove('ec-open'); page?.removeAttribute('inert') }
  }, [entered, layout])

  /** L1: every ended attempt becomes a run record with a thumbnail snapshot. */
  const recordRun = useCallback((outcome: 'won' | 'partial' | 'failed', cause?: 'tracer' | 'field') => {
    const s = game.current, level = levels[levelIndex], root = rootRef.current
    const found = [...s.discovered]
    const record: RunRecord = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      level: level.id, code: level.code, title: level.title, outcome, cause,
      seconds: Math.round(s.time * 10) / 10, shifts: s.shifts, gateTurns: s.gateTurns, attempt: attempts.current,
      hints: hintRef.current, discoveries: found, method: outcome === 'won' ? methodOf(found) : '', at: new Date().toISOString(),
      thumb: root ? thumbnail(s, readPalette(root)) : '',
    }
    logRef.current = appendLog(logRef.current, record)
    setLog(logRef.current)
    setLastRecord(record)
  }, [levelIndex])

  const handleEvents = useCallback((events: GameEvent[]) => {
    const s = settingsRef.current
    const buzz = (ms: number) => { if (s.haptics) try { navigator.vibrate?.(ms) } catch { /* unsupported */ } }
    for (const event of events) {
      if (event.type === 'sample') { sound.current.play('sample'); setAnnouncement(`Sample collected. ${event.remaining} left.`) }
      if (event.type === 'exit-open') { sound.current.play('exit-open'); setAnnouncement('Complete is available: the exit’s circle has closed.') }
      if (event.type === 'shift') {
        sound.current.play('shift'); buzz(20)
        noteShift(memory.current, event.x, event.y, performance.now(), event.dir)
        const way = event.dir === 'cw' ? 'clockwise' : 'counter-clockwise'
        setAnnouncement(event.carried ? `The junction turned ${way}. ${event.carried === 1 ? 'One thing' : `${event.carried} things`} moved with it.` : `The junction turned ${way}. Nothing was inside.`)
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
        recordRun('failed', event.cause)
        setScreen('failed')
        setAnnouncement(event.cause === 'tracer' ? 'Caught by a tracer.' : 'Caught in an active field.')
      }
      if (event.type === 'won') {
        sound.current.play('won')
        const id = levels[levelIndex].id
        const complete = game.current.outcome === 'complete'
        setSummary({ seconds: game.current.time, attempts: attempts.current, shifts: game.current.shifts + game.current.gateTurns, found: [...runFound.current], complete, taken: collected(game.current), required: game.current.required })
        // S4: only a complete exit marks the level complete; a partial one is logged as such.
        if (complete) persist(current => ({ ...current, completed: current.completed.includes(id) ? current.completed : [...current.completed, id] }))
        recordRun(complete ? 'won' : 'partial')
        setScreen('won')
        setAnnouncement(complete ? `Level ${levels[levelIndex].code} complete.` : `Left level ${levels[levelIndex].code} early: ${collected(game.current)} of ${game.current.required} samples. Logged as partial.`)
      }
    }
  }, [levelIndex, persist, record, recordRun])

  /** N1–N3: stuck hints escalate by playing time until the level's progress condition is met. */
  const progressed = (s: GameState) => {
    const rule = levels[levelIndex].hints?.progress
    return rule === 'shift' ? s.shifts > 0 : rule === 'sample' ? collected(s) > 0 : rule === 'exit-open' ? exitOpen(s) : true
  }
  const showHint = (level: number) => {
    const steps = levels[levelIndex].hints?.steps ?? []
    hintRef.current = Math.min(level, steps.length)
    setHintLevel(hintRef.current)
    setTipVisible(true)
    setAnnouncement(`Hint: ${steps[hintRef.current - 1].text}`)
  }
  const progressHints = useCallback(() => {
    const steps = levels[levelIndex].hints?.steps ?? []
    if (progressed(game.current)) { setTipVisible(false); return }
    if (!settingsRef.current.autoHints) return
    const due = steps.filter(item => item.after <= game.current.time).length
    if (due > hintRef.current) showHint(due)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex])
  const requestHint = () => {
    const steps = levels[levelIndex].hints?.steps ?? []
    if (hintRef.current >= steps.length) { setAnnouncement('No more hints for this level.'); return }
    hintsRequested.current++
    showHint(hintRef.current + 1)
  }

  // Fixed-step simulation: movement speed never depends on frame rate.
  useEffect(() => {
    if (!entered || screen !== 'playing') { if (entered) paint(); return }
    let frame = 0, last = performance.now(), accumulator = 0
    const loop = (now: number) => {
      accumulator += Math.min(0.1, (now - last) / 1000) * settingsRef.current.speed
      last = now
      let steps = 0
      while (accumulator >= STEP && steps < 6 && screenRef.current === 'playing') {
        let dx = 0, dy = 0
        for (const code of keys.current) { const m = MOVE[code]; if (m) { dx += m[0]; dy += m[1] } }
        dx += pad.current.dx + padKey.current.dx; dy += pad.current.dy + padKey.current.dy
        step(game.current, { dx: Math.max(-1, Math.min(1, dx)), dy: Math.max(-1, Math.min(1, dy)) })
        accumulator -= STEP
        steps++
        const events = drainEvents(game.current)
        if (events.length) handleEvents(events)
        if (game.current.status !== 'playing') break
      }
      syncHud()
      progressHints()
      paint()
      if (game.current.status === 'playing' && screenRef.current === 'playing') frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [entered, screen, paint, handleEvents, syncHud, progressHints])

  useEffect(() => {
    if (!entered) return
    syncHud()
    layout()
    const onResize = () => layout()
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    let observer: ResizeObserver | null = null
    try { if (stageRef.current && typeof ResizeObserver === 'function') { observer = new ResizeObserver(onResize); observer.observe(stageRef.current) } } catch { observer = null }
    return () => { window.removeEventListener('resize', onResize); window.visualViewport?.removeEventListener('resize', onResize); observer?.disconnect() }
  }, [entered, layout, syncHud])

  useEffect(() => { paint() }, [settings, paint])
  useEffect(() => { if (!hint) return; const timer = window.setTimeout(() => setHint(null), 3200); return () => window.clearTimeout(timer) }, [hint])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 3600); return () => window.clearTimeout(timer) }, [notice])

  // Keyboard in play: arrows/WASD move (and push); Escape or P opens the menu; R restarts.
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (!enteredRef.current || event.metaKey || event.ctrlKey || event.altKey) return
      const current = screenRef.current
      if (current === 'playing') {
        if (MOVE[event.code] && !isTextEntry(event.target)) { event.preventDefault(); keys.current.add(event.code); return }
        if (event.code === 'Space' && !isControl(event.target)) { event.preventDefault(); if (!event.repeat) setReveal(true); return }
        if (event.code === 'Escape' || event.code === 'KeyP') { event.preventDefault(); if (event.code === 'Escape') noteEscape(); pause(); return }
        if (event.code === 'KeyR' && !isTextEntry(event.target)) { event.preventDefault(); restart() }
      } else if (current === 'failed' && event.code === 'KeyR') { event.preventDefault(); restart() }
    }
    const up = (event: KeyboardEvent) => { keys.current.delete(event.code); if (event.code === 'Space') setReveal(false) }
    const release = () => { keys.current.clear(); pad.current = { dx: 0, dy: 0 }; padKey.current = { dx: 0, dy: 0 }; setReveal(false) }
    const away = () => { release(); if (screenRef.current === 'playing') pause('Paused while the page was in the background.') }
    const visibility = () => { if (document.visibilityState === 'hidden') away() }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', away)
    document.addEventListener('visibilitychange', visibility)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', away); document.removeEventListener('visibilitychange', visibility) }
  }, [restart, pause])

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

  /** Reveal (§12b): held by a pinch or by Space; time keeps running. */
  const setReveal = useCallback((on: boolean) => {
    if (revealRef.current === on) return
    revealRef.current = on
    setRevealing(on)
    if (on) setAnnouncement('Revealing the system: routes, turns and timing.')
    paint()
  }, [paint])

  /** Inspect (§12b): a tap or click describes the thing under it, for a few seconds. */
  const inspectAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const s = game.current
    const x = (clientX - rect.left) / tile.current, y = (clientY - rect.top) / tile.current
    const near = (px: number, py: number, reach: number) => Math.hypot(px - x, py - y) <= reach
    const tx = Math.floor(x), ty = Math.floor(y)
    let found: { target: Inspect; text: string } | null = null
    const tracer = s.tracers.findIndex(t => { const at = tracerPosition(t); return near(at.x, at.y, 0.7) })
    if (tracer >= 0) {
      const t = s.tracers[tracer], steps = Math.max(1, tracerCycle(s, t).length - 1)
      found = { target: { kind: 'tracer', index: tracer }, text: t.next ? `Tracer: repeats a ${steps}-step route about every ${(steps / t.speed).toFixed(1)} s.` : 'Tracer: stopped, with no track to follow. Still dangerous.' }
    } else if (near(s.player.x, s.player.y, 0.5)) found = { target: { kind: 'player' }, text: 'You.' }
    else {
      // Most specific first: things on a tile outrank the junction pocket they may sit in (V3).
      const junction = s.junctions.findIndex(j => near(j.x, j.y, 0.6) || pockets(j).some(p => p.x === tx && p.y === ty))
      const gate = s.gates.findIndex(g => g.x === tx && g.y === ty)
      const sample = s.samples.findIndex(sm => !sm.taken && sm.x === tx && sm.y === ty)
      if (tx === s.exit.x && ty === s.exit.y) found = { target: { kind: 'exit' }, text: `Exit: leave any time. Complete needs ${s.required} of ${s.samples.length} samples; you have ${collected(s)}.` }
      else if (sample >= 0) found = { target: { kind: 'sample', index: sample }, text: `Sample: ${collected(s)} of ${s.samples.length} collected.` }
      else if (gate >= 0) found = { target: { kind: 'gate', index: gate }, text: `Gate: lets movement through ${s.gates[gate].axis === 'ns' ? 'north–south' : 'east–west'}. It carries nothing.` }
      else if (junction >= 0) found = { target: { kind: 'junction', index: junction }, text: 'Junction: push one of its arms to turn it, either way. It carries whatever is in its pockets.' }
      else if (s.tiles[ty]?.[tx] === 'field' && s.level.field) { const f = s.level.field, ph = fieldPhase(s); found = { target: { kind: 'field', x: tx, y: ty }, text: `Field: on for ${f.on} s in every ${f.period} s. ${ph.active ? 'Off' : 'On'} in ${ph.untilChange.toFixed(1)} s.` } }
    }
    inspectRef.current = found
    setInspected(found?.text ?? null)
    if (found) setAnnouncement(found.text)
    paint()
  }
  useEffect(() => {
    if (!inspected) return
    const timer = window.setTimeout(() => { inspectRef.current = null; setInspected(null); paint() }, 4500)
    return () => window.clearTimeout(timer)
  }, [inspected, paint])
  // Reveal and Inspect end when play stops.
  useEffect(() => { if (screen !== 'playing') { setReveal(false); inspectRef.current = null; setInspected(null) } }, [screen, setReveal])
  // Inside the game, two-finger gestures belong to Reveal, never to page zoom (iOS).
  useEffect(() => {
    if (!entered) return
    const stop = (event: Event) => event.preventDefault()
    document.addEventListener('gesturestart', stop, { passive: false } as AddEventListenerOptions)
    document.addEventListener('gesturechange', stop, { passive: false } as AddEventListenerOptions)
    return () => { document.removeEventListener('gesturestart', stop); document.removeEventListener('gesturechange', stop) }
  }, [entered])

  /** Menu navigation (§13, M3): open a submenu, or go back one level. */
  const openPage = (page: MenuPage) => {
    if (page === 'index') {
      persist(current => ({ ...current, indexOpens: current.indexOpens + 1 }))
      if (savedRef.current.indexOpens === 2) record('ten-types')
    }
    setMenuPath(path => [...path, page])
    setScreen('menu')
  }
  const back = () => {
    if (menuPath.length > 1) { setMenuPath(path => path.slice(0, -1)); return }
    if (inProgress()) resume()
    else leave()
  }
  // What a swallowed Escape (leaving true full screen) means right now.
  escapeRef.current = () => {
    if (screenRef.current === 'playing') pause()
    else if (screenRef.current === 'menu') back()
  }
  /** L2: show the full field record; saving is attempted only from there (§12). */
  const openSnapshot = () => {
    const root = rootRef.current
    if (!root || !lastRecord) return
    const canvas = snapshot(game.current, lastRecord, readPalette(root))
    snapshotCanvas.current = canvas
    setSnapshotUrl(canvas.toDataURL('image/png'))
    setSaveStatus('')
    setScreen('snapshot')
  }
  const saveRecord = async () => {
    if (!snapshotCanvas.current || !lastRecord) return
    setSaveStatus('Preparing…')
    const result = await saveSnapshot(snapshotCanvas.current, `edge-case-${lastRecord.code}-${lastRecord.outcome}-${lastRecord.at.slice(0, 19).replace(/[:T]/g, '-')}.png`)
    const message = result === 'shared' ? 'Snapshot shared.' : result === 'downloaded' ? 'Snapshot saved.' : result === 'cancelled' ? 'Not saved.' : 'Could not save the snapshot.'
    setSaveStatus(message)
    setAnnouncement(message)
  }
  const hintText = (levels[levelIndex].hints?.steps ?? [])[hintLevel - 1]?.text
  const hintsLeft = (levels[levelIndex].hints?.steps.length ?? 0) - hintLevel

  const level = levels[levelIndex]
  const open = hud.total > 0 && game.current.status !== 'failed' && hud.taken >= game.current.required
  const stateLabel = `Level ${level.code}, ${level.title}. ${hud.taken} of ${hud.total} samples collected. Exit ${open ? 'open' : 'closed'}.${hud.reach === 'junction' ? ' A junction is within reach.' : hud.reach === 'gate' ? ' Something within reach can turn.' : ''}`
  const nextIncomplete = Math.max(0, levels.findIndex(item => !saved.completed.includes(item.id)))
  const reduced = prefersReducedMotion(settings)
  const paused = inProgress()
  const page = menuPath[menuPath.length - 1]
  const trail = [paused ? 'Paused' : 'Edge Case', ...menuPath.slice(1).map(p => PAGE_TITLES[p])]
  const count = discoveries.filter(d => saved.discovered.includes(d.id)).length
  // The message rail (§13, M5): one line at a time, never over the arena.
  const rail = notice ? { kind: 'Discovery', text: notice } : inspected && screen === 'playing' ? { kind: 'Inspect', text: inspected } : revealing && screen === 'playing' ? { kind: 'Reveal', text: `Routes, turns and timing. Complete: ${hud.taken} of ${game.current.required} samples.` } : tipVisible && hintText && screen === 'playing' ? { kind: `Hint ${hintLevel}`, text: hintText } : hint && screen === 'playing' ? { kind: level.code, text: level.hint } : null

  const entrance = (
    <div className="ec-entrance">
      <button ref={enterRef} type="button" className="ec-enter" onClick={enter} aria-describedby={`${headingId}-enter`}>
        <span className="ec-enter-label">{paused ? 'Continue' : 'Enter'}</span>
        <span className="ec-enter-detail">{paused ? `${level.code} ${level.title}, paused` : 'Edge Case · Arcade_01'}</span>
      </button>
      <p id={`${headingId}-enter`} className="ps-small">Opens full screen. Press Escape or choose Exit to return to this page.</p>
      <p className="ps-small ec-entrance-register"><span aria-hidden="true">Discoveries {binary(count)} / {binary(discoveries.length)}</span><span className="ps-visually-hidden">{count} of {discoveries.length} discoveries</span>{saved.completed.length ? ` · ${saved.completed.length} of ${levels.length} levels complete` : ''}</p>
    </div>
  )

  const shell = entered && (
    <div ref={rootRef} className="pc-site ec-shell ps" role="dialog" aria-modal="true" aria-labelledby={headingId} data-screen={screen} data-reveal={revealing ? 'true' : 'false'} data-theme={settings.theme} data-surface={settings.theme === 'dark' ? 'observatory' : undefined} data-side={settings.movementSide} data-reduced-motion={reduced ? 'true' : 'false'} data-contrast={settings.highContrast ? 'high' : 'standard'}>
      <h2 id={headingId} className="ps-visually-hidden">Edge Case game</h2>
      {/* Frame layer: identity and state at a glance; one control. */}
      <header className="ec-frame">
        <button type="button" className="ps-icon-button ec-menu-button" aria-expanded={screen === 'menu'} onClick={() => { if (screen === 'menu') back(); else if (screen === 'playing') pause(); else openMenu(['root']) }}>
          <span aria-hidden="true">☰</span><span className="ps-visually-hidden">{screen === 'menu' ? 'Close menu' : 'Menu'}</span>
        </button>
        <p className="ps-level"><span className="ps-level-code">{level.code}</span> {level.title}</p>
        <p className="ps-samples">
          {Array.from({ length: hud.total }, (_, i) => <span key={i} className={i < hud.taken ? 'ps-diamond is-taken' : 'ps-diamond'} aria-hidden="true"/>)}
          <span className="ps-visually-hidden">Samples collected: </span>
          <span>{hud.taken}/{hud.total}</span>
        </p>
      </header>
      {/* Message layer: hints and discoveries get their own rail. */}
      <div className="ec-rail" aria-hidden="true">
        {rail && <p className={rail.kind === 'Discovery' ? 'ec-rail-line is-discovery' : rail.kind.startsWith('Hint') ? 'ec-rail-line is-hint' : 'ec-rail-line'}><span>{rail.kind}</span>{rail.text}</p>}
      </div>
      {/* World layer, with the modal layer (menus and cards) above it. */}
      <div className="ps-stage ec-stage" ref={stageRef} tabIndex={-1}>
        <canvas ref={canvasRef} className="ps-canvas" role="img" aria-label={stateLabel}/>
        {screen === 'playing' && <TouchSurface floating={settings.movement === 'floating'} onStart={() => sound.current.unlock()} onMove={(dx, dy) => { pad.current = { dx, dy } }} onTap={inspectAt} onReveal={setReveal}/>}
        {screen === 'snapshot' && snapshotUrl && lastRecord && (
          <Card title="Field record" kicker={`${lastRecord.code} · ${lastRecord.title}`} focus wide>
            <img className="ps-snapshot" src={snapshotUrl} alt={`Field record for ${lastRecord.code} ${lastRecord.title}: ${lastRecord.outcome === 'won' ? `complete in ${lastRecord.seconds.toFixed(1)} seconds` : `caught after ${lastRecord.seconds.toFixed(1)} seconds`}, ${lastRecord.shifts} junction turns, attempt ${lastRecord.attempt}. Your route is drawn on the arena.`}/>
            <p className="ps-small">If Save image does nothing in this browser, press and hold the image (or right-click it) to save it.</p>
            <div className="ps-card-actions">
              <button type="button" className="ps-primary" onClick={saveRecord}>Save image</button>
              <button type="button" onClick={() => setScreen(lastRecord.outcome === 'won' ? 'won' : 'failed')}>Back</button>
            </div>
            {saveStatus && <p className="ps-small" role="status">{saveStatus}</p>}
          </Card>
        )}
        {screen === 'failed' && (
          <Card title={failCause === 'tracer' ? 'Caught by a tracer' : 'Caught in an active field'} focus compact>
            <p>{failCause === 'tracer' ? 'Tracers repeat their route. The dotted line shows where they go next.' : 'Fields switch on in a steady rhythm. The hatching appears just before.'}</p>
            <div className="ps-card-actions">
              <button type="button" className="ps-primary" onClick={restart}>Try again <kbd>R</kbd></button>
              <button type="button" onClick={openSnapshot}>Snapshot</button>
              <button type="button" onClick={() => openMenu(['root'])}>Menu</button>
            </div>
          </Card>
        )}
        {screen === 'won' && (
          <Card title={!summary.complete ? 'Left early' : levelIndex === levels.length - 1 ? 'Chapter complete' : 'Level complete'} kicker={`${level.code} · ${level.title}`} focus>
            {!summary.complete && <p>Partial: {summary.taken} of {summary.required} samples. Logged as partial; complete needs {summary.required}.</p>}
            <dl className="ps-summary">
              <div><dt>Time</dt><dd>{summary.seconds.toFixed(1)} s</dd></div>
              <div><dt>Attempts</dt><dd>{summary.attempts}</dd></div>
              <div><dt>Turns</dt><dd>{summary.shifts}</dd></div>
            </dl>
            {lastRecord && lastRecord.outcome === 'won' && <Standing record={lastRecord} log={log}/>}
            {summary.found.length > 0 && (
              <ul className="ps-found" aria-label="Discovered this level">
                {summary.found.map(id => { const d = discoveryOf(id); return <li key={id}><span className="ps-code">{d.code}</span> {d.name}</li> })}
              </ul>
            )}
            {levelIndex === levels.length - 1 && <p>That is all of chapter 000–010 for now.</p>}
            <div className="ps-card-actions">
              {!summary.complete && <button type="button" className="ps-primary" onClick={() => begin(levelIndex)}>Try for complete</button>}
              {levelIndex < levels.length - 1 && <button type="button" className={summary.complete ? 'ps-primary' : undefined} onClick={() => begin(levelIndex + 1)}>Next level</button>}
              {summary.complete && <button type="button" className={levelIndex === levels.length - 1 ? 'ps-primary' : undefined} onClick={() => begin(levelIndex)}>Replay</button>}
              <button type="button" onClick={openSnapshot}>Snapshot</button>
              <button type="button" onClick={() => openMenu(['root', 'log'])}>Field log</button>
              <button type="button" onClick={() => openMenu(['root'])}>Menu</button>
            </div>
          </Card>
        )}
      </div>
      {/* Modal layer for menus: spans everything below the frame, over a quieting veil. */}
      {screen === 'menu' && (
        <div className="ec-menu-layer">
          {screen === 'menu' && (
            <MenuCard trail={trail} title={page === 'root' ? (paused ? 'Paused' : 'EDGE CASE') : PAGE_TITLES[page]} kicker={page === 'root' && !paused ? 'Producing Curiosity / ARCADE_01' : undefined} onBack={back} backLabel={menuPath.length > 1 ? 'Back' : paused ? 'Resume' : 'Exit to page'} wide={page === 'index' || page === 'log'} pageKey={menuPath.join('/')}>
              {page === 'root' && (
                <>
                  {!paused && <p className="ps-tagline">Every rule has an exception.</p>}
                  <MenuList>
                    {paused ? <MenuItem primary onClick={resume}>Resume</MenuItem> : <MenuItem primary onClick={() => begin(nextIncomplete)}>{saved.completed.length && saved.completed.length < levels.length ? `Continue: ${levels[nextIncomplete].code} ${levels[nextIncomplete].title}` : 'Play'}</MenuItem>}
                    {paused && <MenuItem onClick={restart}>Restart level</MenuItem>}
                    {paused && hintsLeft > 0 && <MenuItem onClick={() => { requestHint(); resume() }}>Show a hint</MenuItem>}
                    <MenuItem submenu onClick={() => openPage('levels')}>Levels</MenuItem>
                    <MenuItem submenu onClick={() => openPage('index')}>System index</MenuItem>
                    <MenuItem submenu onClick={() => openPage('log')}>Field log</MenuItem>
                    <MenuItem submenu onClick={() => openPage('settings')}>Settings</MenuItem>
                    <MenuItem submenu onClick={() => openPage('how')}>How to play</MenuItem>
                    <MenuItem onClick={() => leave()}>Exit to page</MenuItem>
                  </MenuList>
                </>
              )}
              {page === 'levels' && (
                <MenuList>
                  {levels.map((item, i) => (
                    <MenuItem key={item.id} onClick={() => begin(i)}><span><span className="ps-level-code">{item.code}</span> {item.title}</span>{saved.completed.includes(item.id) && <span className="ps-done"> ✓ <span className="ps-visually-hidden">completed</span></span>}</MenuItem>
                  ))}
                </MenuList>
              )}
              {page === 'index' && <SystemIndex discovered={saved.discovered}/>}
              {page === 'log' && <FieldLog log={log}/>}
              {page === 'settings' && (
                <MenuList>
                  <MenuItem submenu onClick={() => openPage('controls')}>Controls<span className="ec-item-detail">{settings.movement === 'floating' ? 'Floating pad' : settings.movement === 'joystick' ? 'Joystick' : 'Fixed pad'}{settings.movement === 'floating' ? '' : `, ${settings.movementSide}`}</span></MenuItem>
                  <MenuItem submenu onClick={() => openPage('sound')}>Sound<span className="ec-item-detail">{settings.sound ? `On, ${Math.round(settings.volume * 100)}%` : 'Off'}</span></MenuItem>
                  <MenuItem submenu onClick={() => openPage('display')}>Display<span className="ec-item-detail">{settings.theme === 'dark' ? 'Dark' : 'Light'}, {settings.motion === 'system' ? 'device motion' : settings.motion === 'reduce' ? 'reduced motion' : 'full motion'}</span></MenuItem>
                  <MenuItem submenu onClick={() => openPage('gameplay')}>Gameplay<span className="ec-item-detail">{Math.round(settings.speed * 100)}% speed</span></MenuItem>
                </MenuList>
              )}
              {(page === 'controls' || page === 'sound' || page === 'display' || page === 'gameplay') && <SettingsGroup group={page} settings={settings} update={updateSettings}/>}
              {page === 'how' && <HowToPlay/>}
            </MenuCard>
          )}
        </div>
      )}
      {/* Control layer. */}
      {/* The floating pad lives on the touch surface; fixed controls get their own row. */}
      {settings.movement !== 'floating' && <div className="ps-controls ec-controls" data-side={settings.movementSide} data-movement={settings.movement}>
        {settings.movement === 'joystick' ? (
          <Joystick active={screen === 'playing'} onStart={() => sound.current.unlock()} onMove={(dx, dy) => { pad.current = { dx, dy } }}/>
        ) : (
        <div className="ps-pad" role="group" aria-label="Movement pad" onPointerDown={padDown} onPointerMove={event => { if (event.buttons || event.pointerType === 'touch') padMove(event) }} onPointerUp={padEnd} onPointerCancel={padEnd} onLostPointerCapture={padEnd}>
          <button type="button" className="ps-pad-up" aria-label="Move up" disabled={screen !== 'playing'} {...padButtonKey(0, -1)}><span aria-hidden="true">▲</span></button>
          <button type="button" className="ps-pad-left" aria-label="Move left" disabled={screen !== 'playing'} {...padButtonKey(-1, 0)}><span aria-hidden="true">◀</span></button>
          <button type="button" className="ps-pad-right" aria-label="Move right" disabled={screen !== 'playing'} {...padButtonKey(1, 0)}><span aria-hidden="true">▶</span></button>
          <button type="button" className="ps-pad-down" aria-label="Move down" disabled={screen !== 'playing'} {...padButtonKey(0, 1)}><span aria-hidden="true">▼</span></button>
        </div>
        )}
      </div>}
      <p className="ps-visually-hidden" aria-live="polite" role="status">{announcement}</p>
    </div>
  )

  return (
    <>
      {entrance}
      {shell && createPortal(shell, document.body)}
    </>
  )
}

/**
 * A menu page (§13, M3–M4): breadcrumb, heading, then items. Arrow keys/WASD move
 * between items, Right/D or Enter opens, Left/A, Backspace or Escape go back.
 * Native controls (radios, sliders, selects) keep their own arrow-key behaviour.
 */
function MenuCard({ trail, title, kicker, children, onBack, backLabel, wide, pageKey }: { trail: string[]; title: string; kicker?: string; children: ReactNode; onBack: () => void; backLabel: string; wide?: boolean; pageKey: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-menu-item], input, select, button')?.focus({ preventScroll: true })
  }, [pageKey])
  const items = () => [...(ref.current?.querySelectorAll<HTMLElement>('[data-menu-item]:not([disabled])') ?? [])]
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const native = !!target.closest('input, select, textarea')
    const list = items()
    const index = list.indexOf(target)
    const go = (delta: number) => { event.preventDefault(); list[(Math.max(0, index) + delta + list.length) % list.length]?.focus() }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); noteEscape(); onBack(); return }
    if (native) return
    if (['ArrowDown', 's', 'S'].includes(event.key) && list.length) go(index < 0 ? 0 : 1)
    else if (['ArrowUp', 'w', 'W'].includes(event.key) && list.length) go(index < 0 ? 0 : -1)
    else if (['ArrowRight', 'd', 'D'].includes(event.key) && target.dataset.submenu === 'true') { event.preventDefault(); target.click() }
    else if (['ArrowLeft', 'a', 'A', 'Backspace'].includes(event.key)) { event.preventDefault(); onBack() }
  }
  return (
    <div ref={ref} className={wide ? 'ps-card ps-card--wide ec-menu' : 'ps-card ec-menu'} role="dialog" aria-modal="false" aria-labelledby={id} onKeyDown={onKeyDown}>
      {trail.length > 1 && <nav aria-label="Menu location"><ol className="ec-trail">{trail.map((part, i) => <li key={i} aria-current={i === trail.length - 1 ? 'page' : undefined}>{part}</li>)}</ol></nav>}
      {kicker && <p className="ps-kicker">{kicker}</p>}
      <h3 id={id}>{title}</h3>
      {children}
      {/* Top-level menus already list Resume or Exit as items; submenus get an explicit Back. */}
      {trail.length > 1 && <div className="ps-card-actions ec-menu-back"><button type="button" onClick={onBack}>{backLabel}</button></div>}
    </div>
  )
}

function MenuList({ children }: { children: ReactNode }) {
  return <ul className="ec-menu-list" role="list">{children}</ul>
}

function MenuItem({ children, onClick, submenu, primary }: { children: ReactNode; onClick: () => void; submenu?: boolean; primary?: boolean }) {
  return (
    <li>
      <button type="button" data-menu-item data-submenu={submenu ? 'true' : undefined} className={primary ? 'ps-primary ec-item' : 'ec-item'} onClick={onClick}>
        <span className="ec-item-label">{children}</span>
        {submenu && <span className="ec-item-chevron" aria-hidden="true">›</span>}
      </button>
    </li>
  )
}

function HowToPlay() {
  return (
    <div className="ec-how">
      <p>Reach the exit. Collect the samples it asks for to complete the level; leave with fewer and it counts as partial. Watch what repeats before you move.</p>
      <dl className="ps-controls-list">
        <div><dt>Move</dt><dd>Arrow keys or WASD; on touch screens, touch anywhere and drag</dd></div>
        <div><dt>Reveal</dt><dd>Pinch in and hold, or hold Space</dd></div>
        <div><dt>Inspect</dt><dd>Tap or click anything</dd></div>
        <div><dt>Turn a junction</dt><dd>Keep moving into one of its arms; a ring fills, then it turns the way you push</dd></div>
        <div><dt>Menu</dt><dd>Escape, P or the menu button; arrows move through it, Escape goes back</dd></div>
        <div><dt>Restart</dt><dd>R, or Restart level in the menu</dd></div>
      </dl>
      <Legend/>
    </div>
  )
}

/**
 * Floating joystick (MECHANICS.md I1): the base appears where the finger lands in
 * the zone, the knob follows the finger, and the base trails a finger that moves
 * past the rim. Arrow keys and WASD keep working; the pad remains in Settings.
 */
const STICK_RADIUS = 44
function Joystick({ active, onMove, onStart }: { active: boolean; onMove: (dx: number, dy: number) => void; onStart: () => void }) {
  const zone = useRef<HTMLDivElement>(null)
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const pointer = useRef<number | null>(null)
  const captured = useRef(false)
  // A stable reference: re-renders (HUD updates) must never reset a held stick.
  const move = useRef(onMove)
  move.current = onMove
  const place = (x: number, y: number, kx: number, ky: number) => {
    if (base.current) base.current.style.transform = `translate(${x}px, ${y}px)`
    if (knob.current) knob.current.style.transform = `translate(${kx}px, ${ky}px)`
  }
  const rest = useCallback(() => {
    const rect = zone.current?.getBoundingClientRect()
    origin.current = null
    pointer.current = null
    zone.current?.removeAttribute('data-held')
    if (rect) place(rect.width / 2, rect.height / 2, rect.width / 2, rect.height / 2)
    move.current(0, 0)
  }, [])
  useEffect(() => { rest() }, [rest])
  useEffect(() => { if (!active) rest() }, [active, rest])
  const local = (event: ReactPointerEvent<HTMLDivElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top } }
  const track = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointer.current !== event.pointerId || !origin.current) return
    const finger = local(event)
    origin.current = followBase(origin.current, finger, STICK_RADIUS)
    place(origin.current.x, origin.current.y, finger.x, finger.y)
    move.current(...stickInput(finger.x - origin.current.x, finger.y - origin.current.y, STICK_RADIUS))
  }
  return (
    <div ref={zone} className="ps-stick" role="group" aria-label="Movement joystick: touch and drag anywhere here. Arrow keys also move." aria-disabled={!active}
      onPointerDown={event => {
        if (!active || pointer.current !== null) return
        event.preventDefault()
        onStart()
        try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* synthetic pointer */ }
        // Only a capture actually held can be lost; without one, pointerup/cancel end the drag.
        captured.current = event.currentTarget.hasPointerCapture?.(event.pointerId) ?? false
        pointer.current = event.pointerId
        origin.current = local(event)
        event.currentTarget.setAttribute('data-held', 'true')
        place(origin.current.x, origin.current.y, origin.current.x, origin.current.y)
      }}
      onPointerMove={track}
      onPointerUp={event => { if (pointer.current === event.pointerId) rest() }}
      onPointerCancel={event => { if (pointer.current === event.pointerId) rest() }}
      onLostPointerCapture={event => { if (pointer.current === event.pointerId && captured.current) rest() }}>
      <div ref={base} className="ps-stick-base" aria-hidden="true"/>
      <div ref={knob} className="ps-stick-knob" aria-hidden="true"/>
      <span className="ps-stick-label" aria-hidden="true">Touch and drag</span>
    </div>
  )
}

/**
 * The touch surface over the arena (§12b, I4–I6). One finger: a quick touch and release
 * (under 300 ms, under 10 px) inspects; holding or dragging summons the floating pad
 * under the thumb (floating mode only), which then behaves like the joystick (I1).
 * Two fingers pinching in (to 85% of their starting distance) reveal the system until
 * fewer than two fingers remain. Keyboard equivalents: hold Space to reveal.
 */
const PAD_RADIUS = 48
function TouchSurface({ floating, onMove, onTap, onReveal, onStart }: { floating: boolean; onMove: (dx: number, dy: number) => void; onTap: (x: number, y: number) => void; onReveal: (on: boolean) => void; onStart: () => void }) {
  const zone = useRef<HTMLDivElement>(null)
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const actions = useRef({ onMove, onTap, onReveal, onStart })
  actions.current = { onMove, onTap, onReveal, onStart }
  const pointers = useRef(new Map<number, { x: number; y: number; sx: number; sy: number; t: number }>())
  const stick = useRef<{ id: number; origin: { x: number; y: number } } | null>(null)
  const pinch = useRef<{ d0: number; on: boolean } | null>(null)
  const timer = useRef(0)
  const place = (o: { x: number; y: number }, k: { x: number; y: number }) => {
    if (base.current) base.current.style.transform = `translate(${o.x}px, ${o.y}px)`
    if (knob.current) knob.current.style.transform = `translate(${k.x}px, ${k.y}px)`
  }
  const release = () => {
    stick.current = null
    zone.current?.removeAttribute('data-held')
    actions.current.onMove(0, 0)
  }
  const steer = (id: number) => {
    const p = pointers.current.get(id), st = stick.current
    if (!p || !st || st.id !== id) return
    st.origin = followBase(st.origin, p, PAD_RADIUS)
    place(st.origin, p)
    actions.current.onMove(...stickInput(p.x - st.origin.x, p.y - st.origin.y, PAD_RADIUS))
  }
  const activate = (id: number) => {
    const p = pointers.current.get(id)
    if (!p || stick.current || pinch.current) return
    stick.current = { id, origin: { x: p.sx, y: p.sy } }
    zone.current?.setAttribute('data-held', 'true')
    steer(id)
  }
  useEffect(() => () => { window.clearTimeout(timer.current); actions.current.onMove(0, 0); if (pinch.current?.on) actions.current.onReveal(false) }, [])
  const local = (event: ReactPointerEvent<HTMLDivElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top } }
  const distance = () => { const [a, b] = [...pointers.current.values()]; return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0 }
  const end = (event: ReactPointerEvent<HTMLDivElement>) => {
    const p = pointers.current.get(event.pointerId)
    if (!p) return
    pointers.current.delete(event.pointerId)
    window.clearTimeout(timer.current)
    if (stick.current?.id === event.pointerId) release()
    else if (event.type === 'pointerup' && !pinch.current && performance.now() - p.t < 300 && Math.hypot(p.x - p.sx, p.y - p.sy) < 10) actions.current.onTap(event.clientX, event.clientY)
    if (pinch.current && pointers.current.size < 2) {
      if (pinch.current.on) actions.current.onReveal(false)
      pinch.current = { ...pinch.current, on: false }
    }
    if (pointers.current.size === 0) pinch.current = null
  }
  return (
    <div ref={zone} className="ec-touch" data-floating={floating ? 'true' : 'false'} aria-hidden="true"
      onPointerDown={event => {
        event.preventDefault()
        actions.current.onStart()
        try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* synthetic pointer */ }
        const at = local(event)
        pointers.current.set(event.pointerId, { ...at, sx: at.x, sy: at.y, t: performance.now() })
        if (pointers.current.size === 1 && floating) {
          const id = event.pointerId
          timer.current = window.setTimeout(() => { if (pointers.current.size === 1) activate(id) }, 150)
        } else if (pointers.current.size === 2) {
          window.clearTimeout(timer.current)
          release()
          pinch.current = { d0: distance(), on: false }
        }
      }}
      onPointerMove={event => {
        const p = pointers.current.get(event.pointerId)
        if (!p) return
        Object.assign(p, local(event))
        if (pinch.current) {
          if (!pinch.current.on && pointers.current.size >= 2 && distance() < pinch.current.d0 * 0.85) { pinch.current.on = true; actions.current.onReveal(true) }
          return
        }
        if (!floating) return
        if (!stick.current && Math.hypot(p.x - p.sx, p.y - p.sy) > 8) activate(event.pointerId)
        else steer(event.pointerId)
      }}
      onPointerUp={end} onPointerCancel={end}>
      <div ref={base} className="ec-pad-base"><span>▲</span><span>▶</span><span>▼</span><span>◀</span></div>
      <div ref={knob} className="ec-pad-knob"/>
    </div>
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

function Standing({ record, log }: { record: RunRecord; log: RunRecord[] }) {
  const { rank, of } = rankOf(log, record)
  const level = standing(log, record.level)
  return (
    <div className="ps-standing">
      {record.thumb && <img className="ps-thumb" src={record.thumb} alt={`Snapshot of ${record.code} ${record.title}: your route to the exit, ${record.seconds.toFixed(1)} seconds.`}/>}
      <dl>
        <div><dt>Rank by time</dt><dd>#{rank} of {of}{rank === 1 && of > 1 ? ' · new best' : ''}</dd></div>
        <div><dt>Method</dt><dd>{record.method}</dd></div>
        <div><dt>Ways through found</dt><dd>{level.ways.length} / ?</dd></div>
      </dl>
    </div>
  )
}

function FieldLog({ log }: { log: RunRecord[] }) {
  return (
    <div className="ps-index">
      <section aria-labelledby="ec-rank">
        <div className="ps-index-head"><h4 id="ec-rank">Standings</h4><p className="ps-register">personal · local</p></div>
        <table className="ps-table">
          <thead><tr><th scope="col">Level</th><th scope="col">Best</th><th scope="col">Fewest actions</th><th scope="col">Ways</th></tr></thead>
          <tbody>
            {levels.map(level => {
              const s = standing(log, level.id)
              return (
                <tr key={level.id}>
                  <th scope="row"><span className="ps-code">{level.code}</span></th>
                  <td>{s.bestSeconds === null ? '—' : `${s.bestSeconds.toFixed(1)} s`}</td>
                  <td>{s.fewestActions ?? '—'}</td>
                  <td>{s.ways.length} / ?</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="ps-small">Ways counts distinct methods you have won with. The game does not claim to know them all.</p>
      </section>
      <section aria-labelledby="ec-log">
        <div className="ps-index-head"><h4 id="ec-log">Recent outcomes</h4><p className="ps-register">{log.length} / 40</p></div>
        {log.length === 0 ? <p className="ps-small">No outcomes yet. Every attempt is recorded here, including the ones that end early.</p> : (
          <ol className="ps-log">
            {log.slice(0, 12).map(record => {
              const { rank, of } = record.outcome === 'won' ? rankOf(log, record) : { rank: 0, of: 0 }
              return (
                <li key={record.id}>
                  {record.thumb ? <img className="ps-thumb ps-thumb--small" src={record.thumb} alt=""/> : <span className="ps-thumb ps-thumb--small" aria-hidden="true"/>}
                  <span className="ps-op-body">
                    <strong><span className="ps-code">{record.code}</span> {record.outcome === 'won' ? `complete · ${record.seconds.toFixed(1)} s` : record.outcome === 'partial' ? `left early · partial · ${record.seconds.toFixed(1)} s` : record.cause === 'field' ? 'caught in a field' : 'caught by a tracer'}</strong>
                    <span>{record.outcome === 'won' ? `${record.method} · rank #${rank} of ${of}` : record.outcome === 'partial' ? 'not ranked' : `after ${record.seconds.toFixed(1)} s`} · attempt {record.attempt}{record.hints ? ` · ${record.hints} hint${record.hints > 1 ? 's' : ''}` : ''}</span>
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </section>
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
      <li><span className="ps-key ps-key--junction" aria-hidden="true"/>Junction: push an arm to turn it</li>
      <li><span className="ps-key ps-key--sample" aria-hidden="true"/>Sample</li>
      <li><span className="ps-key ps-key--field" aria-hidden="true"/>Field: switches on and off</li>
      <li><span className="ps-key ps-key--exit" aria-hidden="true"/>Exit: always open; closes when complete</li>
    </ul>
  )
}

/** Settings › one group per screen (§13, M4). */
function SettingsGroup({ group, settings, update }: { group: 'controls' | 'sound' | 'display' | 'gameplay'; settings: Settings; update: (patch: Partial<Settings>) => void }) {
  const id = useId()
  const vibration = typeof navigator !== 'undefined' && 'vibrate' in navigator
  return (
    <div className="ps-settings">
      {group === 'controls' && (
        <>
          <fieldset className="ps-field">
            <legend>Movement control</legend>
            <label className="ps-check"><input type="radio" name={`${id}-movement`} checked={settings.movement === 'floating'} onChange={() => update({ movement: 'floating' })}/> Floating pad: appears under your thumb, anywhere</label>
            <label className="ps-check"><input type="radio" name={`${id}-movement`} checked={settings.movement === 'pad'} onChange={() => update({ movement: 'pad' })}/> Fixed pad (four labelled buttons)</label>
            <label className="ps-check"><input type="radio" name={`${id}-movement`} checked={settings.movement === 'joystick'} onChange={() => update({ movement: 'joystick' })}/> Joystick that follows your finger</label>
          </fieldset>
          <fieldset className="ps-field">
            <legend>Control side</legend>
            <label className="ps-check"><input type="radio" name={`${id}-side`} checked={settings.movementSide === 'left'} onChange={() => update({ movementSide: 'left' })}/> Movement control on the left</label>
            <label className="ps-check"><input type="radio" name={`${id}-side`} checked={settings.movementSide === 'right'} onChange={() => update({ movementSide: 'right' })}/> Movement control on the right</label>
          </fieldset>
        </>
      )}
      {group === 'sound' && (
        <>
          <label className="ps-check"><input type="checkbox" checked={settings.sound} onChange={e => update({ sound: e.target.checked })}/> Sound</label>
          <label className="ps-field" htmlFor={`${id}-volume`}>Volume <input id={`${id}-volume`} type="range" min={0} max={1} step={0.1} value={settings.volume} disabled={!settings.sound} onChange={e => update({ volume: Number(e.target.value) })}/></label>
          {vibration && <label className="ps-check"><input type="checkbox" checked={settings.haptics} onChange={e => update({ haptics: e.target.checked })}/> Vibration</label>}
        </>
      )}
      {group === 'display' && (
        <>
          <fieldset className="ps-field">
            <legend>Theme</legend>
            <label className="ps-check"><input type="radio" name={`${id}-theme`} checked={settings.theme === 'dark'} onChange={() => update({ theme: 'dark' })}/> Dark (observatory)</label>
            <label className="ps-check"><input type="radio" name={`${id}-theme`} checked={settings.theme === 'light'} onChange={() => update({ theme: 'light' })}/> Light (paper)</label>
          </fieldset>
          <fieldset className="ps-field">
            <legend>Motion</legend>
            {(['system', 'reduce', 'full'] as const).map(value => (
              <label key={value} className="ps-check"><input type="radio" name={`${id}-motion`} checked={settings.motion === value} onChange={() => update({ motion: value })}/> {value === 'system' ? 'Match my device' : value === 'reduce' ? 'Reduced' : 'Full'}</label>
            ))}
          </fieldset>
          <label className="ps-check"><input type="checkbox" checked={settings.alwaysPaths} onChange={e => update({ alwaysPaths: e.target.checked })}/> Always show the system’s paths (otherwise pinch or hold Space to reveal)</label>
          <label className="ps-check"><input type="checkbox" checked={settings.highContrast} onChange={e => update({ highContrast: e.target.checked })}/> Bolder lines</label>
        </>
      )}
      {group === 'gameplay' && (
        <>
          <label className="ps-field" htmlFor={`${id}-speed`}>Game speed
            <select id={`${id}-speed`} value={settings.speed} onChange={e => update({ speed: Number(e.target.value) as Settings['speed'] })}>
              <option value={1}>100%</option><option value={0.75}>75%</option><option value={0.5}>50%</option>
            </select>
          </label>
          <label className="ps-check"><input type="checkbox" checked={settings.autoHints} onChange={e => update({ autoHints: e.target.checked })}/> Offer hints when I seem stuck</label>
        </>
      )}
    </div>
  )
}
