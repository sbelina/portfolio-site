import { publicPath } from '../../public-path'
import { UNPUBLISHED_MARKER } from './engine'

/** Static, readable page. The playable game mounts into #pattern-shift-game. */
export function PatternShiftPage() {
  return (
    <div className="pc-site ps-page" data-prototype={UNPUBLISHED_MARKER}>
      <a className="ps-skip" href="#how-to-play">Skip to how to play</a>
      <header className="ps-page-header">
        <a className="ps-wordmark" href={publicPath('/')}><span aria-hidden="true">*</span> Producing Curiosity</a>
        <p className="ps-status-tag">Unpublished prototype</p>
      </header>
      <main className="ps-main">
        <h1>Pattern Shift</h1>
        <p className="ps-lede">A small game about systems that repeat. Watch how things move, find what you can change, and make a way through.</p>
        <div id="pattern-shift-game" className="ps-mount">
          <p className="ps-fallback">The playable game needs JavaScript. How it works is described below.</p>
        </div>
        <section id="how-to-play" className="ps-about" aria-labelledby="how-heading">
          <h2 id="how-heading">How to play</h2>
          <p>Collect every sample, then reach the exit. Tracers repeat the same route and timed fields switch on in a steady rhythm. Gates let movement through in one direction at a time, for you and for tracers alike. Turning a gate changes where things can go.</p>
          <h3>Controls</h3>
          <dl className="ps-controls-list">
            <div><dt>Move</dt><dd>Arrow keys or WASD; on touch screens, the movement pad</dd></div>
            <div><dt>Turn a gate</dt><dd>Space or Enter when next to it; or the Turn gate button</dd></div>
            <div><dt>Pause</dt><dd>Escape or P; or the pause button</dd></div>
            <div><dt>Restart</dt><dd>R; or the restart button</dd></div>
          </dl>
          <h3>What you will see</h3>
          <ul>
            <li><strong>You</strong>: a filled circle with an orange ring.</li>
            <li><strong>Tracers</strong>: arrowheads pointing the way they travel, with a dotted line showing where they go next.</li>
            <li><strong>Gates</strong>: two parallel bars around a pivot. Movement passes along the bars, never across them. A dashed ring appears when one is within reach.</li>
            <li><strong>Samples</strong>: hollow diamonds.</li>
            <li><strong>Timed fields</strong>: dashed squares. Sparse hatching warns they are about to switch on; dense crosshatching means active.</li>
            <li><strong>Exit</strong>: a broken circle that closes once every sample is collected.</li>
          </ul>
          <p>Settings include sound and volume, reduced motion, game speed, path previews and bolder lines.</p>
        </section>
        <section className="ps-about" aria-labelledby="about-heading">
          <h2 id="about-heading">About this prototype</h2>
          <p>An original game in development, inspired by the timing and pattern-reading of classic arcade navigation games. It has three test levels. It is not published, and it is not yet tested with players.</p>
          <p>Known limits: it is a real-time game and is not yet playable with a screen reader alone.</p>
        </section>
      </main>
    </div>
  )
}
