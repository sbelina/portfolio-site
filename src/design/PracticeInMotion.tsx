import React, { useEffect, useRef, useState } from 'react'
import { practiceMoves } from './PracticeMoves'
import { Stressed } from '../content/emphasis'
import { FigureLegend } from './CaseFigures'
import { count } from '../analytics'

/**
 * Test. Show. Enable. in motion (owner direction, 23 November 2026): the three moves as one figure
 * that changes state, walked through one published case in its own approved words.
 *
 *   Test    many explanations pass a check (the sage lens); one holds.
 *   Show    two things taken for one are pulled apart, with the thread between them.
 *   Enable  what held is carried to the people who act on it.
 *
 * Without JavaScript all three are shown, each with its figure at rest. After hydration a native radio
 * group chooses the move, and an optional walk-through steps once through all three; it stops on any
 * choice and is not offered under reduced motion. The figure is conceptual and encodes no data.
 */
export type PracticeExample = { label: string; href: string; left: string; right: string; test: string; show: string; enable: string }
type Step = 0 | 1 | 2

function Scene({ step, example }: { step: Step; example?: PracticeExample }) {
  if (step === 0) return <g className="pc-tse-scene" data-scene="test">
    {[40, 80, 120, 160, 200].map((y, i) => <path key={y} className={i === 2 ? 'pc-tse-held' : 'pc-tse-strand'} d={i === 2 ? `M20 ${y} C 120 ${y}, 160 120, 240 120 S 380 120, 460 120` : `M20 ${y} C 110 ${y}, 170 ${(y + 120) / 2}, 228 ${(y + 120) / 2 + (y < 120 ? -8 : 8)}`}/>)}
    <g className="pc-tse-lens"><ellipse cx="240" cy="120" rx="16" ry="62"/></g>
    <text x="240" y="222" textAnchor="middle">A CHECK</text><text x="20" y="222">EXPLANATIONS</text><text x="460" y="108" textAnchor="end">WHAT HELD</text>
  </g>
  if (step === 1) return <g className="pc-tse-scene" data-scene="show">
    <line className="pc-tse-thread" x1="150" y1="120" x2="330" y2="120"/>
    <circle className="pc-tse-gap" cx="240" cy="120" r="14"/>
    <g className="pc-tse-node pc-tse-node--left"><circle cx="240" cy="120" r="9"/><text x="240" y="152" textAnchor="middle">{(example?.left ?? 'Observed').toUpperCase()}</text></g>
    <g className="pc-tse-node pc-tse-node--right"><circle cx="240" cy="120" r="9" className="pc-tse-turn"/><text x="240" y="98" textAnchor="middle">{(example?.right ?? 'Assumed').toUpperCase()}</text></g>
    <text x="240" y="222" textAnchor="middle">RELATED. NOT EQUIVALENT.</text>
  </g>
  return <g className="pc-tse-scene" data-scene="enable">
    <path className="pc-tse-held" d="M20 120 H 220"/>
    {[50, 96, 144, 190].map((y, i) => <g key={y} className="pc-tse-reach" style={{ ['--i' as string]: i } as React.CSSProperties}>
      <path className="pc-tse-branch" d={`M220 120 C 300 120, 330 ${y}, 410 ${y}`}/>
      <circle cx="410" cy={y} r="7"/>
    </g>)}
    <circle className="pc-tse-hub" cx="220" cy="120" r="6"/>
    <text x="20" y="108">WHAT HELD</text><text x="440" y="222" textAnchor="end">THE PEOPLE WHO ACT ON IT</text>
  </g>
}

const legends = [
  [{ kind: 'inferred', label: 'An explanation' }, { kind: 'check', label: 'A check' }, { kind: 'established', label: 'What held' }],
  [{ kind: 'established', label: 'What was measured' }, { kind: 'turn', label: 'What it was taken for' }, { kind: 'thread', label: 'What connects them' }],
  [{ kind: 'established', label: 'What held' }, { kind: 'check', label: 'The people who act on it' }],
] as const

function Figure({ step, example }: { step: Step; example?: PracticeExample }) {
  return <svg className="pc-tse-svg" viewBox="0 0 480 240" aria-hidden="true" focusable="false"><Scene step={step} example={example}/></svg>
}

export function PracticeInMotion({ example }: { example?: PracticeExample }) {
  const [enhanced, setEnhanced] = useState(false)
  const [step, setStep] = useState<Step>(0)
  const [playing, setPlaying] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => { setEnhanced(true); setCanPlay(!matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])
  useEffect(() => {
    if (!playing) return
    timer.current = window.setTimeout(() => { if (step < 2) setStep((step + 1) as Step); else setPlaying(false) }, 3800)
    return () => window.clearTimeout(timer.current)
  }, [playing, step])
  const choose = (value: Step) => { setPlaying(false); setStep(value); count('practice-move', practiceMoves[value].title) }
  const exampleText = (index: Step) => example ? [example.test, example.show, example.enable][index] : undefined

  if (!enhanced) return <ol className="pc-tse-static">{practiceMoves.map((move, index) => <li key={move.title}>
    <Figure step={index as Step} example={example}/>
    <h3>{move.title}<span aria-hidden="true">.</span></h3><p>{move.text}</p>
    {exampleText(index as Step) ? <p className="pc-tse-example"><span className="pc-tse-label">In the {example!.label.toLowerCase()} case study:</span> <Stressed text={exampleText(index as Step)!}/></p> : null}
    <details className="pc-layer"><summary>Questions behind {move.title}</summary><ul>{move.questions.map(question => <li key={question}>{question}</li>)}</ul></details>
  </li>)}</ol>

  const move = practiceMoves[step]
  return <div className="pc-tse" data-step={step}>
    <fieldset className="pc-tse-controls"><legend className="pc-sr-only">Choose a move</legend>
      {practiceMoves.map((item, index) => <label key={item.title}><input type="radio" name="pc-tse-move" checked={step === index} onChange={() => choose(index as Step)}/><span className="pc-tse-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span> {item.title}</label>)}
      {canPlay ? <button type="button" className="pc-tse-play" aria-pressed={playing} onClick={() => { if (playing) setPlaying(false); else { setStep(0); setPlaying(true); count('practice-play') } }}>{playing ? 'Stop' : 'Play all three'}</button> : null}
    </fieldset>
    <div className="pc-tse-stage">
      <div className="pc-tse-figure pc-night" data-surface="observatory">
        <Figure key={step} step={step} example={example}/>
        <span className="pc-tse-progress" aria-hidden="true">{[0, 1, 2].map(index => <i key={index} data-on={index <= step || undefined}/>)}</span>
      </div>
      <div className="pc-tse-text" aria-live="polite">
        <h3>{move.title}<span aria-hidden="true">.</span></h3>
        <p className="pc-tse-move">{move.text}</p>
        {exampleText(step) ? <p className="pc-tse-example"><span className="pc-tse-label">In the {example!.label.toLowerCase()} case study:</span> <Stressed text={exampleText(step)!}/> <a href={example!.href}>Read it <span aria-hidden="true">→</span></a></p> : null}
        <p className="pc-tse-questions"><span className="pc-tse-label">Questions behind it:</span> {move.questions.join(' ')}</p>
      </div>
    </div>
    <FigureLegend items={legends[step]}/>
  </div>
}
