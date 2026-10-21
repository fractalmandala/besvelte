export function createPoll<T>(load: () => Promise<T>, ms: number) {
  let data = $state<T | undefined>(undefined)
  let error = $state<string | undefined>(undefined)

  async function refresh() {
    try {
      data = await load()
      error = undefined
    } catch (e) {
      error = (e as Error).message
    }
  }

  $effect(() => {
    let alive = true
    const tick = async () => {
      if (alive) await refresh()
    }
    void tick()
    const timer = setInterval(tick, ms)
    return () => {
      alive = false
      clearInterval(timer)
    }
  })

  return {
    get data() { return data },
    get error() { return error },
    refresh,
  }
}
