import { YoinksAuditRecord, GinaYoinksSecurityGuard, GINA_AST_WATERMARK } from './security/gina_yoinks_guard.js';
export { SOVEREIGN_SUPERVISORS, SovereignLayerSupervisors } from './security/gina_yoinks_guard.js';

interface GinaYoinkMediaToolInput {
    url: string;
    mode?: 'best' | 'mp3';
    outDir?: string;
    agentId?: string;
    wormLog?: boolean;
}
interface GinaYoinkMediaToolOutput {
    status: 'success';
    filepath: string;
    auditRecord: YoinksAuditRecord;
    astLock: ReturnType<typeof GinaYoinksSecurityGuard.acquireAstSemanticLock>;
    siacpSession: ReturnType<typeof GinaYoinksSecurityGuard.createSiacpEphemeralSession>;
    watermark: typeof GINA_AST_WATERMARK;
}
declare const GINA_YOINK_MEDIA_MCP_TOOL: {
    readonly name: "gina_yoink_media";
    readonly description: "GINASERVICE Sovereign Media Downloader (GINA-SEC-7L-2026 | SEC-L1/TS-L1). Safely downloads reference videos (MP4 --best) or audio (--mp3) from YouTube, X/Twitter, Instagram, TikTok, and Threads for DIR-5 Marketing Swarm with SSRF/Command-Injection quarantine (Theta < 0.85) and SHA-256 WORM audit logging.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly url: {
                readonly type: "string";
                readonly description: "Target media URL (https:// or http://) to sanitize and download.";
            };
            readonly mode: {
                readonly type: "string";
                readonly enum: readonly ["best", "mp3"];
                readonly default: "best";
                readonly description: "Download highest quality MP4 video (\"best\") or extract MP3 audio (\"mp3\").";
            };
            readonly outDir: {
                readonly type: "string";
                readonly description: "Output directory for Google Drive archiving or sandbox storage (defaults to /tmp/yoinks-downloads or ~/Downloads).";
            };
            readonly agentId: {
                readonly type: "string";
                readonly default: "GINA-DIR5-MEDIA-001";
                readonly description: "Sovereign agent identifier for WORM audit attribution.";
            };
            readonly wormLog: {
                readonly type: "boolean";
                readonly default: true;
                readonly description: "Emit SHA-256 WORM audit record for audit-stream@ginaservice.com.";
            };
        };
        readonly required: readonly ["url"];
    };
};
/**
 * Executes the `gina_yoink_media` MCP tool under GINA-SEC-7L-2026 Layers 1-7 supervision.
 */
declare function handleGinaYoinkMediaToolCall(input: GinaYoinkMediaToolInput): Promise<GinaYoinkMediaToolOutput>;
interface JsonRpcRequest {
    jsonrpc: '2.0';
    id?: string | number | null;
    method: string;
    params?: Record<string, unknown>;
}
/**
 * Processes a single MCP JSON-RPC 2.0 message.
 */
declare function processMcpJsonRpcMessage(request: JsonRpcRequest): Promise<Record<string, unknown> | null>;
/**
 * Starts the stdio MCP Server for Google Antigravity integration.
 */
declare function startMcpStdioServer(): void;

declare const THEME_MODES: readonly ["auto", "light", "dark"];
type ThemeMode = (typeof THEME_MODES)[number];
type CliArgs = {
    help: boolean;
    version: boolean;
    initialUrl?: string;
    themeMode?: ThemeMode;
    best?: boolean;
    mp3?: boolean;
    outDir?: string;
    jsonAudit?: boolean;
    wormLog?: boolean;
    error?: string;
};
declare function parseArgs(args: string[]): CliArgs;

/**
 * Resolve a usable yt-dlp binary: system install first, then a previously
 * downloaded copy, then download the standalone binary from GitHub releases.
 * Enforces Layer 4 SHA-256 binary integrity verification (SEC-04 ARTI).
 */
declare function ensureYtDlp(onStatus: (message: string) => void, signal?: AbortSignal): Promise<string>;
/**
 * Find ffmpeg for stream merging / mp3 extraction: system install first,
 * ffmpeg-static as fallback. Returns undefined if neither exists — yt-dlp
 * still works for single-file formats without it.
 * Enforces Layer 4 SHA-256 binary integrity verification (SEC-04 ARTI).
 */
declare function findFfmpeg(): Promise<string | undefined>;
type VideoInfo = {
    title: string;
    uploader?: string;
    duration?: number;
    webpage_url?: string;
    extractor_key?: string;
    formats?: RawFormat[];
};
type RawFormat = {
    format_id: string;
    ext?: string;
    vcodec?: string;
    acodec?: string;
    height?: number;
    width?: number;
    abr?: number;
    tbr?: number;
    filesize?: number;
    filesize_approx?: number;
};
type ProbeResult = {
    info: VideoInfo;
    /** Raw -J output saved to disk so downloads can skip re-extraction via --load-info-json. */
    infoJsonPath: string;
};
declare function probe(ytdlp: string, url: string, signal?: AbortSignal): Promise<ProbeResult>;
type DownloadChoice = {
    label: string;
    kind: 'video' | 'audio';
    args: string[];
};
declare const BEST_VIDEO_CHOICE: DownloadChoice;
declare const MP3_AUDIO_CHOICE: DownloadChoice;
declare function buildChoices(info: VideoInfo): DownloadChoice[];
type DownloadProgress = {
    downloadedBytes: number;
    totalBytes?: number;
    speed?: number;
    eta?: number;
    part: number;
    /** How many files this download resolves to (video+audio merges are 2). */
    totalParts: number;
};
type DownloadHandlers = {
    onProgress: (progress: DownloadProgress) => void;
    onProcessing: () => void;
};
declare function download(opts: {
    ytdlp: string;
    ffmpegLocation?: string;
    url: string;
    /** When set, reuse the probe's metadata instead of re-extracting — starts much faster. */
    infoJsonPath?: string;
    choice: DownloadChoice;
    outDir: string;
}, handlers: DownloadHandlers, signal?: AbortSignal): Promise<string>;
type HeadlessDownloadOptions = {
    url: string;
    mode: 'best' | 'mp3';
    outDir: string;
    agentId?: string;
    signal?: AbortSignal;
};
type HeadlessDownloadResult = {
    filepath: string;
    auditRecord: YoinksAuditRecord;
};
/**
 * Headless download runner for DIR-5 Marketing Swarm Agents & MCP Tool invocations.
 * Enforces GINA-SEC-7L-2026 Layers 1-7 and produces a SHA-256 WORM audit record.
 */
declare function runHeadlessDownload(options: HeadlessDownloadOptions): Promise<HeadlessDownloadResult>;

export { BEST_VIDEO_CHOICE, type CliArgs, type DownloadChoice, type DownloadHandlers, type DownloadProgress, GINA_AST_WATERMARK, GINA_YOINK_MEDIA_MCP_TOOL, type GinaYoinkMediaToolInput, type GinaYoinkMediaToolOutput, GinaYoinksSecurityGuard, type HeadlessDownloadOptions, type HeadlessDownloadResult, MP3_AUDIO_CHOICE, type ProbeResult, type VideoInfo, YoinksAuditRecord, buildChoices, download, ensureYtDlp, findFfmpeg, handleGinaYoinkMediaToolCall, parseArgs, probe, processMcpJsonRpcMessage, runHeadlessDownload, startMcpStdioServer };
