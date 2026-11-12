import type { LevelDef } from './engine'

/**
 * Chapter 0, levels 000–010. Original layouts. Each level has more than one
 * way through; none requires an optional discovery.
 */
export const levels: LevelDef[] = [
  {
    id: 'false-start',
    code: '000',
    title: 'False Start',
    hint: 'The beginning is not what it seems.',
    // You begin sealed in a junction pocket. The first real move is not movement.
    map: [
      '#########',
      '#...E...#',
      '#=======#',
      '#.......#',
      '####..o.#',
      '###P....#',
      '###..####',
      '###.#####',
      '#.......#',
      '#o......#',
      '#########',
    ],
    junctions: [{ x: 4, y: 6 }],
    tracers: [{ x: 1, y: 2, dir: 1, speed: 2 }],
    // Tests whether SHIFT is found unaided; hints escalate only while stuck.
    hints: {
      progress: 'shift',
      steps: [
        { after: 15, text: 'Not every wall here is a wall.' },
        { after: 30, text: 'The cross with the orange pivot can turn.' },
        { after: 45, text: 'Keep pushing into one of its arms. It turns the way you push.' },
      ],
    },
  },
  {
    id: 'expected-behavior',
    code: '001',
    title: 'Expected Behavior',
    hint: 'Learn the rules before changing them.',
    // A tracer patrols into a junction pocket. Time your crossing, or move the tracer.
    map: [
      '#########',
      '#o..E..o#',
      '#.......#',
      '#.......#',
      '###.#####',
      '#=======#',
      '###..####',
      '###.#####',
      '#.......#',
      '#..P....#',
      '#########',
    ],
    junctions: [{ x: 4, y: 6 }],
    tracers: [{ x: 1, y: 5, dir: 1, speed: 2.2 }],
    hints: {
      progress: 'sample',
      steps: [
        { after: 30, text: 'Watch the tracer for one full cycle.' },
        { after: 50, text: 'Its track runs through a pocket. Pockets turn, with whatever is inside.' },
      ],
    },
  },
  {
    id: 'shift-happens',
    code: '010',
    title: 'Shift Happens',
    hint: 'There is more than one way through.',
    // The exit sits in a sealed pocket. Two of three samples open it.
    map: [
      '#########',
      '#o..#####',
      '#...EV..#',
      '#....#o.#',
      '###.##.##',
      '#=======#',
      '###.##.##',
      '#.......#',
      '#.......#',
      '#o..P...#',
      '#########',
    ],
    junctions: [{ x: 4, y: 3 }],
    tracers: [{ x: 7, y: 5, dir: 3, speed: 2.4 }],
    required: 2,
    hints: {
      progress: 'exit-open',
      steps: [
        { after: 40, text: 'More than one structure here can change.' },
        { after: 70, text: 'A sealed room can still be entered.' },
      ],
    },
  },
]
