import { NextResponse } from 'next/server'

const MAX_BYTES = 32_768

/** Bound streamed bodies as well as declared content lengths. */
export async function readSyncBody(request: Request): Promise<
  { body: Record<string, unknown>; error?: never } | { error: NextResponse; body?: never }
> {
  const tooLarge = () => ({ error: NextResponse.json({ error: 'Request too large' }, { status: 413 }) })
  if (Number(request.headers.get('content-length')) > MAX_BYTES) return tooLarge()
  const reader = request.body?.getReader()
  if (!reader) return { error: NextResponse.json({ error: 'Missing body' }, { status: 400 }) }
  try {
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_BYTES) {
        void reader.cancel().catch(() => {})
        return tooLarge()
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    const body: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { error: NextResponse.json({ error: 'Missing body' }, { status: 400 }) }
    }
    return { body: body as Record<string, unknown> }
  } catch {
    return { error: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  } finally {
    reader.releaseLock()
  }
}
