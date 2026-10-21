import type { ScreenFrame } from "./api"

export function createRecorder(getFrame: () => ScreenFrame | undefined, getName: () => string) {
  let recording = $state(false)
  let secs = $state(0)
  let canvas: HTMLCanvasElement | null = null
  let recorder: MediaRecorder | null = null
  let chunks: Blob[] = []

  $effect(() => {
    if (!recording) return
    const t = setInterval(() => {
      secs += 1
    }, 1000)
    return () => clearInterval(t)
  })

  $effect(() => {
    const frame = getFrame()
    if (!recording || !frame?.image || !canvas) return
    const img = new Image()
    img.onload = () => canvas?.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height)
    img.src = `data:image/jpeg;base64,${frame.image}`
  })

  const start = () => {
    if (recording || typeof MediaRecorder === "undefined") return
    const frame = getFrame()
    const name = getName()
    const c = document.createElement("canvas")
    c.width = frame?.width ?? 1280
    c.height = frame?.height ?? 800
    canvas = c
    chunks = []
    const type = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm"
    const rec = new MediaRecorder(c.captureStream(12), { mimeType: type, videoBitsPerSecond: 4_000_000 })
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data)
    rec.onstop = () => {
      const url = URL.createObjectURL(new Blob(chunks, { type: "video/webm" }))
      const a = document.createElement("a")
      a.href = url
      a.download = `openspaces-${name.replace(/[^a-z0-9-]+/gi, "-")}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.webm`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    }
    rec.start(1000)
    recorder = rec
    secs = 0
    recording = true
  }

  const stop = () => {
    recorder?.stop()
    recorder = null
    recording = false
  }

  return {
    get recording() { return recording },
    get secs() { return secs },
    start,
    stop,
    get supported() { return typeof MediaRecorder !== "undefined" },
  }
}

export function clock(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}
