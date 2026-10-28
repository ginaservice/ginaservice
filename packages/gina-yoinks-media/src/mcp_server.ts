import os from 'node:os'
import path from 'node:path'
import readline from 'node:readline'
import {pathToFileURL} from 'node:url'
import {runHeadlessDownload} from './lib/ytdlp.js'
import {
  GINA_AST_WATERMARK,
  GinaYoinksSecurityGuard,
  SOVEREIGN_SUPERVISORS,
  type YoinksAuditRecord,
} from './security/gina_yoinks_guard.js'

export interface GinaYoinkMediaToolInput {
  url: string
  mode?: 'best' | 'mp3'
  outDir?: string
  agentId?: string
  wormLog?: boolean
}

export interface GinaYoinkMediaToolOutput {
  status: 'success'
  filepath: string
  auditRecord: YoinksAuditRecord
  astLock: ReturnType<typeof GinaYoinksSecurityGuard.acquireAstSemanticLock>
  siacpSession: ReturnType<typeof GinaYoinksSecurityGuard.createSiacpEphemeralSession>
  watermark: typeof GINA_AST_WATERMARK
}

export const GINA_YOINK_MEDIA_MCP_TOOL = {
  name: 'gina_yoink_media',
  description:
    'GINASERVICE Sovereign Media Downloader (GINA-SEC-7L-2026 | SEC-L1/TS-L1). Safely downloads reference videos (MP4 --best) or audio (--mp3) from YouTube, X/Twitter, Instagram, TikTok, and Threads for DIR-5 Marketing Swarm with SSRF/Command-Injection quarantine (Theta < 0.85) and SHA-256 WORM audit logging.',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Target media URL (https:// or http://) to sanitize and download.',
      },
      mode: {
        type: 'string',
        enum: ['best', 'mp3'],
        default: 'best',
        description: 'Download highest quality MP4 video ("best") or extract MP3 audio ("mp3").',
      },
      outDir: {
        type: 'string',
        description: 'Output directory for Google Drive archiving or sandbox storage (defaults to /tmp/yoinks-downloads or ~/Downloads).',
      },
      agentId: {
        type: 'string',
        default: 'GINA-DIR5-MEDIA-001',
        description: 'Sovereign agent identifier for WORM audit attribution.',
      },
      wormLog: {
        type: 'boolean',
        default: true,
        description: 'Emit SHA-256 WORM audit record for audit-stream@ginaservice.com.',
      },
    },
    required: ['url'],
  },
} as const

/**
 * Executes the `gina_yoink_media` MCP tool under GINA-SEC-7L-2026 Layers 1-7 supervision.
 */
export async function handleGinaYoinkMediaToolCall(
  input: GinaYoinkMediaToolInput,
): Promise<GinaYoinkMediaToolOutput> {
  const agentId = input.agentId ?? 'GINA-DIR5-MEDIA-001'
  const mode = input.mode ?? 'best'
  const outDir = input.outDir
    ? path.resolve(input.outDir)
    : process.env.YOINKS_SANDBOX_DIR
      ? path.resolve(process.env.YOINKS_SANDBOX_DIR)
      : path.join(os.homedir(), 'Downloads')

  // Layer 1-5 Pre-Flight Verification
  const runtimeFp = GinaYoinksSecurityGuard.verifyRuntimeFingerprint(agentId)
  if (!runtimeFp.verified) {
    throw new Error('[GINA-SEC-L1] Runtime fingerprint verification failed.')
  }
  const siacpSession = GinaYoinksSecurityGuard.createSiacpEphemeralSession(agentId)
  GinaYoinksSecurityGuard.enforceBellLaPadulaBiba('SEC-L1/TS-L1', 'SEC-L1/TS-L1', 'write')
  const astLock = GinaYoinksSecurityGuard.acquireAstSemanticLock()

  // Layer 4 URL Quarantine Gate + Download + Layer 7 WORM Audit
  const {filepath, auditRecord} = await runHeadlessDownload({
    url: input.url,
    mode,
    outDir,
    agentId,
  })

  return {
    status: 'success',
    filepath,
    auditRecord,
    astLock,
    siacpSession,
    watermark: GINA_AST_WATERMARK,
  }
}

interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?: string | number | null
  method: string
  params?: Record<string, unknown>
}

/**
 * Processes a single MCP JSON-RPC 2.0 message.
 */
export async function processMcpJsonRpcMessage(request: JsonRpcRequest): Promise<Record<string, unknown> | null> {
  const {id, method, params} = request

  if (method === 'notifications/initialized' || id === undefined) {
    return null
  }

  try {
    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'gina-yoinks-media-mcp',
            version: '1.0.0',
            securityProtocol: GINA_AST_WATERMARK.securityProtocol,
            supervisors: SOVEREIGN_SUPERVISORS,
          },
        },
      }
    }

    if (method === 'ping') {
      return {
        jsonrpc: '2.0',
        id,
        result: {},
      }
    }

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: [GINA_YOINK_MEDIA_MCP_TOOL],
        },
      }
    }

    if (method === 'tools/call') {
      const toolName = params?.name as string | undefined
      const toolArgs = (params?.arguments ?? {}) as unknown as GinaYoinkMediaToolInput

      if (toolName !== GINA_YOINK_MEDIA_MCP_TOOL.name) {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Unknown MCP tool: ${String(toolName)}`,
          },
        }
      }

      const output = await handleGinaYoinkMediaToolCall(toolArgs)
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(output, null, 2),
            },
          ],
          isError: false,
        },
      }
    }

    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
    }
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: error instanceof Error ? error.message : String(error),
          },
        ],
        isError: true,
      },
    }
  }
}

/**
 * Starts the stdio MCP Server for Google Antigravity integration.
 */
export function startMcpStdioServer(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
  })

  rl.on('line', async line => {
    const trimmed = line.trim()
    if (!trimmed) return
    try {
      const request = JSON.parse(trimmed) as JsonRpcRequest
      const response = await processMcpJsonRpcMessage(request)
      if (response) {
        process.stdout.write(`${JSON.stringify(response)}\n`)
      }
    } catch (error) {
      const errResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: `Parse error: ${error instanceof Error ? error.message : String(error)}`,
        },
      }
      process.stdout.write(`${JSON.stringify(errResponse)}\n`)
    }
  })
}

const isMainModule =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1]!)).href

if (isMainModule) {
  startMcpStdioServer()
}
