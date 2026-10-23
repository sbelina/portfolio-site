export type HomeReading = {
  fixture: boolean
  entries: { id: string; path: string; title: string; summary: string }[]
  fragmentRedirects: Record<string, string>
}

export const emptyHomeReading: HomeReading = { fixture: false, entries: [], fragmentRedirects: {} }
