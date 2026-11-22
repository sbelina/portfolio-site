/**
 * The interlude's construction, computed rather than drawn by eye. Every point comes from one
 * circle and its diameter, using Euclid's Elements; the steps shown to readers are generated
 * from these same numbers, so the text and the drawing cannot disagree.
 */
export type Point = { x: number; y: number }

export const centre: Point = { x: 160, y: 130 } // O
export const radius = 92 // r (Postulate 3: a circle with any centre and radius)
export const A: Point = { x: centre.x - radius, y: centre.y } // one end of the diameter
export const B: Point = { x: centre.x + radius, y: centre.y } // the other end
/** I.11: the perpendicular to AB at O meets the circle at C. */
export const C: Point = { x: centre.x, y: centre.y - radius }
/** The fourth vertex of the inscribed square ACBD (dotted in the drawing). */
export const D: Point = { x: centre.x, y: centre.y + radius }

const squared = (p: Point, q: Point) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2
export const length = (p: Point, q: Point) => Math.sqrt(squared(p, q))
/** Dot product of CA and CB: zero means the angle at C is right (Thales, III.31). */
export const angleAtC = ((A.x - C.x) * (B.x - C.x) + (A.y - C.y) * (B.y - C.y))

export const measures = {
  r: radius,
  AB: length(A, B),
  AC: length(A, C),
  BC: length(B, C),
  ACsquared: squared(A, C),
  BCsquared: squared(B, C),
  ABsquared: squared(A, B),
}

const grouped = (value: number) => Math.round(value).toLocaleString('en-US')
const oneDecimal = (value: number) => value.toFixed(1)

/** The reasoning, in order, for the page. Generated from the numbers above. */
export const constructionSteps: readonly { text: string; source: string }[] = [
  { text: `Draw a circle with centre O and radius r = ${radius}.`, source: 'Postulate 3' },
  { text: `Draw the diameter AB through O, so AB = 2r = ${grouped(measures.AB)}.`, source: 'Definition 17' },
  { text: 'Draw the perpendicular to AB at O. It meets the circle at C.', source: 'Book I, Proposition 11' },
  { text: 'The angle at C is a right angle, because triangle ACB stands on a diameter.', source: 'Thales; Book III, Proposition 31' },
  { text: `OA and OC are both radii and meet at a right angle, so AC = r√2 ≈ ${oneDecimal(measures.AC)}. BC is the same.`, source: 'Book I, Proposition 47' },
  { text: `Check: AC² + BC² = ${grouped(measures.ACsquared)} + ${grouped(measures.BCsquared)} = ${grouped(measures.ACsquared + measures.BCsquared)} = AB².`, source: 'Book I, Proposition 47' },
  { text: 'The freehand line is drawn by hand, not computed. It is placed to pass through C: the construction fixes where they meet; the freehand finds its own way there.', source: 'The metaphor' },
]

/** A freehand-looking cubic path whose middle point is exactly C. */
export const freehandPath = `M20 96C58 40 112 126 ${C.x} ${C.y}S252 118 300 52`
/** Right-angle marker at C, 12 units along CA and CB. */
const unit = 12 / Math.SQRT2
export const rightAngleMarker = `M${C.x - unit} ${C.y + unit}L${C.x} ${C.y + 2 * unit}L${C.x + unit} ${C.y + unit}`
