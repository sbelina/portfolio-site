/**
 * Turn a deep-dive password into the stored hash. Type the password when asked; nothing is saved.
 *   npm run deep-dive:hash
 * Then: npx wrangler secret put DEEP_DIVE_PASSWORD_HASH   (paste the printed line)
 */
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { createInterface } from 'node:readline/promises'

// 100,000 is the most Cloudflare Workers allow for PBKDF2. If logins fail on a plan with a low
// CPU limit, regenerate with fewer, e.g. `npm run deep-dive:hash -- --iterations 20000`.
const flag = process.argv.indexOf('--iterations')
const iterations = flag >= 0 ? Number(process.argv[flag + 1]) : 100000
if (!Number.isInteger(iterations) || iterations < 10000 || iterations > 100000) { console.error('--iterations must be 10000–100000.'); process.exit(1) }
const readline = createInterface({ input: process.stdin, output: process.stderr })
const password = (await readline.question('Deep-dive password (at least 12 characters): ')).trim()
readline.close()
if (password.length < 12) { console.error('Use at least 12 characters.'); process.exit(1) }
const salt = randomBytes(16)
const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256')
console.log(`pbkdf2-sha256$${iterations}$${salt.toString('hex')}$${hash.toString('hex')}`)
