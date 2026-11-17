/** Test-only D1 stand-in on Node's built-in SQLite. Mirrors the subset of D1 the Worker uses. */
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import type { Database, Statement } from '../thoughts/store'

export function memoryD1(migration = 'migrations-thoughts/0001_thoughts.sql'): Database & { raw: DatabaseSync } {
  const raw = new DatabaseSync(':memory:')
  raw.exec('PRAGMA foreign_keys = ON;')
  raw.exec(readFileSync(migration, 'utf8'))
  const statement = (sql: string, values: unknown[] = []): Statement => ({
    bind: (...next: unknown[]) => statement(sql, next),
    first: async <T>() => (raw.prepare(sql).get(...(values as never[])) as T) ?? null,
    all: async <T>() => ({ results: raw.prepare(sql).all(...(values as never[])) as T[] }),
    run: async () => { const result = raw.prepare(sql).run(...(values as never[])); return { meta: { changes: Number(result.changes) } } },
  })
  return {
    raw,
    prepare: (sql: string) => statement(sql),
    batch: async (statements: Statement[]) => {
      raw.exec('BEGIN')
      try { const results = []; for (const item of statements) results.push(await item.run()); raw.exec('COMMIT'); return results }
      catch (error) { raw.exec('ROLLBACK'); throw error }
    },
  }
}

/** A Google Voice text notification as Gmail forwards it. Numbers are fictional (555-01xx). */
export function voiceEmail({ body, sender = '5155550123', voice = '5155550188', messageId = '<abc@mail.gmail.com>', from }: { body: string; sender?: string; voice?: string; messageId?: string; from?: string }) {
  const qp = body.replace(/=/g, '=3D').replace(/’/g, '=E2=80=99')
  return [
    `From: ${from ?? `"(${sender.slice(0, 3)}) ${sender.slice(3, 6)}-${sender.slice(6)} (SMS)" <1${voice}.1${sender}.AbCdEf123@txt.voice.google.com>`}`,
    'To: sami.example@gmail.com',
    `Subject: New text message from (${sender.slice(0, 3)}) ${sender.slice(3, 6)}-${sender.slice(6)}`,
    `Message-ID: ${messageId}`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="b1"',
    '',
    '--b1',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    qp,
    '',
    'To respond to this text message, reply to this email or visit Google Voice.',
    '',
    'YOUR ACCOUNT <https://voice.google.com> HELP CENTER <https://support.google.com/voice#topic=3D1707989>',
    '--b1',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    `<p>${body}</p>`,
    '--b1--',
    '',
  ].join('\r\n')
}

export function emailMessage(raw: string, from = 'sami.example+caf_=thoughts=example.com@gmail.com') {
  let rejected: string | undefined
  const bytes = new TextEncoder().encode(raw)
  return {
    message: { from, to: 'thoughts@example.com', headers: new Headers(), rawSize: bytes.byteLength, raw: new Blob([bytes]).stream(), setReject: (reason: string) => { rejected = reason } },
    rejected: () => rejected,
  }
}
