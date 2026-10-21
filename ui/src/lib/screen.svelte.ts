import { api, type ScreenFrame } from "./api"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function createScreen(getOn: () => string) {
  let frame = $state<ScreenFrame | undefined>(undefined)
  let error = $state<string | undefined>(undefined)

  $effect(() => {
    const on = getOn()
    let alive = true
    let seq = 0
    frame = undefined
    error = undefined

    const loop = async () => {
      while (alive) {
        try {
          const next = await api.screen(on, seq)
          if (!alive) return
          if (next.image) {
            seq = next.seq
            frame = next
            error = undefined
          } else if (next.error) {
            error = next.error
            await sleep(1500)
          }
        } catch (e) {
          if (!alive) return
          const message = (e as Error).message
          if (/x-openspaces-token/.test(message)) {
            error = "This page's link is out of date. Open the new link that `openspaces ui` printed."
            return
          }
          error = message
          await sleep(1500)
        }
      }
    }

    void loop()
    return () => {
      alive = false
    }
  })

  return {
    get frame() { return frame },
    get error() { return error },
  }
}
