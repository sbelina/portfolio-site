import { readFile, writeFile } from 'node:fs/promises'
const reading=await readFile('src/reading/reading.css','utf8')
const diagram=await readFile('src/visuals/assumed-observed.css','utf8')
const note=await readFile('src/components/experiment-note.css','utf8')
const navigation=await readFile('src/components/public-navigation.css','utf8')
await writeFile('dist-studio/preview.css',reading.replaceAll(/@import[^;]+;/g,'')+'\n'+diagram+'\n'+note+'\n'+navigation+'\n.preview-status {padding:1rem;border-bottom:1px solid #b9a3ed;overflow-wrap:anywhere;}')
