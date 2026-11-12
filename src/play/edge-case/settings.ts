export interface Settings {
  sound: boolean
  volume: number
  motion: 'system' | 'reduce' | 'full'
  /** Paths are hidden unless revealed (pinch / hold Space); this shows them always (§12b). */
  alwaysPaths: boolean
  highContrast: boolean
  speed: 1 | 0.75 | 0.5
  haptics: boolean
  /** Movement control on touch screens. */
  movement: 'floating' | 'pad' | 'joystick'
  /** Which side the movement control sits on; Shift takes the other side. */
  movementSide: 'left' | 'right'
  /** Stuck hints appear automatically (MECHANICS.md N1); they can always be requested. */
  autoHints: boolean
  /** Dark uses the design system's observatory surface (default); light its paper surface. */
  theme: 'dark' | 'light'
}
export interface Saved { version: 2; settings: Settings; completed: string[]; discovered: string[]; indexOpens: number }

/** Touch screens default to the floating pad; everything else to the fixed pad (I4). */
export function touchDefault(): Settings['movement'] {
  try { return matchMedia('(pointer: coarse)').matches ? 'floating' : 'pad' } catch { return 'pad' }
}

export const defaultSettings: Settings = { sound: true, volume: 0.6, motion: 'system', alwaysPaths: false, highContrast: false, speed: 1, haptics: true, movement: touchDefault(), movementSide: 'left', autoHints: true, theme: 'dark' }
const KEY = 'edge-case:v1'

/** Storage is a convenience: any failure falls back to defaults and play continues. */
export function load(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!raw || typeof raw !== 'object') return empty()
    const s = { ...defaultSettings, ...(raw.settings ?? {}) }
    // Version 1 stored the fixed pad for everyone: move touch screens to the floating pad once.
    if ((raw.version ?? 1) < 2 && s.movement === 'pad') s.movement = touchDefault()
    const settings: Settings = {
      sound: !!s.sound,
      volume: typeof s.volume === 'number' ? Math.min(1, Math.max(0, s.volume)) : defaultSettings.volume,
      motion: ['system', 'reduce', 'full'].includes(s.motion) ? s.motion : 'system',
      alwaysPaths: !!s.alwaysPaths,
      highContrast: !!s.highContrast,
      speed: ([1, 0.75, 0.5] as const).find(v => v === s.speed) ?? 1,
      haptics: !!s.haptics,
      movement: s.movement === 'joystick' || s.movement === 'pad' || s.movement === 'floating' ? s.movement : touchDefault(),
      movementSide: s.movementSide === 'right' ? 'right' : 'left',
      autoHints: s.autoHints !== false,
      theme: s.theme === 'light' ? 'light' : 'dark',
    }
    const strings = (value: unknown) => Array.isArray(value) ? value.filter((id: unknown): id is string => typeof id === 'string') : []
    const indexOpens = Number.isInteger(raw.indexOpens) && raw.indexOpens >= 0 ? raw.indexOpens : 0
    return { version: 2, settings, completed: strings(raw.completed), discovered: strings(raw.discovered), indexOpens }
  } catch { return empty() }
}

const empty = (): Saved => ({ version: 2, settings: { ...defaultSettings }, completed: [], discovered: [], indexOpens: 0 })

export function save(saved: Saved) {
  try { localStorage.setItem(KEY, JSON.stringify(saved)) } catch { /* private mode or blocked storage */ }
}

export function prefersReducedMotion(settings: Settings) {
  if (settings.motion !== 'system') return settings.motion === 'reduce'
  try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}
