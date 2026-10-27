export const THEME_MODES = ['auto', 'light', 'dark'] as const
export type ThemeMode = (typeof THEME_MODES)[number]

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value)
}

export type CliArgs = {
  help: boolean
  version: boolean
  initialUrl?: string
  themeMode?: ThemeMode
  best?: boolean
  mp3?: boolean
  outDir?: string
  jsonAudit?: boolean
  wormLog?: boolean
  error?: string
}

export function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {help: false, version: false}
  const positional: string[] = []

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!
    if (arg === '-h' || arg === '--help') {
      result.help = true
    } else if (arg === '-v' || arg === '--version') {
      result.version = true
    } else if (arg === '--best') {
      result.best = true
    } else if (arg === '--mp3') {
      result.mp3 = true
    } else if (arg === '--json-audit') {
      result.jsonAudit = true
    } else if (arg === '--worm-log') {
      result.wormLog = true
      result.jsonAudit = true
    } else if (arg === '-o' || arg === '--output') {
      const value = args[++index]
      if (!value || value.startsWith('-')) {
        return {...result, error: `${arg} needs a directory path`}
      }
      result.outDir = value
    } else if (arg.startsWith('--output=')) {
      const value = arg.slice('--output='.length).trim()
      if (!value) {
        return {...result, error: '--output needs a directory path'}
      }
      result.outDir = value
    } else if (arg === '--theme') {
      const value = args[++index]
      if (!value) return {...result, error: '--theme needs a value: auto, light, or dark'}
      if (!isThemeMode(value)) return {...result, error: `unknown theme “${value}” — use auto, light, or dark`}
      result.themeMode = value
    } else if (arg.startsWith('--theme=')) {
      const value = arg.slice('--theme='.length)
      if (!isThemeMode(value)) return {...result, error: `unknown theme “${value}” — use auto, light, or dark`}
      result.themeMode = value
    } else if (arg.startsWith('-')) {
      return {...result, error: `unknown option “${arg}”`}
    } else {
      positional.push(arg)
    }
  }

  if (result.best && result.mp3) {
    return {...result, error: 'cannot combine --best and --mp3'}
  }

  if (positional.length > 1) return {...result, error: 'expected a single url'}
  result.initialUrl = positional[0]
  return result
}
