import { GECKO } from "$lib/assets/geckos"
import type { AgentName, ThreadStatus } from "$lib/api"

export type GeckoMood = keyof typeof GECKO.moods
export type Mood = "idle" | "starting" | "busy" | "done" | "stuck" | "dead" | "asleep"

export const TINT: Record<AgentName | "brand", { readonly from: string; readonly to: string; readonly shade: string }> = {
  brand: { from: "#5ef2b0", to: "#12b06d", shade: "#0b7a4b" },
  "claude-code": { from: "#5ef2b0", to: "#12b06d", shade: "#0b7a4b" },
  codex: { from: "#c4b5fd", to: "#7c3aed", shade: "#5b21b6" },
  gemini: { from: "#93c5fd", to: "#2563eb", shade: "#1e40af" },
  opencode: { from: "#fde68a", to: "#f97316", shade: "#c2410c" },
  shell: { from: "#fbcfe8", to: "#ec4899", shade: "#be185d" },
  emgem: { from: "#34d399", to: "#059669", shade: "#064e3b" },
  fractalai: { from: "#38bdf8", to: "#6366f1", shade: "#4338ca" },
}

export const PALETTE = [
  { from: "#5ef2b0", to: "#12b06d", shade: "#0b7a4b" }, // mint
  { from: "#c4b5fd", to: "#7c3aed", shade: "#5b21b6" }, // violet
  { from: "#93c5fd", to: "#2563eb", shade: "#1e40af" }, // blue
  { from: "#fde68a", to: "#f97316", shade: "#c2410c" }, // orange
  { from: "#fbcfe8", to: "#ec4899", shade: "#be185d" }, // pink
  { from: "#a5f3fc", to: "#06b6d4", shade: "#0e7490" }, // cyan
  { from: "#fecaca", to: "#ef4444", shade: "#b91c1c" }, // coral
  { from: "#d9f99d", to: "#65a30d", shade: "#3f6212" }, // lime
  { from: "#c7d2fe", to: "#4f46e5", shade: "#3730a3" }, // indigo
  { from: "#fef08a", to: "#eab308", shade: "#a16207" }, // yellow
  { from: "#f5d0fe", to: "#c026d3", shade: "#86198f" }, // magenta
  { from: "#99f6e4", to: "#14b8a6", shade: "#0f766e" }, // teal
] as const

export function colorFor(seed: string): (typeof PALETTE)[number] {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return PALETTE[Math.abs(h) % PALETTE.length]!
}

export function moodOf(status: ThreadStatus, error?: string): Mood {
  if (status === "starting") return "starting"
  if (status === "running") return "busy"
  if (status === "failed") return error && /worker|crash|exited before/.test(error) ? "dead" : "stuck"
  if (status === "closed") return "asleep"
  return "done"
}

export const FACE: Record<Mood, GeckoMood> = {
  idle: "look",
  starting: "alert",
  busy: "sparkle",
  done: "happy",
  stuck: "dizzy",
  dead: "dead",
  asleep: "happy",
}
