/**
 * Monthly usage counts from Workers Analytics Engine (see worker/count.ts). Prints totals per event and
 * page; there is nothing per person to print. Needs an API token with Account Analytics read access:
 *   CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… npx tsx scripts/counts-report.ts [days]
 */
const account = process.env.CLOUDFLARE_ACCOUNT_ID, token = process.env.CLOUDFLARE_API_TOKEN
const days = Math.min(Math.max(Number(process.argv[2] ?? 30) || 30, 1), 90)
if (!account || !token) throw new Error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN')
const sql = `SELECT blob1 AS event, blob2 AS page, blob3 AS detail, SUM(_sample_interval) AS count
  FROM producing_curiosity_counts WHERE timestamp > NOW() - INTERVAL '${days}' DAY
  GROUP BY event, page, detail ORDER BY count DESC LIMIT 500`
const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/analytics_engine/sql`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: sql })
if (!response.ok) throw new Error(`Analytics Engine answered ${response.status}: ${await response.text()}`)
const { data } = await response.json() as { data: { event: string; page: string; detail: string; count: string }[] }
console.log(`Counts, last ${days} days (sampled totals; no visitor-level data exists)\n`)
const byEvent = new Map<string, number>()
for (const row of data) byEvent.set(row.event, (byEvent.get(row.event) ?? 0) + Number(row.count))
for (const [event, total] of [...byEvent].sort((a, b) => b[1] - a[1])) console.log(`${String(total).padStart(7)}  ${event}`)
console.log('\nBy page and detail:')
for (const row of data) console.log(`${String(row.count).padStart(7)}  ${row.event.padEnd(20)} ${row.page}${row.detail ? `  (${row.detail})` : ''}`)
export {}
