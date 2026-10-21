<script lang="ts">
  import type { AgentName } from "$lib/api"
  import Gecko from "./Gecko.svelte"
  import type { Mood } from "./gecko"

  let {
    agent,
    size = 36,
    busy = false,
    mood,
    seed,
  }: {
    agent: AgentName
    size?: number
    busy?: boolean
    mood?: Mood
    seed?: string
  } = $props()
</script>

<Gecko {agent} {seed} {size} mood={mood ?? (busy ? "busy" : "idle")} />
