import React from 'react'
import type { Blueprint } from '../content/investigation'

const markLabel = { failure: 'Failure point', change: 'Changed' } as const
const markSymbol = { failure: '⚠', change: '✦' } as const

function View({ blueprint, view }: { blueprint: Blueprint; view: Blueprint['views'][number] }) {
  const titleId = `blueprint-${view.id}-title`
  return <div className="blueprint-view" data-view={view.id}>
    <h3 id={titleId}>{view.label}</h3>
    <p className="blueprint-summary">{view.summary}</p>
    <div className="blueprint-scroll" role="region" tabIndex={0} aria-labelledby={titleId}>
      <table>
        <caption className="blueprint-sr">{blueprint.title}: {view.label}. Rows are who acts; columns are stages, in order.</caption>
        <thead><tr><td/>{view.stages.map((stage, index) => <th key={stage.label} scope="col"><span className="blueprint-step">{index + 1}</span> {stage.label}{stage.note ? <em className="blueprint-note">{stage.note}</em> : null}</th>)}</tr></thead>
        <tbody>{blueprint.lanes.map(lane => <React.Fragment key={lane.id}>
          <tr data-lane={lane.id}>
            <th scope="row">{lane.label}</th>
            {view.stages.map(stage => <td key={stage.label}>{stage.cells.filter(cell => cell.lane === lane.id).map(cell =>
              <p key={cell.text} data-mark={cell.mark}>{cell.mark ? <><span aria-hidden="true" className="blueprint-symbol">{markSymbol[cell.mark]}</span> <strong>{markLabel[cell.mark]}:</strong> </> : null}{cell.text}</p>)}</td>)}
          </tr>
          {lane.lineAfter ? <tr className="blueprint-line"><th colSpan={view.stages.length + 1} scope="colgroup">{lane.lineAfter}</th></tr> : null}
        </React.Fragment>)}</tbody>
      </table>
    </div>
    <ol className="blueprint-stages" aria-label={`${view.label}, stage by stage`}>{view.stages.map((stage, index) => <li key={stage.label}>
      <h4><span className="blueprint-step">{index + 1}</span> {stage.label}{stage.note ? <em className="blueprint-note">{stage.note}</em> : null}</h4>
      <dl>{blueprint.lanes.filter(lane => stage.cells.some(cell => cell.lane === lane.id)).map(lane => <div key={lane.id} data-lane={lane.id}>
        <dt>{lane.label}</dt>
        {stage.cells.filter(cell => cell.lane === lane.id).map(cell => <dd key={cell.text} data-mark={cell.mark}>{cell.mark ? <><span aria-hidden="true" className="blueprint-symbol">{markSymbol[cell.mark]}</span> <strong>{markLabel[cell.mark]}:</strong> </> : null}{cell.text}</dd>)}
      </div>)}</dl>
    </li>)}</ol>
  </div>
}

/**
 * A before/after service blueprint. Both views are in the initial HTML. Where the browser supports
 * :has(), a native radio pair shows one view at a time; elsewhere (and when printing) both are shown
 * one after the other, so nothing depends on JavaScript or on the switch. Wide screens get the
 * lane-by-stage table; narrow screens get the same content as a stage-by-stage list.
 */
export function ServiceBlueprint({ blueprint }: { blueprint: Blueprint }) {
  return <section className="blueprint" id="blueprint" aria-labelledby="blueprint-title">
    <p className="blueprint-kicker">Service blueprint · before and after</p>
    <h2 id="blueprint-title">{blueprint.title}</h2>
    <p>{blueprint.caption}</p>
    <fieldset className="blueprint-switch"><legend>Show</legend>
      {blueprint.views.map(view => <label key={view.id}><input type="radio" name="blueprint-view" value={view.id} defaultChecked={view.id === 'after'}/> {view.label}</label>)}
    </fieldset>
    {[...blueprint.views].reverse().map(view => <View key={view.id} blueprint={blueprint} view={view}/>)}
    <ul className="blueprint-key" aria-label="Key">
      <li><span aria-hidden="true" className="blueprint-symbol" data-mark="failure">⚠</span> Failure point: where a problem could enter or was found</li>
      <li><span aria-hidden="true" className="blueprint-symbol" data-mark="change">✦</span> Changed: what is different after</li>
    </ul>
    <p className="blueprint-provenance">{blueprint.provenance}</p>
  </section>
}
