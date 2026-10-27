import {
  GINA_AST_WATERMARK,
  GinaYoinksSecurityGuard,
  SOVEREIGN_SUPERVISORS
} from "./chunk-STU53HSG.js";

// src/mcp_server.ts
import os2 from "os";
import path2 from "path";
import readline from "readline";
import { pathToFileURL } from "url";

// src/lib/ytdlp.ts
import { spawn } from "child_process";
import { createWriteStream } from "fs";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

// src/lib/format.ts
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

// src/lib/ytdlp.ts
var YOINKS_DIR = path.join(os.homedir(), ".yoinks", "bin");
var RELEASE_BASE = "https://github.com/yt-dlp/yt-dlp/releases/latest/download";
function ytDlpAssetName() {
  if (process.platform === "win32") return "yt-dlp.exe";
  if (process.platform === "darwin") return "yt-dlp_macos";
  return process.arch === "arm64" ? "yt-dlp_linux_aarch64" : "yt-dlp_linux";
}
function commandWorks(cmd, args) {
  return new Promise((resolve) => {
    let child;
    try {
      const { sanitizedEnv } = GinaYoinksSecurityGuard.createSanitizedChildEnv();
      child = spawn(cmd, args, { stdio: "ignore", timeout: 1e4, env: sanitizedEnv });
    } catch {
      resolve(false);
      return;
    }
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}
async function ensureYtDlp(onStatus, signal) {
  if (await commandWorks("yt-dlp", ["--version"])) {
    GinaYoinksSecurityGuard.verifyBinaryIntegrity("yt-dlp");
    return "yt-dlp";
  }
  const local = path.join(YOINKS_DIR, process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp");
  if (await commandWorks(local, ["--version"])) {
    GinaYoinksSecurityGuard.verifyBinaryIntegrity(local, process.env.GINA_YTDLP_SHA256);
    return local;
  }
  onStatus("first run: fetching yt-dlp\u2026");
  await fs.mkdir(YOINKS_DIR, { recursive: true });
  const url = `${RELEASE_BASE}/${ytDlpAssetName()}`;
  const { sanitizedUrl } = GinaYoinksSecurityGuard.validateAndSanitizeUrl(url);
  const response = await fetch(sanitizedUrl, { signal });
  if (!response.ok || !response.body) {
    throw new Error(`Could not download yt-dlp (${response.status}). Check your connection and try again.`);
  }
  const tmp = `${local}.download`;
  await pipeline(Readable.fromWeb(response.body), createWriteStream(tmp), { signal });
  await fs.chmod(tmp, 493);
  await fs.rename(tmp, local);
  GinaYoinksSecurityGuard.verifyBinaryIntegrity(local, process.env.GINA_YTDLP_SHA256);
  return local;
}
async function findFfmpeg() {
  if (await commandWorks("ffmpeg", ["-version"])) return void 0;
  try {
    const mod = await import("ffmpeg-static");
    const ffmpegPath = mod.default ?? mod;
    if (ffmpegPath && await commandWorks(ffmpegPath, ["-version"])) {
      GinaYoinksSecurityGuard.verifyBinaryIntegrity(ffmpegPath, process.env.GINA_FFMPEG_SHA256);
      return ffmpegPath;
    }
  } catch {
  }
  return void 0;
}
async function probe(ytdlp, url, signal) {
  const { sanitizedUrl } = GinaYoinksSecurityGuard.validateAndSanitizeUrl(url);
  const { sanitizedEnv } = GinaYoinksSecurityGuard.createSanitizedChildEnv();
  const stdout = await new Promise((resolve, reject) => {
    const child = spawn(ytdlp, ["-J", "--no-playlist", "--no-warnings", sanitizedUrl], {
      signal,
      env: sanitizedEnv
    });
    let out = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => out += chunk);
    child.stderr.on("data", (chunk) => stderr += chunk);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(cleanYtDlpError(stderr) || `yt-dlp exited with code ${code}`));
      } else {
        resolve(out);
      }
    });
  });
  let info;
  try {
    info = JSON.parse(stdout);
  } catch {
    throw new Error("Could not parse video info from yt-dlp.");
  }
  const infoJsonPath = path.join(os.tmpdir(), `yoinks-info-${process.pid}-${Date.now()}.json`);
  await fs.writeFile(infoJsonPath, stdout);
  return { info, infoJsonPath };
}
var MAX_VIDEO_CHOICES = 8;
var BEST_VIDEO_CHOICE = {
  kind: "video",
  label: "best available \xB7 mp4",
  args: ["-f", "bv*+ba/b", "--merge-output-format", "mp4"]
};
var MP3_AUDIO_CHOICE = {
  kind: "audio",
  label: "audio only \xB7 mp3",
  args: ["-f", "ba/b", "-x", "--audio-format", "mp3", "--audio-quality", "0"]
};
function buildChoices(info) {
  const formats = info.formats ?? [];
  const choices = [];
  const audioOnly = formats.filter((f) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none"));
  const bestAudio = [...audioOnly].sort((a, b) => (b.abr ?? b.tbr ?? 0) - (a.abr ?? a.tbr ?? 0))[0];
  const audioSize = bestAudio?.filesize ?? bestAudio?.filesize_approx;
  const videos = formats.filter((f) => f.vcodec && f.vcodec !== "none" && f.height);
  const heights = [...new Set(videos.map((f) => f.height))].sort((a, b) => b - a);
  for (const height of heights.slice(0, MAX_VIDEO_CHOICES)) {
    const candidates = videos.filter((f) => f.height === height);
    const best = [...candidates].sort((a, b) => scoreVideo(b) - scoreVideo(a))[0];
    const muxed = best.acodec && best.acodec !== "none";
    const size = (best.filesize ?? best.filesize_approx ?? 0) + (muxed ? 0 : audioSize ?? 0);
    const sizeLabel = size > 0 ? ` \xB7 ~${formatBytes(size)}` : "";
    choices.push({
      kind: "video",
      label: `${height}p \xB7 mp4${sizeLabel}`,
      args: [
        "-f",
        `bv*[height=${height}]+ba/b[height=${height}]/bv*[height<=${height}]+ba/b`,
        "--merge-output-format",
        "mp4"
      ]
    });
  }
  if (choices.length === 0) {
    choices.push(BEST_VIDEO_CHOICE);
  }
  const audioSizeLabel = audioSize ? ` \xB7 ~${formatBytes(audioSize)}` : "";
  choices.push({
    kind: "audio",
    label: `audio only \xB7 mp3${audioSizeLabel}`,
    args: ["-f", "ba/b", "-x", "--audio-format", "mp3", "--audio-quality", "0"]
  });
  return choices;
}
function scoreVideo(f) {
  let score = f.tbr ?? 0;
  if (f.ext === "mp4") score += 1e4;
  if (f.vcodec?.startsWith("avc")) score += 5e3;
  return score;
}
var PROGRESS_PREFIX = "YOINK|";
var PROGRESS_TEMPLATE = `${PROGRESS_PREFIX}%(progress.downloaded_bytes)s|%(progress.total_bytes)s|%(progress.total_bytes_estimate)s|%(progress.speed)s|%(progress.eta)s`;
var activeChild;
process.on("exit", () => activeChild?.kill("SIGTERM"));
function download(opts, handlers, signal) {
  const { sanitizedUrl } = GinaYoinksSecurityGuard.validateAndSanitizeUrl(opts.url);
  const { sanitizedEnv } = GinaYoinksSecurityGuard.createSanitizedChildEnv();
  const args = [
    ...opts.infoJsonPath ? ["--load-info-json", opts.infoJsonPath] : [sanitizedUrl],
    ...opts.choice.args,
    "--no-playlist",
    "--no-warnings",
    "--newline",
    // --print implies --quiet, which suppresses progress bars and the
    // [Merger]/[ExtractAudio] lines we detect the processing phase from
    "--no-quiet",
    "--progress",
    "--progress-template",
    `download:${PROGRESS_TEMPLATE}`,
    "--print",
    "after_move:filepath",
    "--no-simulate",
    "-o",
    path.join(opts.outDir, "%(title).60s.%(ext)s")
  ];
  if (opts.ffmpegLocation) args.push("--ffmpeg-location", opts.ffmpegLocation);
  return new Promise((resolve, reject) => {
    const child = spawn(opts.ytdlp, args, { signal, env: sanitizedEnv });
    activeChild = child;
    let stderr = "";
    let filepath = "";
    let part = 0;
    let totalParts = 1;
    let lastDownloaded = 0;
    let buffer = "";
    const destinations = [];
    child.stdout.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        if (line.startsWith(PROGRESS_PREFIX)) {
          const [downloaded, total, totalEstimate, speed, eta] = line.slice(PROGRESS_PREFIX.length).split("|");
          const downloadedBytes = toNumber(downloaded) ?? 0;
          if (downloadedBytes < lastDownloaded) part++;
          lastDownloaded = downloadedBytes;
          handlers.onProgress({
            downloadedBytes,
            totalBytes: toNumber(total) ?? toNumber(totalEstimate),
            speed: toNumber(speed),
            eta: toNumber(eta),
            part,
            totalParts
          });
        } else if (line.includes("Downloading 1 format(s):")) {
          totalParts = (line.split("format(s):")[1] ?? "").trim().split("+").length;
        } else if (line.includes("[Merger]") || line.includes("[ExtractAudio]")) {
          const merging = /^\[Merger\] Merging formats into "(.+)"$/.exec(line)?.[1];
          const extracting = /^\[ExtractAudio\] Destination: (.+)$/.exec(line)?.[1];
          const target = merging ?? extracting;
          if (target) destinations.push(target);
          handlers.onProcessing();
        } else if (line.startsWith("[download] Destination: ")) {
          destinations.push(line.slice("[download] Destination: ".length));
        } else if (path.isAbsolute(line)) {
          filepath = line;
        }
      }
    });
    child.stderr.on("data", (chunk) => stderr += chunk);
    child.on("error", reject);
    child.on("close", (code) => {
      activeChild = void 0;
      if (signal?.aborted) {
        void removePartials(destinations);
        reject(new Error("Download cancelled."));
        return;
      }
      if (code === 0 && filepath) {
        resolve(filepath);
      } else {
        reject(new Error(cleanYtDlpError(stderr) || `Download failed (yt-dlp exit code ${code}).`));
      }
    });
  });
}
async function runHeadlessDownload(options) {
  const runtimeCheck = GinaYoinksSecurityGuard.verifyRuntimeFingerprint(options.agentId);
  if (!runtimeCheck.verified) {
    throw new Error("[GINA-SEC-L1 CISO] Runtime fingerprint verification failed.");
  }
  GinaYoinksSecurityGuard.createSiacpEphemeralSession(options.agentId);
  GinaYoinksSecurityGuard.enforceBellLaPadulaBiba("SEC-L1/TS-L1", "SEC-L1/TS-L1", "write");
  const { sanitizedUrl } = GinaYoinksSecurityGuard.validateAndSanitizeUrl(options.url);
  await fs.mkdir(options.outDir, { recursive: true });
  const ytdlp = await ensureYtDlp(() => {
  }, options.signal);
  const ffmpegLocation = await findFfmpeg();
  const choice = options.mode === "mp3" ? MP3_AUDIO_CHOICE : BEST_VIDEO_CHOICE;
  const filepath = await download(
    {
      ytdlp,
      ffmpegLocation,
      url: sanitizedUrl,
      choice,
      outDir: options.outDir
    },
    {
      onProgress: () => {
      },
      onProcessing: () => {
      }
    },
    options.signal
  );
  const auditRecord = GinaYoinksSecurityGuard.generateWormAuditRecord(
    filepath,
    sanitizedUrl,
    options.agentId ?? "GINA-DIR5-MEDIA-001"
  );
  return { filepath, auditRecord };
}
function removePartials(destinations) {
  return Promise.allSettled(
    destinations.flatMap((dest) => [dest, `${dest}.part`, `${dest}.ytdl`]).map((file) => fs.rm(file, { force: true }))
  );
}
function toNumber(value) {
  if (!value || value === "NA" || value === "None") return void 0;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : void 0;
}
function cleanYtDlpError(stderr) {
  const lines = stderr.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("ERROR:"));
  const last = lines.at(-1);
  return last ? last.replace(/^ERROR:\s*(\[[^\]]+\]\s*)?/, "") : "";
}

// src/mcp_server.ts
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
  const outDir = input.outDir ? path2.resolve(input.outDir) : process.env.YOINKS_SANDBOX_DIR ? path2.resolve(process.env.YOINKS_SANDBOX_DIR) : path2.join(os2.homedir(), "Downloads");
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
var isMainModule = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path2.resolve(process.argv[1])).href;
if (isMainModule) {
  startMcpStdioServer();
}

// src/lib/args.ts
var THEME_MODES = ["auto", "light", "dark"];
function isThemeMode(value) {
  return typeof value === "string" && THEME_MODES.includes(value);
}
function parseArgs(args) {
  const result = { help: false, version: false };
  const positional = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "-h" || arg === "--help") {
      result.help = true;
    } else if (arg === "-v" || arg === "--version") {
      result.version = true;
    } else if (arg === "--best") {
      result.best = true;
    } else if (arg === "--mp3") {
      result.mp3 = true;
    } else if (arg === "--json-audit") {
      result.jsonAudit = true;
    } else if (arg === "--worm-log") {
      result.wormLog = true;
      result.jsonAudit = true;
    } else if (arg === "-o" || arg === "--output") {
      const value = args[++index];
      if (!value || value.startsWith("-")) {
        return { ...result, error: `${arg} needs a directory path` };
      }
      result.outDir = value;
    } else if (arg.startsWith("--output=")) {
      const value = arg.slice("--output=".length).trim();
      if (!value) {
        return { ...result, error: "--output needs a directory path" };
      }
      result.outDir = value;
    } else if (arg === "--theme") {
      const value = args[++index];
      if (!value) return { ...result, error: "--theme needs a value: auto, light, or dark" };
      if (!isThemeMode(value)) return { ...result, error: `unknown theme \u201C${value}\u201D \u2014 use auto, light, or dark` };
      result.themeMode = value;
    } else if (arg.startsWith("--theme=")) {
      const value = arg.slice("--theme=".length);
      if (!isThemeMode(value)) return { ...result, error: `unknown theme \u201C${value}\u201D \u2014 use auto, light, or dark` };
      result.themeMode = value;
    } else if (arg.startsWith("-")) {
      return { ...result, error: `unknown option \u201C${arg}\u201D` };
    } else {
      positional.push(arg);
    }
  }
  if (result.best && result.mp3) {
    return { ...result, error: "cannot combine --best and --mp3" };
  }
  if (positional.length > 1) return { ...result, error: "expected a single url" };
  result.initialUrl = positional[0];
  return result;
}
export {
  BEST_VIDEO_CHOICE,
  GINA_AST_WATERMARK,
  GINA_YOINK_MEDIA_MCP_TOOL,
  GinaYoinksSecurityGuard,
  MP3_AUDIO_CHOICE,
  SOVEREIGN_SUPERVISORS,
  buildChoices,
  download,
  ensureYtDlp,
  findFfmpeg,
  handleGinaYoinkMediaToolCall,
  parseArgs,
  probe,
  processMcpJsonRpcMessage,
  runHeadlessDownload,
  startMcpStdioServer
};
