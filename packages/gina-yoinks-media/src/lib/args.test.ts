import assert from 'node:assert/strict'
import test from 'node:test'
import {parseArgs} from './args.js'
import {isThemeMode, nextThemeMode, themeFor} from '../theme.js'

test('parses a url and a spaced theme option without confusing the value for the url', () => {
  assert.deepEqual(parseArgs(['--theme', 'light', 'https://example.com/video']), {
    help: false,
    version: false,
    themeMode: 'light',
    initialUrl: 'https://example.com/video',
  })
})

test('parses an equals-style theme option after the url', () => {
  assert.deepEqual(parseArgs(['https://example.com/video', '--theme=dark']), {
    help: false,
    version: false,
    themeMode: 'dark',
    initialUrl: 'https://example.com/video',
  })
})

test('parses DIR-5 headless automation flags (--best, --mp3, -o, --json-audit, --worm-log)', () => {
  assert.deepEqual(parseArgs(['--best', '-o', '/tmp/yoinks-downloads', '--json-audit', 'https://youtu.be/dQw4w9WgXcQ']), {
    help: false,
    version: false,
    best: true,
    outDir: '/tmp/yoinks-downloads',
    jsonAudit: true,
    initialUrl: 'https://youtu.be/dQw4w9WgXcQ',
  })

  assert.deepEqual(parseArgs(['--mp3', '--output=/tmp/audio', '--worm-log', 'https://x.com/user/status/123']), {
    help: false,
    version: false,
    mp3: true,
    outDir: '/tmp/audio',
    wormLog: true,
    jsonAudit: true,
    initialUrl: 'https://x.com/user/status/123',
  })
})

test('rejects missing, invalid, and unknown options', () => {
  assert.match(parseArgs(['--theme']).error ?? '', /needs a value/)
  assert.match(parseArgs(['--theme', 'sepia']).error ?? '', /unknown theme/)
  assert.match(parseArgs(['-o']).error ?? '', /needs a directory/)
  assert.match(parseArgs(['--best', '--mp3']).error ?? '', /cannot combine/)
  assert.match(parseArgs(['--wat']).error ?? '', /unknown option/)
  assert.match(parseArgs(['one', 'two']).error ?? '', /single url/)
})

test('recognizes only supported modes and cycles through all of them', () => {
  assert.equal(isThemeMode('auto'), true)
  assert.equal(isThemeMode('light'), true)
  assert.equal(isThemeMode('dark'), true)
  assert.equal(isThemeMode('sepia'), false)
  assert.equal(nextThemeMode('auto'), 'light')
  assert.equal(nextThemeMode('light'), 'dark')
  assert.equal(nextThemeMode('dark'), 'auto')
})

test('auto delegates to terminal colors while forced modes own the full surface', () => {
  assert.deepEqual(themeFor('auto'), {
    mode: 'auto',
    primary: undefined,
    gray: undefined,
    dark: undefined,
    background: undefined,
    dimSecondary: true,
    inverseButton: true,
  })

  assert.equal(themeFor('light').background, '#ffffff')
  assert.equal(themeFor('light').primary, '#18181b')
  assert.equal(themeFor('dark').background, '#18181b')
  assert.equal(themeFor('dark').primary, '#ffffff')
})
