export interface Settings {
  sound: boolean
  volume: number
  motion: 'system' | 'reduce' | 'full'
  previews: boolean
  highContrast: boolean
  speed: 1 | 0.75 | 0.5
  haptics: boolean
}
export interface Saved { settings: Settings; completed: string[] }

export const defaultSettings: Settings = { sound: true, volume: 0.6, motion: 'system', previews: true, highContrast: false, speed: 1, haptics: true }
const KEY = 'pattern-shift:v1'

/** Storage is a convenience: any failure falls back to defaults and play continues. */
export function load(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!raw || typeof raw !== 'object') return { settings: { ...defaultSettings }, completed: [] }
    const s = { ...defaultSettings, ...(raw.settings ?? {}) }
    const settings: Settings = {
      sound: !!s.sound,
      volume: typeof s.volume === 'number' ? Math.min(1, Math.max(0, s.volume)) : defaultSettings.volume,
      motion: ['system', 'reduce', 'full'].includes(s.motion) ? s.motion : 'system',
      previews: !!s.previews,
      highContrast: !!s.highContrast,
      speed: ([1, 0.75, 0.5] as const).find(v => v === s.speed) ?? 1,
      haptics: !!s.haptics,
    }
    const completed = Array.isArray(raw.completed) ? raw.completed.filter((id: unknown): id is string => typeof id === 'string') : []
    return { settings, completed }
  } catch { return { settings: { ...defaultSettings }, completed: [] } }
}

export function save(saved: Saved) {
  try { localStorage.setItem(KEY, JSON.stringify(saved)) } catch { /* private mode or blocked storage */ }
}

export function prefersReducedMotion(settings: Settings) {
  if (settings.motion !== 'system') return settings.motion === 'reduce'
  try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}
