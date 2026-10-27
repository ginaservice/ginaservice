#!/usr/bin/env node
import {
  GinaYoinksSecurityGuard,
  buildChoices,
  download,
  ensureYtDlp,
  findFfmpeg,
  formatBytes,
  formatDuration,
  formatEta,
  formatSpeed,
  probe,
  runHeadlessDownload,
  shortenPath,
  truncate,
  wrapText
} from "./chunk-4TX6FNDZ.js";

// src/cli.tsx
import { createRequire } from "module";
import os3 from "os";
import path3 from "path";
import { render } from "ink";

// src/app.tsx
import { useCallback, useEffect as useEffect4, useRef as useRef3, useState as useState4 } from "react";
import os2 from "os";
import path2 from "path";
import { Box as Box5, Text as Text7, useApp, useInput as useInput2, useStdout as useStdout3 } from "ink";
import SelectInput from "ink-select-input";
import Spinner from "ink-spinner";

// src/components/framed-input.tsx
import { Box, Text } from "ink";

// src/theme.ts
import React, { createContext, useContext } from "react";
var THEME_MODES = ["auto", "light", "dark"];
var themes = {
  auto: {
    mode: "auto",
    // Leaving colors unset is more reliable than trying to detect whether a
    // terminal is light or dark. ANSI defaults already follow its theme.
    primary: void 0,
    gray: void 0,
    dark: void 0,
    background: void 0,
    dimSecondary: true,
    inverseButton: true
  },
  light: {
    mode: "light",
    primary: "#18181b",
    gray: "#52525b",
    dark: "#ffffff",
    background: "#ffffff",
    dimSecondary: false,
    inverseButton: false
  },
  dark: {
    mode: "dark",
    primary: "#ffffff",
    gray: "#a1a1aa",
    dark: "#18181b",
    background: "#18181b",
    dimSecondary: false,
    inverseButton: false
  }
};
var ThemeContext = createContext(themes.auto);
function themeFor(mode) {
  return themes[mode];
}
function ThemeProvider({ mode, children }) {
  return React.createElement(ThemeContext.Provider, { value: themeFor(mode) }, children);
}
function useTheme() {
  return useContext(ThemeContext);
}
function nextThemeMode(mode) {
  return THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length];
}

// src/components/framed-input.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var frameButtonWidth = (label) => label.length + 4;
function FramedInput({
  title,
  width,
  button,
  buttonDim = false,
  children
}) {
  const theme = useTheme();
  const inner = width - 2;
  const tail = Math.max(0, inner - title.length - 3);
  const buttonW = button ? frameButtonWidth(button) : 0;
  const fillColor = buttonDim ? theme.gray : theme.primary;
  return /* @__PURE__ */ jsxs(Box, { width: width + buttonW, children: [
    /* @__PURE__ */ jsxs(Box, { flexDirection: "column", width, children: [
      /* @__PURE__ */ jsxs(Text, { children: [
        /* @__PURE__ */ jsx(Text, { color: theme.gray, dimColor: theme.dimSecondary, children: "\u256D\u2500 " }),
        /* @__PURE__ */ jsx(Text, { color: theme.primary, children: title }),
        /* @__PURE__ */ jsx(Text, { color: theme.gray, dimColor: theme.dimSecondary, children: ` ${"\u2500".repeat(tail)}${button ? "\u2500" : "\u256E"}` })
      ] }),
      /* @__PURE__ */ jsxs(Box, { width, height: 1, overflow: "hidden", children: [
        /* @__PURE__ */ jsx(Text, { color: theme.gray, dimColor: theme.dimSecondary, children: "\u2502 " }),
        /* @__PURE__ */ jsx(Text, { color: theme.primary, children: "\u276F " }),
        /* @__PURE__ */ jsx(Box, { flexGrow: 1, height: 1, overflow: "hidden", children }),
        button ? null : /* @__PURE__ */ jsx(Text, { color: theme.gray, dimColor: theme.dimSecondary, children: " \u2502" })
      ] }),
      /* @__PURE__ */ jsx(Text, { color: theme.gray, dimColor: theme.dimSecondary, children: `\u2570${"\u2500".repeat(inner)}${button ? "\u2500" : "\u256F"}` })
    ] }),
    button ? /* @__PURE__ */ jsxs(Box, { flexDirection: "column", width: buttonW, children: [
      /* @__PURE__ */ jsx(Text, { bold: true, color: fillColor, dimColor: buttonDim && theme.dimSecondary, children: "\u2584".repeat(buttonW) }),
      /* @__PURE__ */ jsx(
        Text,
        {
          backgroundColor: theme.inverseButton ? void 0 : fillColor,
          color: theme.inverseButton ? void 0 : theme.dark,
          inverse: theme.inverseButton && !buttonDim,
          dimColor: buttonDim && theme.dimSecondary,
          bold: true,
          children: `  ${button}  `
        }
      ),
      /* @__PURE__ */ jsx(Text, { bold: true, color: fillColor, dimColor: buttonDim && theme.dimSecondary, children: "\u2580".repeat(buttonW) })
    ] }) : null
  ] });
}

// src/components/fullscreen.tsx
import { useEffect, useState } from "react";
import { Box as Box2, useStdout } from "ink";
import { jsx as jsx2 } from "react/jsx-runtime";
function FullScreen({ children }) {
  const theme = useTheme();
  const { stdout } = useStdout();
  const dimensions = () => ({
    columns: stdout?.columns && stdout.columns > 0 ? stdout.columns : 80,
    rows: stdout?.rows && stdout.rows > 1 ? stdout.rows : 24
  });
  const [size, setSize] = useState(dimensions);
  useEffect(() => {
    if (!stdout) return;
    const onResize = () => setSize(dimensions());
    stdout.on("resize", onResize);
    return () => {
      stdout.off("resize", onResize);
    };
  }, [stdout]);
  return /* @__PURE__ */ jsx2(
    Box2,
    {
      width: size.columns,
      height: size.rows - 1,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      children: /* @__PURE__ */ jsx2(Box2, { flexDirection: "column", alignItems: "center", flexShrink: 0, children })
    }
  );
}

// src/components/logo.tsx
import { useEffect as useEffect2, useMemo, useState as useState2 } from "react";
import { Box as Box3, Text as Text2 } from "ink";
import { jsx as jsx3 } from "react/jsx-runtime";
var ART = [
  "\u2593 \u2593 \u2588\u2580\u2588 \u2580\u2588\u2580 \u2588\u2580\u2584\u2588 \u2588 \u2588 \u2588\u2580\u2580",
  "\u2580\u2588\u2580 \u2588 \u2593  \u2593  \u2588  \u2593 \u2593\u2580\u2584 \u2580\u2580\u2593",
  " \u2580  \u2580\u2580\u2580 \u2580\u2580\u2580 \u2580  \u2580 \u2580 \u2580 \u2580\u2580\u2580"
];
var GRID = ART.map((line) => [...line]);
var ROWS = GRID.length;
var INTRO_MS = 900;
var INTRO_SPREAD_MS = 550;
var SWEEP_MS = 1e3;
var SWEEP_EVERY_MS = 7e3;
var TILT = 2;
var HALF = 2.4;
var LIGHTER = { "\u2588": "\u2592", "\u2593": "\u2591" };
var HALF_BLOCKS = /* @__PURE__ */ new Set(["\u2580", "\u2584"]);
var ease = (t) => 1 - Math.pow(1 - t, 3);
function cellAt(ch, row, col, phase, t, delay, theme) {
  if (ch === " " || phase === "idle") return { ch, color: theme.primary, dim: false };
  if (phase === "intro") {
    const dt = t - delay;
    if (dt < 0) return { ch: " ", color: theme.primary, dim: false };
    if (dt < 110) return { ch: HALF_BLOCKS.has(ch) ? ch : "\u2591", color: theme.gray, dim: theme.dimSecondary };
    if (dt < 220) return { ch: HALF_BLOCKS.has(ch) ? ch : "\u2592", color: theme.gray, dim: theme.dimSecondary };
    return { ch, color: theme.primary, dim: false };
  }
  const cols = GRID[0].length;
  const pMin = -TILT * ROWS - HALF;
  const pMax = cols + HALF;
  const p = pMin + ease(t / SWEEP_MS) * (pMax - pMin);
  const d = Math.abs(col - (ROWS - 1 - row) * TILT - p);
  if (d <= HALF && 1 - d / HALF > 0.35) {
    if (HALF_BLOCKS.has(ch)) return { ch, color: theme.gray, dim: theme.dimSecondary };
    return { ch: LIGHTER[ch] ?? ch, color: theme.primary, dim: false };
  }
  return { ch, color: theme.primary, dim: false };
}
function renderRow(row, phase, t, delays, theme) {
  const segments = [];
  GRID[row].forEach((ch, col) => {
    const cell = cellAt(ch, row, col, phase, t, delays[col], theme);
    const last = segments[segments.length - 1];
    if (last && (last.color === cell.color && last.dim === cell.dim || cell.ch === " ")) last.text += cell.ch;
    else segments.push({ text: cell.ch, color: cell.color, dim: cell.dim });
  });
  return segments.map((seg, i) => /* @__PURE__ */ jsx3(Text2, { color: seg.color, dimColor: seg.dim, children: seg.text }, i));
}
function Logo() {
  const theme = useTheme();
  const animated = Boolean(process.stdout.isTTY);
  const delays = useMemo(
    () => GRID.map((row) => row.map(() => Math.random() * INTRO_SPREAD_MS)),
    []
  );
  const [phase, setPhase] = useState2(animated ? "intro" : "idle");
  const [t, setT] = useState2(0);
  useEffect2(() => {
    if (!animated) return;
    if (phase === "idle") {
      const id2 = setTimeout(() => {
        setT(0);
        setPhase("sweep");
      }, SWEEP_EVERY_MS);
      return () => clearTimeout(id2);
    }
    const duration = phase === "intro" ? INTRO_MS : SWEEP_MS;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        setT(0);
        setPhase("idle");
      } else {
        setT(elapsed);
      }
    }, 33);
    return () => clearInterval(id);
  }, [phase, animated]);
  return (
    // flexShrink=0 — the logo must keep its 3 rows even when a phase's
    // content would overflow the screen, or yoga crushes it first
    /* @__PURE__ */ jsx3(Box3, { flexDirection: "column", flexShrink: 0, children: GRID.map((_, row) => /* @__PURE__ */ jsx3(Text2, { children: renderRow(row, phase, t, delays[row], theme) }, row)) })
  );
}

// src/components/panel.tsx
import { Box as Box4, Text as Text3 } from "ink";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
function Panel({ title, width, children }) {
  const theme = useTheme();
  const inner = width - 2;
  const tail = Math.max(0, inner - title.length - 3);
  return /* @__PURE__ */ jsxs2(Box4, { flexDirection: "column", width, children: [
    /* @__PURE__ */ jsxs2(Text3, { children: [
      /* @__PURE__ */ jsx4(Text3, { color: theme.gray, dimColor: theme.dimSecondary, children: "\u256D\u2500 " }),
      /* @__PURE__ */ jsx4(Text3, { color: theme.primary, children: title }),
      /* @__PURE__ */ jsx4(Text3, { color: theme.gray, dimColor: theme.dimSecondary, children: ` ${"\u2500".repeat(tail)}\u256E` })
    ] }),
    /* @__PURE__ */ jsx4(
      Box4,
      {
        width,
        borderStyle: "round",
        borderColor: theme.gray,
        borderDimColor: theme.dimSecondary,
        borderBackgroundColor: theme.background,
        borderTop: false,
        flexDirection: "column",
        paddingX: 2,
        children
      }
    )
  ] });
}

// src/components/progress-bar.tsx
import { Text as Text4 } from "ink";
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
function ProgressBar({ percent, width = 30 }) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, percent));
  const filled = Math.round(clamped * width);
  return /* @__PURE__ */ jsxs3(Text4, { children: [
    /* @__PURE__ */ jsx5(Text4, { color: theme.primary, children: "\u2588".repeat(filled) }),
    /* @__PURE__ */ jsx5(Text4, { color: theme.gray, dimColor: theme.dimSecondary, children: "\u2591".repeat(width - filled) }),
    /* @__PURE__ */ jsxs3(Text4, { color: theme.primary, children: [
      " ",
      `${Math.round(clamped * 100)}%`.padStart(4)
    ] })
  ] });
}

// src/components/shortcuts.tsx
import { Text as Text5 } from "ink";
import { Fragment, jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
function Shortcuts({ items, leading }) {
  const theme = useTheme();
  return /* @__PURE__ */ jsxs4(Text5, { children: [
    leading ? /* @__PURE__ */ jsxs4(Fragment, { children: [
      leading,
      /* @__PURE__ */ jsx6(Text5, { color: theme.gray, dimColor: theme.dimSecondary, children: "  \xB7  " })
    ] }) : null,
    items.map(([key, label], index) => /* @__PURE__ */ jsxs4(Text5, { children: [
      index > 0 ? /* @__PURE__ */ jsx6(Text5, { color: theme.gray, dimColor: theme.dimSecondary, children: "  \xB7  " }) : null,
      /* @__PURE__ */ jsx6(Text5, { color: theme.primary, children: key }),
      /* @__PURE__ */ jsxs4(Text5, { color: theme.gray, dimColor: theme.dimSecondary, children: [
        " ",
        label
      ] })
    ] }, `${key}-${label}`))
  ] });
}

// src/components/text-input.tsx
import { useRef as useRef2, useState as useState3 } from "react";
import { Text as Text6, useInput } from "ink";

// src/lib/use-mouse-click.ts
import { useEffect as useEffect3, useRef } from "react";
import { useStdin, useStdout as useStdout2 } from "ink";
var ENABLE = "\x1B[?1000h\x1B[?1006h";
var DISABLE = "\x1B[?1006l\x1B[?1000l";
var SGR_PRESS = /\u001B\[<(\d+);(\d+);(\d+)M/g;
function useMouseClick(onClick, isActive) {
  const handlerRef = useRef(onClick);
  handlerRef.current = onClick;
  const { stdin } = useStdin();
  const { stdout } = useStdout2();
  useEffect3(() => {
    if (!isActive || !stdin || !stdout || !process.stdin.isTTY) return;
    stdout.write(ENABLE);
    const onData = (data) => {
      for (const match of String(data).matchAll(SGR_PRESS)) {
        const [, button, x, y] = match;
        if (button === "0") handlerRef.current(Number(x), Number(y));
      }
    };
    stdin.on("data", onData);
    return () => {
      stdin.off("data", onData);
      stdout.write(DISABLE);
    };
  }, [isActive, stdin, stdout]);
}
var stripMouseReports = (value) => value.replace(/\u001B?\[?<\d+;\d+;\d+[Mm]/g, "");

// src/components/text-input.tsx
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
var wordLeft = (text, from) => {
  let i = from;
  while (i > 0 && !/\w/.test(text[i - 1])) i--;
  while (i > 0 && /\w/.test(text[i - 1])) i--;
  return i;
};
var wordRight = (text, from) => {
  let i = from;
  while (i < text.length && !/\w/.test(text[i])) i++;
  while (i < text.length && /\w/.test(text[i])) i++;
  return i;
};
function TextInput({
  value,
  onChange,
  onSubmit,
  placeholder = "",
  width = 40,
  history = [],
  submitOnPaste,
  onTab
}) {
  const theme = useTheme();
  const [cursorState, setCursorState] = useState3(value.length);
  const [anchorState, setAnchorState] = useState3(null);
  const [historyPos, setHistoryPos] = useState3(null);
  const draftRef = useRef2("");
  const offsetRef = useRef2(0);
  const cursor = Math.min(cursorState, value.length);
  const anchor = anchorState === null ? null : Math.min(anchorState, value.length);
  const selection = anchor !== null && anchor !== cursor ? [Math.min(anchor, cursor), Math.max(anchor, cursor)] : null;
  const place = (position, selecting = false) => {
    if (selecting) {
      if (anchor === null) setAnchorState(cursor);
    } else {
      setAnchorState(null);
    }
    setCursorState(Math.max(0, Math.min(value.length, position)));
  };
  const edit = (next, position) => {
    setAnchorState(null);
    setCursorState(Math.max(0, Math.min(next.length, position)));
    setHistoryPos(null);
    onChange(next);
  };
  const recall = (text) => {
    setAnchorState(null);
    setCursorState(text.length);
    onChange(text);
  };
  const removeRange = (start, end) => edit(value.slice(0, start) + value.slice(end), start);
  useInput((input, key) => {
    if (key.return) {
      onSubmit?.(value);
      return;
    }
    if (key.tab) {
      onTab?.();
      return;
    }
    if (key.pageUp || key.pageDown) return;
    if (key.escape) {
      setAnchorState(null);
      return;
    }
    if (key.upArrow || key.downArrow) {
      if (history.length === 0) return;
      if (key.upArrow) {
        if (historyPos === null) draftRef.current = value;
        const next2 = historyPos === null ? 0 : Math.min(historyPos + 1, history.length - 1);
        if (next2 === historyPos) return;
        setHistoryPos(next2);
        recall(history[next2]);
      } else if (historyPos !== null) {
        const next2 = historyPos - 1;
        setHistoryPos(next2 < 0 ? null : next2);
        recall(next2 < 0 ? draftRef.current : history[next2]);
      }
      return;
    }
    if (key.home) return place(0);
    if (key.end) return place(value.length);
    if (key.leftArrow || key.rightArrow) {
      const dir = key.leftArrow ? -1 : 1;
      if (selection && !key.shift) return place(dir < 0 ? selection[0] : selection[1]);
      const byWord = key.meta || key.ctrl;
      const target = byWord ? dir < 0 ? wordLeft(value, cursor) : wordRight(value, cursor) : cursor + dir;
      return place(target, key.shift);
    }
    if (key.backspace) {
      if (selection) return removeRange(selection[0], selection[1]);
      return removeRange(key.meta ? wordLeft(value, cursor) : Math.max(0, cursor - 1), cursor);
    }
    if (key.delete) {
      if (selection) return removeRange(selection[0], selection[1]);
      return removeRange(cursor, key.meta ? wordRight(value, cursor) : Math.min(value.length, cursor + 1));
    }
    if (key.ctrl) {
      if (input === "a") return place(0);
      if (input === "e") return place(value.length);
      if (input === "u") return removeRange(0, selection ? selection[1] : cursor);
      if (input === "k") return removeRange(selection ? selection[0] : cursor, value.length);
      if (input === "w") {
        const end2 = selection ? selection[1] : cursor;
        return removeRange(wordLeft(value, selection ? selection[0] : cursor), end2);
      }
      return;
    }
    if (key.meta) {
      if (input === "b") return place(wordLeft(value, cursor));
      if (input === "f") return place(wordRight(value, cursor));
      return;
    }
    if (!input) return;
    const clean = stripMouseReports(input).replace(/[\x00-\x1f\x7f]/g, "");
    if (!clean) return;
    const [start, end] = selection ?? [cursor, cursor];
    const next = value.slice(0, start) + clean + value.slice(end);
    edit(next, start + clean.length);
    if (clean.length > 1 && value === "" && submitOnPaste?.(next.trim())) onSubmit?.(next);
  });
  const span = Math.max(8, width);
  let offset = Math.min(offsetRef.current, Math.max(0, value.length + 1 - span));
  if (cursor < offset) offset = cursor;
  if (cursor > offset + span - 1) offset = cursor - span + 1;
  offsetRef.current = offset;
  if (!value) {
    return /* @__PURE__ */ jsxs5(Text6, { children: [
      /* @__PURE__ */ jsx7(Text6, { inverse: true, children: " " }),
      /* @__PURE__ */ jsx7(Text6, { color: theme.gray, dimColor: theme.dimSecondary, children: placeholder.slice(0, span - 1) })
    ] });
  }
  const cells = Array.from({ length: Math.min(span, value.length - offset + 1) }, (_, column) => {
    const index = offset + column;
    const selected = selection !== null && index >= selection[0] && index < selection[1];
    const atCursor = selection === null && index === cursor;
    return /* @__PURE__ */ jsx7(Text6, { color: theme.primary, inverse: selected || atCursor, children: value[index] ?? " " }, index);
  });
  return /* @__PURE__ */ jsx7(Text6, { children: cells });
}

// src/lib/click-map.ts
var ANSI_PATTERN = new RegExp(
  [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
  ].join("|"),
  "g"
);
var stripAnsi = (text) => text.replace(ANSI_PATTERN, "");
var frameLines = [];
function captureFrames(stream) {
  return new Proxy(stream, {
    get(target, prop) {
      if (prop === "write") {
        return (chunk, ...rest) => {
          const lines = String(chunk).split("\n").map(stripAnsi);
          if (lines.some((line) => line.trim() !== "")) frameLines = lines;
          return target.write(chunk, ...rest);
        };
      }
      const value = Reflect.get(target, prop);
      return typeof value === "function" ? value.bind(target) : value;
    }
  });
}
function clickTargetAt(x, y, targets) {
  for (const target of targets) {
    const { match, padX = 1, padY = 0 } = target;
    for (let row = y - 1 - padY; row <= y - 1 + padY; row++) {
      const line = frameLines[row];
      if (!line) continue;
      let index = line.indexOf(match);
      while (index !== -1) {
        if (x - 1 >= index - padX && x - 1 <= index + match.length - 1 + padX) return target;
        index = line.indexOf(match, index + 1);
      }
    }
  }
  return void 0;
}
function findFrameRow(text) {
  return frameLines.findIndex((line) => line.includes(text));
}
function frameRowSpan(row) {
  const line = frameLines[row];
  if (!line) return void 0;
  const first = line.search(/\S/);
  if (first === -1) return void 0;
  return [first + 1, line.trimEnd().length];
}

// src/lib/history.ts
import fs from "fs";
import os from "os";
import path from "path";
var HISTORY_FILE = path.join(os.homedir(), ".config", "yoinks", "history.json");
var LIMIT = 50;
function loadHistory() {
  try {
    const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "string") : [];
  } catch {
    return [];
  }
}
function addToHistory(url) {
  const next = [url, ...loadHistory().filter((entry) => entry !== url)].slice(0, LIMIT);
  try {
    fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
    fs.writeFileSync(HISTORY_FILE, `${JSON.stringify(next, null, 2)}
`);
  } catch {
  }
  return next;
}

// src/lib/platforms.ts
var PLATFORMS = [
  { hosts: ["youtube.com", "youtu.be", "music.youtube.com"], platform: { key: "youtube", label: "YouTube" } },
  { hosts: ["x.com", "twitter.com"], platform: { key: "x", label: "X / Twitter" } },
  { hosts: ["instagram.com"], platform: { key: "instagram", label: "Instagram" } },
  { hosts: ["threads.net", "threads.com"], platform: { key: "threads", label: "Threads" } },
  { hosts: ["tiktok.com"], platform: { key: "tiktok", label: "TikTok" } },
  { hosts: ["vimeo.com"], platform: { key: "vimeo", label: "Vimeo" } },
  { hosts: ["twitch.tv"], platform: { key: "twitch", label: "Twitch" } },
  { hosts: ["reddit.com"], platform: { key: "reddit", label: "Reddit" } },
  { hosts: ["facebook.com", "fb.watch"], platform: { key: "facebook", label: "Facebook" } }
];
function detectPlatform(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return { key: "unknown", label: "Unknown site" };
  }
  for (const { hosts, platform } of PLATFORMS) {
    if (hosts.some((h) => hostname === h || hostname.endsWith(`.${h}`))) {
      return platform;
    }
  }
  return { key: "generic", label: hostname };
}
function isProbablyUrl(input) {
  try {
    const u = new URL(input.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// src/app.tsx
import { Fragment as Fragment2, jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
var DEFAULT_OUT_DIR = path2.join(os2.homedir(), "Downloads");
var YOINK_BUTTON = "yoink";
var DONE_LABEL = "\u21B5 yoink another";
var TAGLINE = "yoink any video. paste. yoink. done.";
var choiceLabel = (choice) => `${choice.kind === "audio" ? "\u266A " : "\u25B6 "}${choice.label}`;
function ChoiceIndicator({ isSelected }) {
  const theme = useTheme();
  return /* @__PURE__ */ jsx8(Box5, { marginRight: 1, children: /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: isSelected ? "\u276F" : " " }) });
}
function ChoiceItem({ isSelected, label }) {
  const theme = useTheme();
  return /* @__PURE__ */ jsx8(Text7, { color: theme.primary, bold: isSelected, children: label });
}
var Gap = ({ lines = 1 }) => /* @__PURE__ */ jsx8(Box5, { flexDirection: "column", flexShrink: 0, children: Array.from({ length: lines }, (_, i) => /* @__PURE__ */ jsx8(Text7, { children: " " }, i)) });
function partLabel(progress) {
  return progress.totalParts > 1 ? `part ${progress.part + 1}/${progress.totalParts}  ` : "";
}
function downloadMeta(progress) {
  const speed = progress.speed ? formatSpeed(progress.speed) : "";
  const eta = progress.eta ? `${formatEta(progress.eta)} left` : "";
  return `${partLabel(progress)}${speed.padStart(10)}  ${eta.padEnd(12)}`;
}
function indeterminateMeta(progress) {
  const bytes = formatBytes(progress.downloadedBytes);
  const speed = progress.speed ? formatSpeed(progress.speed) : "";
  return `${partLabel(progress)}${bytes.padStart(8)}  ${speed.padEnd(10)}`;
}
var HINTS = {
  input: [
    ["\u21B5", "yoink"],
    ["^c", "quit"]
  ],
  probing: [
    ["esc", "cancel"],
    ["^c", "quit"]
  ],
  picking: [
    ["\u2191\u2193", "choose"],
    ["\u21B5", "yoink"],
    ["esc", "back"],
    ["^c", "quit"]
  ],
  downloading: [
    ["esc", "cancel"],
    ["^c", "quit"]
  ],
  done: [["^c", "quit"]],
  error: [
    ["\u21B5", "try again"],
    ["^c", "quit"]
  ]
};
function App({ initialThemeMode: initialThemeMode2 = "auto", ...props }) {
  const [themeMode, setThemeMode] = useState4(initialThemeMode2);
  const cycleTheme = useCallback(() => {
    setThemeMode(nextThemeMode);
  }, []);
  return /* @__PURE__ */ jsx8(ThemeProvider, { mode: themeMode, children: /* @__PURE__ */ jsx8(AppContent, { ...props, cycleTheme }) });
}
function AppContent({
  initialUrl: initialUrl2,
  clipboardUrl: clipboardUrl2,
  outDir: outDir2 = DEFAULT_OUT_DIR,
  onOutcome,
  cycleTheme
}) {
  const theme = useTheme();
  const { exit } = useApp();
  const { stdout } = useStdout3();
  const [url, setUrl] = useState4(initialUrl2 ?? "");
  const [urlInput, setUrlInput] = useState4("");
  const [history, setHistory] = useState4(loadHistory);
  const [platform, setPlatform] = useState4();
  const [info, setInfo] = useState4();
  const [choices, setChoices] = useState4([]);
  const ytdlpRef = useRef3("");
  const highlightRef = useRef3(0);
  const infoJsonRef = useRef3(void 0);
  const abortRef = useRef3(void 0);
  const [phase, setPhase] = useState4(initialUrl2 ? { name: "probing", status: "warming up\u2026" } : { name: "input" });
  const columns = stdout?.columns && stdout.columns > 0 ? stdout.columns : 80;
  const boxWidth = Math.max(14, Math.min(64, columns - 6));
  const contentWidth = Math.max(10, Math.min(columns - 4, 78));
  const startProbe = useCallback(async (targetUrl) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setPlatform(detectPlatform(targetUrl));
    setPhase({ name: "probing", status: "warming up\u2026" });
    try {
      const { sanitizedUrl } = GinaYoinksSecurityGuard.validateAndSanitizeUrl(targetUrl);
      const ytdlp = ytdlpRef.current || await ensureYtDlp((status) => setPhase({ name: "probing", status }), controller.signal);
      ytdlpRef.current = ytdlp;
      if (controller.signal.aborted) return;
      setPhase({ name: "probing", status: "fetching video info\u2026" });
      const { info: videoInfo, infoJsonPath } = await probe(ytdlp, sanitizedUrl, controller.signal);
      if (controller.signal.aborted) return;
      infoJsonRef.current = infoJsonPath;
      setInfo(videoInfo);
      setChoices(buildChoices(videoInfo));
      highlightRef.current = 0;
      setPhase({ name: "picking" });
    } catch (error) {
      if (controller.signal.aborted) return;
      setPhase({ name: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }, []);
  useEffect4(() => {
    if (initialUrl2) void startProbe(initialUrl2);
  }, [initialUrl2, startProbe]);
  const resetToInput = useCallback(() => {
    setUrl("");
    setUrlInput("");
    setPlatform(void 0);
    setInfo(void 0);
    setChoices([]);
    setPhase({ name: "input" });
  }, []);
  const cancelRun = useCallback(() => {
    abortRef.current?.abort();
    resetToInput();
    setUrlInput(url);
  }, [resetToInput, url]);
  useInput2(
    (input, key) => {
      if (key.ctrl && input === "t") {
        cycleTheme();
        return;
      }
      if (key.escape && (phase.name === "picking" || phase.name === "error" || phase.name === "done")) resetToInput();
      if (key.escape && (phase.name === "probing" || phase.name === "downloading")) cancelRun();
      if (key.return && (phase.name === "error" || phase.name === "done")) resetToInput();
    },
    { isActive: Boolean(process.stdin.isTTY) }
  );
  const handleUrlSubmit = (value) => {
    const trimmed = value.trim();
    if (!isProbablyUrl(trimmed)) {
      setPhase({ name: "input", warning: "that doesn\u2019t look like a link \u2014 paste a full url" });
      return;
    }
    try {
      const { sanitizedUrl } = GinaYoinksSecurityGuard.validateAndSanitizeUrl(trimmed);
      setUrl(sanitizedUrl);
      void startProbe(sanitizedUrl);
    } catch (error) {
      setPhase({ name: "input", warning: error instanceof Error ? error.message : String(error) });
    }
  };
  const clipboardOffered = Boolean(clipboardUrl2) && urlInput === "";
  const clipboardAccepted = Boolean(clipboardUrl2) && urlInput === clipboardUrl2;
  const handlePick = (item) => {
    const choice = choices[item.value];
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase({ name: "downloading", choice, processing: false });
    void (async () => {
      const handlers = {
        onProgress: (progress) => setPhase((prev) => prev.name === "downloading" ? { ...prev, progress, processing: false } : prev),
        onProcessing: () => setPhase((prev) => prev.name === "downloading" ? { ...prev, processing: true } : prev)
      };
      try {
        const ffmpegLocation = await findFfmpeg();
        const base = { ytdlp: ytdlpRef.current, ffmpegLocation, url, choice, outDir: outDir2 };
        let filepath;
        try {
          filepath = await download({ ...base, infoJsonPath: infoJsonRef.current }, handlers, controller.signal);
        } catch (error) {
          if (controller.signal.aborted) throw error;
          setPhase(
            (prev) => prev.name === "downloading" ? { ...prev, progress: void 0, refreshing: true } : prev
          );
          filepath = await download(base, handlers, controller.signal);
        }
        onOutcome({ filepath, url });
        setHistory(addToHistory(url));
        setPhase({ name: "done", filepath });
      } catch (error) {
        if (controller.signal.aborted) return;
        setPhase({ name: "error", message: error instanceof Error ? error.message : String(error) });
      }
    })();
  };
  let hints = [...HINTS[phase.name], ["^t", `theme:${theme.mode}`]];
  if (phase.name === "input" && history.length > 0) {
    hints = [hints[0], ["\u2191", "history"], ...hints.slice(1)];
  }
  const hintAction = (key) => {
    if (key === "^c") return () => exit();
    if (key === "^t") return cycleTheme;
    if (key === "esc") return phase.name === "probing" || phase.name === "downloading" ? cancelRun : resetToInput;
    if (key === "\u21B5") {
      if (phase.name === "input") return () => handleUrlSubmit(urlInput);
      if (phase.name === "picking") return () => handlePick({ value: highlightRef.current });
      if (phase.name === "error" || phase.name === "done") return resetToInput;
    }
    return void 0;
  };
  const clickTargets = [];
  if (phase.name === "input") {
    clickTargets.push({ match: `  ${YOINK_BUTTON}  `, padY: 1, action: () => handleUrlSubmit(urlInput) });
  }
  if (phase.name === "picking") {
    for (const [index, choice] of choices.entries()) {
      clickTargets.push({ match: choiceLabel(choice), action: () => handlePick({ value: index }) });
    }
  }
  if (phase.name === "done") {
    clickTargets.push({ match: DONE_LABEL, padX: 4, padY: 1, action: resetToInput });
  }
  for (const [key, label] of hints) {
    const action = hintAction(key);
    if (action) clickTargets.push({ match: `${key} ${label}`, action });
  }
  useMouseClick(
    (x, y) => {
      const taglineRow = findFrameRow(TAGLINE);
      if (taglineRow > 3 && y - 1 >= taglineRow - 4 && y - 1 <= taglineRow - 2) {
        const span = frameRowSpan(y - 1);
        if (span && x >= span[0] - 1 && x <= span[1] + 1) {
          if (phase.name === "probing" || phase.name === "downloading") cancelRun();
          else if (phase.name !== "input") resetToInput();
          return;
        }
      }
      clickTargetAt(x, y, clickTargets)?.action();
    },
    Boolean(process.stdin.isTTY)
  );
  return /* @__PURE__ */ jsxs6(FullScreen, { children: [
    /* @__PURE__ */ jsx8(Logo, {}),
    /* @__PURE__ */ jsx8(Gap, {}),
    /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: TAGLINE }),
    /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: "youtube \xB7 x \xB7 instagram \xB7 threads \xB7 tiktok \xB7 +1800 more" }),
    /* @__PURE__ */ jsx8(Gap, {}),
    phase.name === "input" && /* @__PURE__ */ jsxs6(Box5, { flexDirection: "column", alignItems: "center", children: [
      /* @__PURE__ */ jsx8(FramedInput, { title: "Paste a link", width: boxWidth, button: YOINK_BUTTON, children: /* @__PURE__ */ jsx8(
        TextInput,
        {
          value: urlInput,
          onChange: setUrlInput,
          onSubmit: handleUrlSubmit,
          placeholder: "https://youtube.com/watch?v=\u2026",
          width: boxWidth - 6,
          history,
          submitOnPaste: isProbablyUrl,
          onTab: () => {
            if (clipboardOffered) setUrlInput(clipboardUrl2);
          }
        }
      ) }),
      phase.warning ? /* @__PURE__ */ jsxs6(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: [
        "\u2717 ",
        phase.warning
      ] }) : clipboardOffered ? /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: "link in your clipboard \u2014 \u21E5 to paste it" }) : clipboardAccepted ? /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: "from your clipboard \u2014 \u21B5 to yoink it" }) : null
    ] }),
    phase.name === "probing" && /* @__PURE__ */ jsx8(Box5, { flexDirection: "column", alignItems: "center", children: /* @__PURE__ */ jsx8(FramedInput, { title: platform ? platform.label : "Paste a link", width: boxWidth, button: YOINK_BUTTON, buttonDim: true, children: /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: url.length > boxWidth - 8 ? `${url.slice(0, boxWidth - 9)}\u2026` : url }) }) }),
    phase.name === "picking" && platform && /* @__PURE__ */ jsxs6(Box5, { width: contentWidth, children: [
      /* @__PURE__ */ jsxs6(Box5, { flexDirection: "column", flexGrow: 1, flexBasis: 0, paddingTop: 1, paddingRight: 3, children: [
        wrapText(info?.title ?? "", Math.max(10, contentWidth - 41)).map((line, index) => /* @__PURE__ */ jsx8(Text7, { bold: true, color: theme.primary, children: line }, index)),
        /* @__PURE__ */ jsx8(Gap, {}),
        /* @__PURE__ */ jsxs6(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: [
          "\u25B8 ",
          platform.label,
          info?.duration ? ` \xB7 ${formatDuration(info.duration)}` : "",
          info?.uploader ? ` \xB7 ${info.uploader}` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsx8(Panel, { title: "Download", width: 38, children: /* @__PURE__ */ jsx8(
        SelectInput,
        {
          indicatorComponent: ChoiceIndicator,
          itemComponent: ChoiceItem,
          items: choices.map((choice, index) => ({
            key: String(index),
            label: choiceLabel(choice),
            value: index
          })),
          onSelect: handlePick,
          onHighlight: (item) => highlightRef.current = item.value
        }
      ) })
    ] }),
    phase.name === "downloading" && /* @__PURE__ */ jsxs6(Box5, { flexDirection: "column", alignItems: "center", children: [
      /* @__PURE__ */ jsxs6(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: [
        info?.title ? `${truncate(info.title, 42)} \xB7 ` : "",
        phase.choice.label
      ] }),
      /* @__PURE__ */ jsx8(Gap, {}),
      phase.processing ? /* @__PURE__ */ jsxs6(Fragment2, { children: [
        /* @__PURE__ */ jsx8(ProgressBar, { percent: 1 }),
        /* @__PURE__ */ jsx8(Gap, {}),
        /* @__PURE__ */ jsxs6(Text7, { children: [
          /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: /* @__PURE__ */ jsx8(Spinner, { type: "dots" }) }),
          /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: " processing\u2026" })
        ] })
      ] }) : phase.progress?.totalBytes ? /* @__PURE__ */ jsxs6(Fragment2, { children: [
        /* @__PURE__ */ jsx8(ProgressBar, { percent: phase.progress.downloadedBytes / phase.progress.totalBytes }),
        /* @__PURE__ */ jsx8(Gap, {}),
        /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: downloadMeta(phase.progress) })
      ] }) : phase.progress ? /* @__PURE__ */ jsxs6(Fragment2, { children: [
        /* @__PURE__ */ jsxs6(Text7, { children: [
          /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: /* @__PURE__ */ jsx8(Spinner, { type: "dots" }) }),
          /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: " downloading\u2026" })
        ] }),
        /* @__PURE__ */ jsx8(Gap, {}),
        /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: indeterminateMeta(phase.progress) })
      ] }) : /* @__PURE__ */ jsxs6(Fragment2, { children: [
        /* @__PURE__ */ jsx8(ProgressBar, { percent: 0 }),
        /* @__PURE__ */ jsx8(Gap, {}),
        /* @__PURE__ */ jsxs6(Text7, { children: [
          /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: /* @__PURE__ */ jsx8(Spinner, { type: "dots" }) }),
          /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: phase.refreshing ? " link expired \u2014 grabbing a fresh one\u2026" : " starting download\u2026" })
        ] })
      ] })
    ] }),
    phase.name === "done" && /* @__PURE__ */ jsxs6(Box5, { flexDirection: "column", alignItems: "center", children: [
      /* @__PURE__ */ jsxs6(Text7, { children: [
        /* @__PURE__ */ jsx8(Text7, { bold: true, color: theme.primary, children: "\u2713 yoinked! " }),
        /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: "find your file in:" })
      ] }),
      /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: shortenPath(phase.filepath, os2.homedir(), 60) }),
      /* @__PURE__ */ jsx8(Gap, {}),
      /* @__PURE__ */ jsx8(
        Box5,
        {
          borderStyle: "round",
          borderColor: theme.gray,
          borderDimColor: theme.dimSecondary,
          borderBackgroundColor: theme.background,
          paddingX: 3,
          children: /* @__PURE__ */ jsx8(Text7, { bold: true, color: theme.primary, children: DONE_LABEL })
        }
      )
    ] }),
    phase.name === "error" && /* @__PURE__ */ jsx8(Box5, { flexDirection: "column", alignItems: "center", width: Math.max(10, Math.min(columns - 6, 72)), children: /* @__PURE__ */ jsxs6(Text7, { bold: true, color: theme.primary, children: [
      "\u2717 ",
      phase.message
    ] }) }),
    hints.length > 0 ? /* @__PURE__ */ jsxs6(Fragment2, { children: [
      /* @__PURE__ */ jsx8(Gap, { lines: 2 }),
      /* @__PURE__ */ jsx8(
        Shortcuts,
        {
          items: hints,
          leading: phase.name === "probing" ? /* @__PURE__ */ jsxs6(Text7, { children: [
            /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: /* @__PURE__ */ jsx8(Spinner, { type: "dots" }) }),
            /* @__PURE__ */ jsxs6(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: [
              " ",
              phase.status
            ] })
          ] }) : void 0
        }
      )
    ] }) : null
  ] });
}

// src/lib/args.ts
var THEME_MODES2 = ["auto", "light", "dark"];
function isThemeMode(value) {
  return typeof value === "string" && THEME_MODES2.includes(value);
}
function parseArgs(args2) {
  const result = { help: false, version: false };
  const positional = [];
  for (let index = 0; index < args2.length; index++) {
    const arg = args2[index];
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
      const value = args2[++index];
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
      const value = args2[++index];
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

// src/lib/clipboard.ts
import { execFileSync } from "child_process";
var COMMANDS = process.platform === "darwin" ? [["pbpaste", []]] : process.platform === "win32" ? [["powershell", ["-NoProfile", "-Command", "Get-Clipboard"]]] : [
  ["wl-paste", ["--no-newline"]],
  ["xclip", ["-selection", "clipboard", "-o"]],
  ["xsel", ["--clipboard", "--output"]]
];
function readClipboard() {
  for (const [command, args2] of COMMANDS) {
    try {
      return execFileSync(command, args2, { encoding: "utf8", timeout: 500, stdio: ["ignore", "pipe", "ignore"] });
    } catch {
    }
  }
  return "";
}

// src/cli.tsx
import { jsx as jsx9 } from "react/jsx-runtime";
var VERSION = createRequire(import.meta.url)("../package.json").version;
var HELP = `
  yoinks \u2014 yoink any video. paste. yoink. done.
  [GINASERVICE Sovereign Media Tool \u2014 GINA-SEC-7L-2026 | SEC-L1/TS-L1]

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
  Powered by yt-dlp \u2014 YouTube, X, Instagram, Threads, TikTok & 1800+ sites.
`;
var args = parseArgs(process.argv.slice(2));
if (args.error) {
  console.error(`yoinks: ${args.error}
Try \u201Cyoinks --help\u201D for usage.`);
  process.exit(1);
}
if (args.help) {
  console.log(HELP);
  process.exit(0);
}
if (args.version) {
  console.log(VERSION);
  process.exit(0);
}
var outDir = args.outDir ? path3.resolve(args.outDir) : path3.join(os3.homedir(), "Downloads");
var initialUrl = args.initialUrl;
if (initialUrl) {
  try {
    const validated = GinaYoinksSecurityGuard.validateAndSanitizeUrl(initialUrl);
    initialUrl = validated.sanitizedUrl;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
if (args.best || args.mp3) {
  if (!initialUrl) {
    console.error("yoinks: --best and --mp3 require a target URL.\nTry \u201Cyoinks --help\u201D for usage.");
    process.exit(1);
  }
  try {
    const { filepath, auditRecord } = await runHeadlessDownload({
      url: initialUrl,
      mode: args.mp3 ? "mp3" : "best",
      outDir,
      agentId: process.env.GINA_AGENT_ID ?? "GINA-DIR5-MEDIA-001"
    });
    if (args.jsonAudit || args.wormLog) {
      console.log(JSON.stringify({ ...auditRecord, filepath }, null, 2));
    } else {
      console.log(`\u2713 yoinked \u2192 ${filepath}`);
    }
    process.exit(0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
var initialThemeMode = args.themeMode ?? "auto";
var isTTY = Boolean(process.stdout.isTTY);
var clipboardUrl;
if (!initialUrl && isTTY) {
  const clipped = readClipboard().trim();
  if (clipped && !/\s/.test(clipped) && isProbablyUrl(clipped)) clipboardUrl = clipped;
}
var enterAltScreen = () => process.stdout.write("\x1B[?1049h\x1B[H");
var leaveAltScreen = () => process.stdout.write("\x1B[?1006l\x1B[?1000l\x1B[?1049l");
if (isTTY) {
  enterAltScreen();
  process.on("exit", leaveAltScreen);
  for (const event of ["uncaughtException", "unhandledRejection"]) {
    process.on(event, (error) => {
      leaveAltScreen();
      console.error(error);
      process.exit(1);
    });
  }
}
var outcome = {};
var { waitUntilExit } = render(
  /* @__PURE__ */ jsx9(
    App,
    {
      initialUrl,
      clipboardUrl,
      initialThemeMode,
      outDir,
      onOutcome: (result) => outcome = result
    }
  ),
  // keep a copy of every frame so clicks can be hit-tested against it
  { stdout: captureFrames(process.stdout) }
);
await waitUntilExit();
if (isTTY) leaveAltScreen();
if (outcome.filepath) {
  if (args.jsonAudit || args.wormLog) {
    const auditRecord = GinaYoinksSecurityGuard.generateWormAuditRecord(
      outcome.filepath,
      outcome.url ?? initialUrl ?? "interactive-session",
      process.env.GINA_AGENT_ID ?? "GINA-DIR5-MEDIA-001"
    );
    console.log(JSON.stringify({ ...auditRecord, filepath: outcome.filepath }, null, 2));
  } else {
    console.log(`\u2713 yoinked \u2192 ${outcome.filepath}`);
  }
}
