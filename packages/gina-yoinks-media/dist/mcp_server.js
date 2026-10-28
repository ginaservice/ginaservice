#!/usr/bin/env node
import {
  GINA_AST_WATERMARK,
  GinaYoinksSecurityGuard,
  SOVEREIGN_SUPERVISORS,
  runHeadlessDownload
} from "./chunk-4TX6FNDZ.js";

// src/mcp_server.ts
import os from "os";
import path from "path";
import readline from "readline";
import { pathToFileURL } from "url";
var GINA_YOINK_MEDIA_MCP_TOOL = {
  name: "gina_yoink_media",
  description: "GINASERVICE Sovereign Media Downloader (GINA-SEC-7L-2026 | SEC-L1/TS-L1). Safely downloads reference videos (MP4 --best) or audio (--mp3) from YouTube, X/Twitter, Instagram, TikTok, and Threads for DIR-5 Marketing Swarm with SSRF/Command-Injection quarantine (Theta < 0.85) and SHA-256 WORM audit logging.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "Target media URL (https:// or http://) to sanitize and download."
      },
      mode: {
        type: "string",
        enum: ["best", "mp3"],
        default: "best",
        description: 'Download highest quality MP4 video ("best") or extract MP3 audio ("mp3").'
      },
      outDir: {
        type: "string",
        description: "Output directory for Google Drive archiving or sandbox storage (defaults to /tmp/yoinks-downloads or ~/Downloads)."
      },
      agentId: {
        type: "string",
        default: "GINA-DIR5-MEDIA-001",
        description: "Sovereign agent identifier for WORM audit attribution."
      },
      wormLog: {
        type: "boolean",
        default: true,
        description: "Emit SHA-256 WORM audit record for audit-stream@ginaservice.com."
      }
    },
    required: ["url"]
  }
};
async function handleGinaYoinkMediaToolCall(input) {
  const agentId = input.agentId ?? "GINA-DIR5-MEDIA-001";
  const mode = input.mode ?? "best";
  const outDir = input.outDir ? path.resolve(input.outDir) : process.env.YOINKS_SANDBOX_DIR ? path.resolve(process.env.YOINKS_SANDBOX_DIR) : path.join(os.homedir(), "Downloads");
  const runtimeFp = GinaYoinksSecurityGuard.verifyRuntimeFingerprint(agentId);
  if (!runtimeFp.verified) {
    throw new Error("[GINA-SEC-L1] Runtime fingerprint verification failed.");
  }
  const siacpSession = GinaYoinksSecurityGuard.createSiacpEphemeralSession(agentId);
  GinaYoinksSecurityGuard.enforceBellLaPadulaBiba("SEC-L1/TS-L1", "SEC-L1/TS-L1", "write");
  const astLock = GinaYoinksSecurityGuard.acquireAstSemanticLock();
  const { filepath, auditRecord } = await runHeadlessDownload({
    url: input.url,
    mode,
    outDir,
    agentId
  });
  return {
    status: "success",
    filepath,
    auditRecord,
    astLock,
    siacpSession,
    watermark: GINA_AST_WATERMARK
  };
}
async function processMcpJsonRpcMessage(request) {
  const { id, method, params } = request;
  if (method === "notifications/initialized" || id === void 0) {
    return null;
  }
  try {
    if (method === "initialize") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "gina-yoinks-media-mcp",
            version: "1.0.0",
            securityProtocol: GINA_AST_WATERMARK.securityProtocol,
            supervisors: SOVEREIGN_SUPERVISORS
          }
        }
      };
    }
    if (method === "ping") {
      return {
        jsonrpc: "2.0",
        id,
        result: {}
      };
    }
    if (method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: [GINA_YOINK_MEDIA_MCP_TOOL]
        }
      };
    }
    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments ?? {};
      if (toolName !== GINA_YOINK_MEDIA_MCP_TOOL.name) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Unknown MCP tool: ${String(toolName)}`
          }
        };
      }
      const output = await handleGinaYoinkMediaToolCall(toolArgs);
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(output, null, 2)
            }
          ],
          isError: false
        }
      };
    }
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`
      }
    };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : String(error)
          }
        ],
        isError: true
      }
    };
  }
}
function startMcpStdioServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    terminal: false
  });
  rl.on("line", async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const request = JSON.parse(trimmed);
      const response = await processMcpJsonRpcMessage(request);
      if (response) {
        process.stdout.write(`${JSON.stringify(response)}
`);
      }
    } catch (error) {
      const errResponse = {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: `Parse error: ${error instanceof Error ? error.message : String(error)}`
        }
      };
      process.stdout.write(`${JSON.stringify(errResponse)}
`);
    }
  });
}
var isMainModule = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMainModule) {
  startMcpStdioServer();
}
export {
  GINA_YOINK_MEDIA_MCP_TOOL,
  handleGinaYoinkMediaToolCall,
  processMcpJsonRpcMessage,
  startMcpStdioServer
};
