/** Minimal type for the Workers runtime module used by worker/contact.ts (no workers-types dependency). */
declare module 'cloudflare:email' {
  export class EmailMessage {
    constructor(from: string, to: string, raw: string | ReadableStream)
    readonly from: string
    readonly to: string
  }
}
