import { api, type Thread, type ThreadEvent } from "./api"

const POLL_MS = 900

export function createThread(getId: () => string) {
  let thread = $state<Thread | undefined>(undefined)
  let events = $state<ThreadEvent[]>([])
  let error = $state<string | undefined>(undefined)
  let count = 0
  let inFlight = false
  let currentId = ""

  async function load() {
    if (inFlight) return
    inFlight = true
    const id = getId()
    const after = count
    try {
      const res = await api.thread(id, after)
      if (id !== currentId) return
      thread = res.thread
      if (res.events.length > 0 && count === after) {
        count = after + res.events.length
        events = [...events, ...res.events]
      }
      error = undefined
    } catch (e) {
      if (id === currentId) error = (e as Error).message
    } finally {
      inFlight = false
    }
  }

  $effect(() => {
    const id = getId()
    currentId = id
    inFlight = false
    count = 0
    thread = undefined
    events = []
    error = undefined
    void load()
    const timer = setInterval(() => void load(), POLL_MS)
    return () => clearInterval(timer)
  })

  return {
    get thread() { return thread },
    get events() { return events },
    get error() { return error },
    refresh: load,
  }
}
