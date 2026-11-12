import { publicPath } from '../../public-path'
import { UNPUBLISHED_MARKER } from './engine'

/** Static, readable page. The playable game mounts into #edge-case-game. */
export function EdgeCasePage({ homeHref = publicPath('/') }: { homeHref?: string }) {
  return (
    <div className="pc-site ps-page" data-prototype={UNPUBLISHED_MARKER}>
      <a className="ps-skip" href="#how-to-play">Skip to how to play</a>
      <header className="ps-page-header">
        <a className="ps-wordmark" href={homeHref}><span aria-hidden="true">*</span> Producing Curiosity</a>
        <p className="ps-status-tag">Unpublished prototype</p>
      </header>
      <main className="ps-main">
        <p className="ps-kicker">Arcade_01</p>
        <h1>Edge Case</h1>
        <p className="ps-lede">Every rule has an exception. A small game about systems that repeat: watch how things move, change what you can, and find more than one way through.</p>
        <div id="edge-case-game" className="ps-mount">
          <p className="ps-fallback">The playable game needs JavaScript. How it works is described below.</p>
        </div>
        <section id="how-to-play" className="ps-about" aria-labelledby="how-heading">
          <h2 id="how-heading">How to play</h2>
          <p>Collect samples until the exit opens, then reach it. Tracers repeat the same route. Timed fields switch on in a steady rhythm. A junction is a revolving door: a cross of four arms on a grid corner. Push against one of its arms and keep pushing, and it turns a quarter turn the way you push, carrying whatever is in its pockets: you, a tracer, a sample.</p>
          <h3>Controls</h3>
          <dl className="ps-controls-list">
            <div><dt>Move</dt><dd>Arrow keys or WASD; on touch screens, the movement pad</dd></div>
            <div><dt>Turn a junction</dt><dd>Keep moving into one of its arms; a ring fills, then it turns</dd></div>
            <div><dt>Pause</dt><dd>Escape or P; or the pause button</dd></div>
            <div><dt>Restart</dt><dd>R; or the restart button</dd></div>
          </dl>
          <h3>What you will see</h3>
          <ul>
            <li><strong>You</strong>: a filled circle with an orange ring.</li>
            <li><strong>Tracers</strong>: arrowheads pointing the way they travel, with a dotted line showing where they go next.</li>
            <li><strong>Junctions</strong>: a cross of four arms with an orange pivot and a dotted circle showing the turn. A dashed ring appears when one is within reach; a solid orange ring fills while you push, with an arrowhead showing which way it will turn.</li>
            <li><strong>Samples</strong>: hollow diamonds.</li>
            <li><strong>Timed fields</strong>: dashed squares. Sparse hatching warns they are about to switch on; dense crosshatching means active.</li>
            <li><strong>Exit</strong>: a broken circle that closes when it opens.</li>
          </ul>
          <p>Some things are not explained here. Every one of them follows the same rules, and none is needed to finish a level. The System index records operations and discoveries as you find them.</p>
          <p>If you are stuck, hints appear after a while, or ask for one from the pause menu. The Field log keeps a snapshot of every outcome, including the ones that end early, and your personal standings: best time, fewest actions, and how many different ways through you have found. Records stay on your device.</p>
          <p>Settings include sound and volume, reduced motion, game speed, path previews and bolder lines.</p>
        </section>
        <section className="ps-about" aria-labelledby="about-heading">
          <h2 id="about-heading">About this prototype</h2>
          <p>An original game in development, inspired by the timing and pattern-reading of classic arcade navigation games. It is meant to reward noticing, testing and revising: what the game tells you is a description of the system, and not always the whole of it. It has three test levels (000–010). It is not published, and it is not yet tested with players.</p>
          <p>Known limits: it is a real-time game and is not yet playable with a screen reader alone.</p>
        </section>
      </main>
    </div>
  )
}
