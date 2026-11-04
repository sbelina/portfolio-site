# Preserved public builds

`2026-11-04-418efb7/` preserves the reviewed build from main418efb7. `original/` is byte-exact; `review/` is a path-scoped replay with a separate archive notice and noindex metadata. `capture.json` distinguishes the two and records file checksums. Only `review/` is mounted for public browser review; originals, source and agent records are not copied to public output.

Never edit historical bundles in place. Current builds verify their checksums and copy frozen bytes. Adding history requires a new version, privacy checks and explicit catalog selection. Do not nest prior archives into later captures. See [implementation and recovery instructions](../docs/codex/BUILD-ARCHIVE-AND-INDEX.md).
