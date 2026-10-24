import P5 from 'p5'
import { processGeometry, type ProcessExperiment } from './content'

export interface MotionLayer { setRunning(running: boolean): void; destroy(): void }

/** No content, labels, events or navigation live in the canvas. */
export function createMotion(host: HTMLElement, content: ProcessExperiment, complete: () => void): MotionLayer {
  const paths = processGeometry(content)
  let elapsed = 0
  let running = false
  let destroyed = false
  let ready = false
  let previous = 0
  const duration = 3600
  const instance = new P5(p => {
    p.setup = () => {
      const canvas = p.createCanvas(host.clientWidth, host.clientHeight)
      canvas.elt.setAttribute('aria-hidden', 'true')
      canvas.elt.setAttribute('role', 'presentation')
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2))
      p.frameRate(30); p.noLoop(); ready = true
      if (running) { previous = performance.now(); p.loop() }
    }
    p.draw = () => {
      if (!running || destroyed) return
      const now = performance.now()
      elapsed += Math.min(now - previous, 80); previous = now
      p.clear()
      const progress = Math.min(elapsed / duration, 1)
      p.scale(p.width / 800, p.height / 300)
      for (const path of paths) {
        const color: [number, number, number] = path.kind === 'verification' ? [86, 199, 206] : path.kind === 'rework' ? [243, 145, 133] : [185, 163, 237]
        // Accumulated traces are optional feedback; SVG already holds the complete paths.
        p.noFill(); p.stroke(...color, 60); p.strokeWeight(1)
        p.line(path.from.x, path.from.y, p.lerp(path.from.x, path.to.x, progress), p.lerp(path.from.y, path.to.y, progress))
        for (let echo = 4; echo >= 0; echo--) {
          const t = Math.max(0, progress - echo * .035)
          p.noStroke(); p.fill(...color, 210 - echo * 35)
          p.circle(p.lerp(path.from.x, path.to.x, t), p.lerp(path.from.y, path.to.y, t), echo ? 4 : 7)
        }
      }
      if (progress >= 1) { running = false; p.noLoop(); complete() }
    }
  }, host)
  const resize = new ResizeObserver(() => {
    if (!destroyed && ready) instance.resizeCanvas(host.clientWidth, host.clientHeight, true)
  })
  resize.observe(host)
  return {
    setRunning(next) {
      if (destroyed || elapsed >= duration) return
      running = next; previous = performance.now()
      if (ready) { if (next) instance.loop(); else instance.noLoop() }
    },
    destroy() { destroyed = true; running = false; resize.disconnect(); instance.remove() },
  }
}
