export type HomeReading = {
  fixture: boolean
  entries: import('./content/primary-evidence').InvestigationSummary[]
  fragmentRedirects: Record<string, string>
}

export const emptyHomeReading: HomeReading = { fixture: false, entries: [], fragmentRedirects: {} }
