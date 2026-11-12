import { readFile, writeFile } from 'node:fs/promises'
// Preview responses are protected, script-free SSR. Include the same reading
// and adopted-design styles explicitly instead of leaving unresolved imports.
const files = [
  'src/reading/reading.css', 'src/design/tokens.css', 'src/design/foundation.css',
  'src/visuals/investigation-visual.css', 'src/visuals/assumed-observed.css',
  'src/visuals/case-study.css', 'src/components/experiment-note.css',
  'src/components/public-navigation.css',
]
const styles = await Promise.all(files.map(file => readFile(file, 'utf8')))
await writeFile('dist-studio/preview.css', styles.map(css => css.replaceAll(/@import[^;]+;/g, '')).join('\n') +
  '\n.preview-status {padding:1rem;border-bottom:1px solid var(--line);background:var(--paper);color:var(--ink);overflow-wrap:anywhere;}')
