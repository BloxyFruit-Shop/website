<script lang="ts">
  import cn from "$lib/utils/cn"
  export let pauseOnHover = false
  export let vertical = false
  export let repeat = 4
  export let reverse = false

  let className = ""
  export { className as class }
</script>

<div
  class={cn(
    "group flex overflow-hidden p-2 [--duration:2s] [--gap:1rem] [gap:var(--gap)]",
    {
      "flex-row": !vertical,
      "flex-col": vertical,
    },
    className
  )}
>
  {#each { length: repeat } as _, i (i)}
    <div
      class={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
        "animate-marquee flex-row": !vertical,
        "animate-marquee-vertical flex-col": vertical,
        "group-hover:[animation-play-state:paused]": pauseOnHover,
        "[animation-direction:reverse]": reverse,
      })}
    >
      <slot>Default</slot>
    </div>
  {/each}
</div>