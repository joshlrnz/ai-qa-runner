import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getRunReportDirectory } from '@/runner/run-paths'

export const runtime = 'nodejs'

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.zip': 'application/zip'
}

type RouteContext = {
  params: Promise<{
    runId: string
    path?: string[]
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { runId, path: requestedSegments } = await context.params

  try {
    const reportDirectory = getRunReportDirectory(runId)
    const requestedPath = requestedSegments?.length ? requestedSegments.join('/') : 'index.html'
    const filePath = path.resolve(reportDirectory, requestedPath)
    const reportPrefix = `${path.resolve(reportDirectory)}${path.sep}`

    if (!filePath.startsWith(reportPrefix)) {
      return new Response('Invalid report path', { status: 400 })
    }

    const contents = await readFile(filePath)
    const contentType = contentTypes[path.extname(filePath)] ?? 'application/octet-stream'

    return new Response(new Uint8Array(contents), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': contentType
      }
    })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return new Response('Report file not found', { status: 404 })
    }

    const message = error instanceof Error ? error.message : 'Unable to read report'
    return new Response(message, { status: 400 })
  }
}
