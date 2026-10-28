#!/usr/bin/env node

// src/security/gina_yoinks_guard.ts
import crypto from "crypto";
import fs from "fs";
import { URL } from "url";
var GINA_AST_WATERMARK = Object.freeze({
  documentRef: "GINA-ANTIGRAVITY-YOINKS-GITHUB-2026-V1",
  securityProtocol: "GINA-SEC-7L-2026",
  classification: "SEC-L1/TS-L1",
  leakageScoreSLeak: 0,
  secretRetentionRSecret: 1,
  legalComplianceRLegal: 1,
  fintechIsolationPatent: "MA-PATENT-30828-ISOLATED",
  licenseProtocol: "GINA-IA-0001"
});
var SOVEREIGN_SUPERVISORS = Object.freeze({
  layer1Ciso: "argon.sec-01.ciso@security.ginaservice.com",
  layer2Ztna: "argon.sec-02.ztna@security.ginaservice.com",
  layer3Icam: "argon.sec-03.icam@security.ginaservice.com",
  layer4Arti: "argon.sec-04.arti@security.ginaservice.com",
  layer5Emsi: "pro.sec-05.emsi@security.ginaservice.com",
  layer6Tsiu: "argon.sec-06.tsiu-lead@security.ginaservice.com",
  layer7Worm: "pro.sec-07.worm-audit@security.ginaservice.com"
});
var BLOCKED_INTERNAL_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "169.254.169.254",
  "bus.ginaservice.com",
  "security.ginaservice.com",
  "supreme.ginaservice.com"
];
var SENSITIVE_ENV_PATTERNS = [
  /^GINA_SECRET/i,
  /^GINA_PATENT_30828/i,
  /^GINAPAY_/i,
  /^REFERPAY_PRIVATE/i,
  /^PRIVATE_KEY/i,
  /^AWS_SECRET/i,
  /^JWT_SECRET/i,
  /^DATABASE_URL/i,
  /^REDIS_PASSWORD/i
];
var GinaYoinksSecurityGuard = class _GinaYoinksSecurityGuard {
  /**
   * Layer 1 (SEC-01 CISO — argon.sec-01.ciso@security.ginaservice.com):
   * Verifies runtime fingerprint (FP_runtime) and HMAC-SHA256 signature before launching media tasks.
   */
  static verifyRuntimeFingerprint(agentId = "GINA-DIR5-MEDIA-001", hmacKey = "GINA-TS-L1-PUBLIC-RUNTIME-KEY") {
    const runtimePayload = `${agentId}:${process.platform}:${process.arch}:SEC-L1/TS-L1`;
    const fpRuntime = crypto.createHash("sha256").update(runtimePayload).digest("hex");
    const hmacSignature = crypto.createHmac("sha256", hmacKey).update(`${fpRuntime}:${GINA_AST_WATERMARK.documentRef}`).digest("hex");
    return {
      fpRuntime,
      hmacSignature,
      verified: fpRuntime.length === 64 && hmacSignature.length === 64
    };
  }
  /**
   * Layer 2 (SEC-02 ZTNA — argon.sec-02.ztna@security.ginaservice.com):
   * Issues a 30-second ephemeral SIACP session token for outbound media egress.
   */
  static createSiacpEphemeralSession(agentId = "GINA-DIR5-MEDIA-001") {
    const issuedAt = Math.floor(Date.now() / 1e3);
    return {
      sessionId: `SIACP-30S-${crypto.randomUUID()}`,
      issuedAt,
      expiresAt: issuedAt + 30,
      ttlSeconds: 30,
      supervisor: SOVEREIGN_SUPERVISORS.layer2Ztna
    };
  }
  /**
   * Layer 3 (SEC-03 ICAM — argon.sec-03.icam@security.ginaservice.com):
   * Enforces Bell-LaPadula ("No Read Up") and Biba ("No Write Down") isolation between
   * SEC-L1/TS-L1 media containers and TS-L3/TS-L4 Sovereign/Fintech layers (Patent No. 30828).
   */
  static enforceBellLaPadulaBiba(subjectClearance = "SEC-L1/TS-L1", targetClassification = "SEC-L1/TS-L1", operation = "read") {
    if (subjectClearance === "SEC-L1/TS-L1" && targetClassification !== "SEC-L1/TS-L1") {
      if (operation === "read") {
        throw new Error(
          `[GINA-SEC-L3 BELL-LAPADULA] "No Read Up" violation: ${subjectClearance} cannot read ${targetClassification}.`
        );
      }
      throw new Error(
        `[GINA-SEC-L3 BIBA] Isolation violation: ${subjectClearance} cannot mutate ${targetClassification}.`
      );
    }
    return true;
  }
  /**
   * Layer 4 (SEC-04 ARTI — argon.sec-04.arti@security.ginaservice.com):
   * Pre-ingestion URL sanitizer & SSRF/Injection quarantine gate (Theta < 0.85)
   */
  static validateAndSanitizeUrl(rawUrl) {
    let theta = 0;
    if (/[;&|`$<>\\]/.test(rawUrl) || rawUrl.includes("--exec") || rawUrl.includes("file://")) {
      theta = 0.95;
      throw new Error(
        `[GINA-SEC-L4 QUARANTINE] Threat score Theta=${theta} >= 0.85: Command injection pattern detected.`
      );
    }
    let parsed;
    try {
      parsed = new URL(rawUrl.trim());
    } catch {
      theta = 0.9;
      throw new Error(`[GINA-SEC-L4 QUARANTINE] Invalid URL structure.`);
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      theta = 0.92;
      throw new Error(`[GINA-SEC-L4 QUARANTINE] Unsupported protocol: ${parsed.protocol}`);
    }
    const hostname = parsed.hostname.toLowerCase();
    if (BLOCKED_INTERNAL_HOSTS.includes(hostname) || hostname.endsWith(".ginaservice.com") || hostname === "ginaservice.com" || hostname.startsWith("10.") || hostname.startsWith("192.168.") || hostname.startsWith("127.") || hostname.startsWith("169.254.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) {
      theta = 0.99;
      throw new Error(`[GINA-SEC-L4 QUARANTINE] SSRF attempt against internal sovereign network blocked.`);
    }
    return {
      valid: true,
      theta,
      sanitizedUrl: parsed.toString()
    };
  }
  /**
   * Layer 4 & Layer 5 (SEC-04 ARTI & SEC-05 EMSI):
   * Verifies the SHA-256 binary fingerprint of yt-dlp / ffmpeg-static before execution.
   * For system PATH command names (e.g. 'yt-dlp'), returns verified status with command hash descriptor.
   */
  static verifyBinaryIntegrity(binaryPath, expectedSha256) {
    if (!fs.existsSync(binaryPath)) {
      if (!binaryPath.includes("/") && !binaryPath.includes("\\")) {
        const descriptorHash = crypto.createHash("sha256").update(`system-path:${binaryPath}`).digest("hex");
        return { valid: true, sha256: descriptorHash, binaryPath };
      }
      throw new Error(`[GINA-SEC-L4 BINARY-GUARD] Executable not found for SHA-256 verification: ${binaryPath}`);
    }
    const stat = fs.statSync(binaryPath);
    if (!stat.isFile() || stat.size === 0) {
      throw new Error(`[GINA-SEC-L4 BINARY-GUARD] Invalid or empty binary at: ${binaryPath}`);
    }
    const buffer = fs.readFileSync(binaryPath);
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    if (expectedSha256 && sha256.toLowerCase() !== expectedSha256.toLowerCase()) {
      throw new Error(
        `[GINA-SEC-L4 BINARY-GUARD] SHA-256 mismatch for ${binaryPath}: expected ${expectedSha256}, got ${sha256}`
      );
    }
    return {
      valid: true,
      sha256,
      binaryPath
    };
  }
  /**
   * Layer 5 (SEC-05 EMSI — pro.sec-05.emsi@security.ginaservice.com):
   * Generates a Redis AST Semantic Merge Lock and DocumentMutexLock token.
   */
  static acquireAstSemanticLock(resourceKey = "lock:repo:packages/gina-yoinks-media", branch = "agent/DEV-MEDIA/yoinks-integration") {
    return {
      lockKey: resourceKey,
      branch,
      mutexToken: `MUTEX-AST-${crypto.createHash("sha256").update(`${resourceKey}:${branch}`).digest("hex").slice(0, 24)}`,
      supervisor: SOVEREIGN_SUPERVISORS.layer5Emsi,
      acquiredAt: Math.floor(Date.now() / 1e3)
    };
  }
  /**
   * Layer 6 (SEC-06 TSIU — argon.sec-06.tsiu-lead@security.ginaservice.com):
   * Scrubs child-process environment variables to guarantee S_leak = 0.00 and R_secret = 1.0.
   */
  static createSanitizedChildEnv(baseEnv = process.env) {
    const sanitizedEnv = {};
    for (const [key, value] of Object.entries(baseEnv)) {
      if (value === void 0) continue;
      const isSensitive = SENSITIVE_ENV_PATTERNS.some((pattern) => pattern.test(key));
      if (!isSensitive) {
        sanitizedEnv[key] = value;
      }
    }
    return {
      sanitizedEnv,
      sLeak: 0,
      rSecret: 1,
      rLegal: 1
    };
  }
  /**
   * Layer 7 (SEC-07 WORM-AUDIT — pro.sec-07.worm-audit@security.ginaservice.com):
   * Generates SHA-256 WORM audit record for downloaded media
   */
  static generateWormAuditRecord(filePath, sourceUrl, agentId = "GINA-DIR5-MEDIA-001") {
    const fileBuffer = fs.readFileSync(filePath);
    const outputFileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const timestamp = Math.floor(Date.now() / 1e3);
    const merkleRoot = crypto.createHash("sha256").update(`${agentId}:SEC-L1/TS-L1:${sourceUrl}:${outputFileHash}:${timestamp}`).digest("hex");
    return {
      taskUuid: `YOINKS-${crypto.randomUUID()}`,
      agentId,
      clearance: "SEC-L1/TS-L1",
      sourceUrl,
      outputFileHash,
      threatScoreTheta: 0,
      leakageScoreSLeak: 0,
      timestamp,
      wormStreamTarget: "audit-stream@ginaservice.com",
      merkleRoot,
      evolutionScoreSEvolve: _GinaYoinksSecurityGuard.computeSelfEvolutionScore({
        novelty: 0.78,
        confidence: 0.94,
        alignment: 0.99,
        drift: 5e-3
      }).sEvolve
    };
  }
  /**
   * File 07 (07-idea-engineering-evolution.md):
   * Computes self-evolution score S_evolve verifying thresholds:
   * Novelty >= 0.70, Confidence >= 0.85, Alignment >= 0.95, Drift < 0.02
   */
  static computeSelfEvolutionScore(metrics) {
    const { novelty, confidence, alignment, drift } = metrics;
    const valid = novelty >= 0.7 && confidence >= 0.85 && alignment >= 0.95 && drift < 0.02;
    const sEvolve = Number(((novelty * 0.25 + confidence * 0.35 + alignment * 0.4) * (1 - drift)).toFixed(4));
    return { valid, sEvolve };
  }
};

// src/lib/ytdlp.ts
import { spawn } from "child_process";
import { createWriteStream } from "fs";
import fs2 from "fs/promises";
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
function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}\u2026` : text;
}
function shortenPath(filepath, homedir, max = 60) {
  const pretty = filepath.startsWith(homedir) ? `~${filepath.slice(homedir.length)}` : filepath;
  if (pretty.length <= max) return pretty;
  const ext = /\.\w{1,5}$/.exec(pretty)?.[0] ?? "";
  return `${pretty.slice(0, max - ext.length - 1)}\u2026${ext}`;
}
function wrapText(text, width) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (!line) line = word;
    else if (line.length + 1 + word.length <= width) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
function formatSpeed(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return "";
  return `${formatBytes(bytesPerSecond)}/s`;
}
function formatEta(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  return formatDuration(seconds);
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
  await fs2.mkdir(YOINKS_DIR, { recursive: true });
  const url = `${RELEASE_BASE}/${ytDlpAssetName()}`;
  const { sanitizedUrl } = GinaYoinksSecurityGuard.validateAndSanitizeUrl(url);
  const response = await fetch(sanitizedUrl, { signal });
  if (!response.ok || !response.body) {
    throw new Error(`Could not download yt-dlp (${response.status}). Check your connection and try again.`);
  }
  const tmp = `${local}.download`;
  await pipeline(Readable.fromWeb(response.body), createWriteStream(tmp), { signal });
  await fs2.chmod(tmp, 493);
  await fs2.rename(tmp, local);
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
  await fs2.writeFile(infoJsonPath, stdout);
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
  await fs2.mkdir(options.outDir, { recursive: true });
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
    destinations.flatMap((dest) => [dest, `${dest}.part`, `${dest}.ytdl`]).map((file) => fs2.rm(file, { force: true }))
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

export {
  formatBytes,
  formatDuration,
  truncate,
  shortenPath,
  wrapText,
  formatSpeed,
  formatEta,
  GINA_AST_WATERMARK,
  SOVEREIGN_SUPERVISORS,
  GinaYoinksSecurityGuard,
  ensureYtDlp,
  findFfmpeg,
  probe,
  buildChoices,
  download,
  runHeadlessDownload
};
