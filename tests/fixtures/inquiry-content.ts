import type { ContentStore, Entry } from '../../src/content/model'
import {illustrationEntries,illustrationVerse,inquiryIllustrationStore} from '../../src/inquiry-space/illustration'

export const inquiryFixtureMarker = 'INQUIRY_SPACE_FIXTURE_14NOV'
export const inquiryVerse = illustrationVerse
// One source for invented writing; unpublished fixtures add only test metadata.
export const inquiryEntries:Entry[]=structuredClone(illustrationEntries).map(entry=>({
  ...entry,slug:entry.slug.replace('illustration-','fixture-'),title:'Fixture: '+entry.title[0].toLowerCase()+entry.title.slice(1),createdAt:'2000-01-01T00:00:00Z',updatedAt:'2000-01-01T00:00:00Z',
}))
export const inquiryFixtureStore:ContentStore={
  entries:[...inquiryEntries, {...inquiryEntries[0],revision:2,visibility:'restricted',editorialState:'draft',title:'PRIVATE_INQUIRY_DRAFT_14NOV',blocks:[{id:'b2000000-0000-4000-8000-000000000004',type:'prose',markdown:'PRIVATE_INQUIRY_BODY_14NOV'}]}],
  relationships:structuredClone(inquiryIllustrationStore.relationships),
  evidence:[],assets:[],aliases:[],
}
