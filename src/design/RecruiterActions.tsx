import React from 'react'
import { recruiterContact } from '../content/recruiter'
import { ExternalArrow } from './ExternalArrow'
import { publicPath } from '../public-path'

/** Repeated, plain actions so a hiring reader can act from any point. The address stays visible for viewers where mailto fails. */
export function RecruiterActions({ label }: { label: string }) {
  const { email, linkedin, resumeHref } = recruiterContact
  return <div className="pc-actions" role="group" aria-label={label}>
    <a href={`mailto:${email}`}>Email me <span className="pc-actions-address">{email}</span></a>
    <a href={linkedin}>LinkedIn <ExternalArrow/></a>
    {resumeHref ? <a href={publicPath(resumeHref)}>Download résumé (PDF)</a> : null}
  </div>
}
