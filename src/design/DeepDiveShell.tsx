import React from 'react'
import { CurrentShell } from './CurrentShell'

/**
 * The public page frame for deep dives: site header, navigation and footer, with an empty body.
 * The Worker fills the body after checking the password. This file holds no private content.
 */
export function DeepDiveShell() {
  return <CurrentShell route="/deep-dive/"><article className="pc-document deep-dive"><div data-deep-dive-body="">DEEP_DIVE_BODY</div></article></CurrentShell>
}
