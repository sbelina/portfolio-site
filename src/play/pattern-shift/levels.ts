import type { LevelDef } from './engine'

/**
 * Three handcrafted levels: survive within the rules, change a rule,
 * then predict when to change it. Original layouts for this prototype.
 */
export const levels: LevelDef[] = [
  {
    id: 'rhythm',
    title: 'Rhythm',
    hint: 'Watch first. Everything here repeats.',
    map: [
      '#########',
      '#...E..o#',
      '#.......#',
      '#~~~~~~~#',
      '#.......#',
      '###.#####',
      '#=======#',
      '#####.###',
      '#.......#',
      '#o.P....#',
      '#########',
    ],
    tracers: [{ x: 1, y: 6, dir: 1, speed: 2.2 }],
    field: { period: 3, on: 1.2, warn: 0.6 },
  },
  {
    id: 'gate',
    title: 'The gate',
    hint: 'Some structures can be turned.',
    map: [
      '#########',
      '#o..E...#',
      '#.......#',
      '#.......#',
      '####.####',
      '#===H===#',
      '####.####',
      '#.......#',
      '#.......#',
      '#..P...o#',
      '#########',
    ],
    tracers: [{ x: 7, y: 5, dir: 3, speed: 2.4 }],
  },
  {
    id: 'upstream',
    title: 'Upstream',
    hint: 'When you change it matters.',
    map: [
      '#########',
      '#o..E...#',
      '#.......#',
      '#~~~~~~~#',
      '#.......#',
      '####.####',
      '#===H==*#',
      '####.#.##',
      '#.......#',
      '#...P...#',
      '#########',
    ],
    tracers: [{ x: 1, y: 6, dir: 1, speed: 2.6 }],
    field: { period: 2.6, on: 1.1, warn: 0.5 },
  },
]
