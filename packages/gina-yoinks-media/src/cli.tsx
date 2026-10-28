import React from 'react'
import {createRequire} from 'node:module'
import os from 'node:os'
import path from 'node:path'
import {render} from 'ink'
import {App, type Outcome} from './app.js'
import {captureFrames} from './lib/click-map.js'
import {parseArgs} from './lib/args.js'
import {readClipboard} from './lib/clipboard.js'
import {isProbablyUrl} from './lib/platforms.js'
import {runHeadlessDownload} from './lib/ytdlp.js'
import {GinaYoinksSecurityGuard} from './security/gina_yoinks_guard.js'

// read at runtime from the shipped package.json so npm version bumps
// can't drift from a hardcoded constant
const VERSION: string = createRequire(import.meta.url)('../package.json').version

const HELP = `
  yoinks — yoink any video. paste. yoink. done.
  [GINASERVICE Sovereign Media Tool — GINA-SEC-7L-2026 | SEC-L1/TS-L1]

  Usage
    $ yoinks [options] [url]

  Examples
    $ yoinks https://youtu.be/dQw4w9WgXcQ
    $ yoinks --best -o ./drive-assets --worm-log https://x.com/user/status/123456
    $ yoinks --mp3 --json-audit https://youtu.be/dQw4w9WgXcQ
    $ yoinks                 (prompts for a url interactively)

  Options
    --best          download highest available video quality (MP4) automatically
    --mp3           extract audio only in MP3 format automatically
    -o <dir>        specify output folder (default: ~/Downloads)
    --json-audit    emit GINA-SEC-L7 WORM audit JSON record with SHA-256 hash
    --worm-log      alias for --json-audit (reports to audit-stream@ginaservice.com)
    --theme <mode>  use auto, light, or dark for this run
    -h, --help      show this help
    -v, --version   show version

  Downloads are saved to ~/Downloads by default.
  Powered by yt-dlp — YouTube, X, Instagram, Threads, TikTok & 1800+ sites.
`

const args = parseArgs(process.argv.slice(2))

if (args.error) {
  console.error(`yoinks: ${args.error}\nTry “yoinks --help” for usage.`)
  process.exit(1)
}

if (args.help) {
  console.log(HELP)
  process.exit(0)
}

if (args.version) {
  console.log(VERSION)
  process.exit(0)
}

const outDir = args.outDir ? path.resolve(args.outDir) : path.join(os.homedir(), 'Downloads')
let initialUrl = args.initialUrl

if (initialUrl) {
  try {
    const validated = GinaYoinksSecurityGuard.validateAndSanitizeUrl(initialUrl)
    initialUrl = validated.sanitizedUrl
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Headless CLI automation mode for DIR-5 Marketing Swarm Agents (--best / --mp3)
if (args.best || args.mp3) {
  if (!initialUrl) {
    console.error('yoinks: --best and --mp3 require a target URL.\nTry “yoinks --help” for usage.')
    process.exit(1)
  }

  try {
    const {filepath, auditRecord} = await runHeadlessDownload({
      url: initialUrl,
      mode: args.mp3 ? 'mp3' : 'best',
      outDir,
      agentId: process.env.GINA_AGENT_ID ?? 'GINA-DIR5-MEDIA-001',
    })

    if (args.jsonAudit || args.wormLog) {
      console.log(JSON.stringify({...auditRecord, filepath}, null, 2))
    } else {
      console.log(`✓ yoinked → ${filepath}`)
    }
    process.exit(0)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

const initialThemeMode = args.themeMode ?? 'auto'
const isTTY = Boolean(process.stdout.isTTY)

// no url given — offer the clipboard url (⇥ to paste) when it already holds one
let clipboardUrl: string | undefined
if (!initialUrl && isTTY) {
  const clipped = readClipboard().trim()
  // reject multi-line clipboard content — new URL() silently strips newlines
  if (clipped && !/\s/.test(clipped) && isProbablyUrl(clipped)) clipboardUrl = clipped
}
const enterAltScreen = () => process.stdout.write('\x1b[?1049h\x1b[H')
// also switch mouse tracking off — a crash can skip React effect cleanup
const leaveAltScreen = () => process.stdout.write('\x1b[?1006l\x1b[?1000l\x1b[?1049l')

if (isTTY) {
  enterAltScreen()
  process.on('exit', leaveAltScreen)
  // restore the terminal BEFORE a crash prints, or the stack trace is
  // wiped along with the alternate screen and the app looks like it
  // silently quit
  for (const event of ['uncaughtException', 'unhandledRejection'] as const) {
    process.on(event, (error: unknown) => {
      leaveAltScreen()
      console.error(error)
      process.exit(1)
    })
  }
}

let outcome: Outcome = {}
const {waitUntilExit} = render(
  <App
    initialUrl={initialUrl}
    clipboardUrl={clipboardUrl}
    initialThemeMode={initialThemeMode}
    outDir={outDir}
    onOutcome={result => (outcome = result)}
  />,
  // keep a copy of every frame so clicks can be hit-tested against it
  {stdout: captureFrames(process.stdout)},
)

await waitUntilExit()

if (isTTY) leaveAltScreen()
if (outcome.filepath) {
  if (args.jsonAudit || args.wormLog) {
    const auditRecord = GinaYoinksSecurityGuard.generateWormAuditRecord(
      outcome.filepath,
      outcome.url ?? initialUrl ?? 'interactive-session',
      process.env.GINA_AGENT_ID ?? 'GINA-DIR5-MEDIA-001',
    )
    console.log(JSON.stringify({...auditRecord, filepath: outcome.filepath}, null, 2))
  } else {
    console.log(`✓ yoinked → ${outcome.filepath}`)
  }
}
