/**
 * Floating joystick → movement input (tests/EDGE-CASE-MECHANICS.md I1).
 * The offset of the finger from the stick base becomes a direction snapped to
 * eight ways (so axis moves are exactly axis-aligned and corner assist applies)
 * and a magnitude: nothing inside the dead zone, full speed at the rim.
 */
export const STICK_DEAD_ZONE = 0.18
const WAYS: [number, number][] = [[1, 0], [Math.SQRT1_2, Math.SQRT1_2], [0, 1], [-Math.SQRT1_2, Math.SQRT1_2], [-1, 0], [-Math.SQRT1_2, -Math.SQRT1_2], [0, -1], [Math.SQRT1_2, -Math.SQRT1_2]]

export function stickInput(ox: number, oy: number, radius: number): [number, number] {
  const distance = Math.hypot(ox, oy) / radius
  if (distance <= STICK_DEAD_ZONE) return [0, 0]
  const magnitude = Math.min(1, (distance - STICK_DEAD_ZONE) / (1 - STICK_DEAD_ZONE))
  const way = WAYS[((Math.round(Math.atan2(oy, ox) / (Math.PI / 4)) % 8) + 8) % 8]
  return [way[0] * magnitude, way[1] * magnitude]
}

/** The base follows a finger that travels past the rim, so the stick stays under it. */
export function followBase(base: { x: number; y: number }, finger: { x: number; y: number }, radius: number) {
  const ox = finger.x - base.x, oy = finger.y - base.y
  const d = Math.hypot(ox, oy)
  return d <= radius ? base : { x: finger.x - (ox / d) * radius, y: finger.y - (oy / d) * radius }
}
