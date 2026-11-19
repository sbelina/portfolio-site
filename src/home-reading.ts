export type HomeReading = {
  fixture: boolean
  entries: { id: string; path: string; title: string; summary: string; brief?: { tension: string; call: string; result: string; evidence: string } }[]
  fragmentRedirects: Record<string, string>
}

export const emptyHomeReading: HomeReading = { fixture: false, entries: [], fragmentRedirects: {} }
