import type { DiscoveryId } from './engine'

/**
 * KNOWN OPERATIONS and DISCOVERIES. Controls are never hidden: MOVE, TURN, TRACE,
 * REVEAL and INSPECT are known from the start. The mystery is only in optional discoveries.
 * Clues are observations, not instructions; some deliberately offer nothing.
 */
export interface Operation { id: string; symbol: string; name: string; text: string; discovery?: DiscoveryId; clue?: string }
export const operations: Operation[] = [
  { id: 'move', symbol: '↑↓←→', name: 'MOVE', text: 'Navigate the arena.' },
  { id: 'shift', symbol: '↻', name: 'TURN', text: 'Push against an arm of a junction and hold. It turns the way you push, either way, and whatever sits in its pockets turns with it.' },
  { id: 'trace', symbol: '◎', name: 'TRACE', text: 'After a restart, your previous route stays on the map.' },
  { id: 'reveal', symbol: '◉', name: 'REVEAL', text: 'Pinch in and hold (or hold Space) to see every route, turn and rhythm. Release to hide. Time keeps running.' },
  { id: 'inspect', symbol: '⌕', name: 'INSPECT', text: 'Tap or click anything to learn what it does.' },
  { id: 'reroute', symbol: '◇', name: 'RE:ROUTE', discovery: 'reroute', text: 'A tracer carried by a junction leaves on whatever track it lands on.', clue: 'Junctions do not check what they carry.' },
  { id: 'pivot', symbol: '‖', name: 'PIVOT', discovery: 'pivot', text: 'Some junctions carry nothing. They change which way things may pass.', clue: 'Not every junction looks like one.' },
  { id: 'alternate-exit', symbol: '⌘', name: 'ALTERNATE EXIT', discovery: 'technically-correct', text: 'The exit has to be reached. It never says by walking.' },
  { id: 'exception', symbol: '∅', name: 'EXCEPTION', discovery: 'exception', text: 'You can always leave. Complete needs enough samples, and enough is not always everything.', clue: 'Counters describe. They do not decide.' },
]

export interface Discovery { id: DiscoveryId; code: string; name: string; text: string; clue?: string }
export const discoveries: Discovery[] = [
  { id: 'false-start', code: '0x00', name: 'False Start', text: 'You left a start that was never the beginning.' },
  { id: 'expected-behavior', code: '0x01', name: 'Expected Behavior', text: 'You watched a full cycle before touching anything.', clue: 'Some things are worth watching first.' },
  { id: 'reroute', code: '0x02', name: 'Re:Route', text: 'A tracer went somewhere new because you moved what it stood on.' },
  { id: 'not-a-bug', code: '0x03', name: "It's Not a Bug", text: 'A tracer stopped. Tracers only move on track, and you put it somewhere without any. Working as intended.', clue: 'Looks broken. Is not.' },
  { id: 'pivot', code: '0x04', name: 'Pivot', text: 'A second kind of junction: it changes direction, not position.' },
  { id: 'technically-correct', code: '0x05', name: 'Technically Correct', text: 'You fulfilled the requirement. Just not the way we expected.' },
  { id: 'exception', code: '0x06', name: 'Exception', text: 'Complete, with samples left behind. Complete never asked for all of them.' },
  { id: 'ten-types', code: '0x07', name: 'There Are 10 Types of Players', text: 'Those who understand binary and those who don’t. You opened this index 0b10 times.' },
  { id: 'off-by-one', code: '0x08', name: 'Off by One', text: 'One more simulation step and that tracer would have reached you.', clue: 'Timing is measured in 1/60 s.' },
  { id: 'full-circle', code: '0x09', name: 'Full Circle', text: 'Four shifts. Everything back where it started. Probably.' },
]

/** Fixed width so the counter reads like a register: 0011 / 1010. */
export const binary = (n: number, width = 4) => n.toString(2).padStart(width, '0')
