<script>
  import { toast as _toast, position } from "./stores"
  export let toast

  import Check from "$icons/check.svelte"
  import Close from "$icons/close.svelte"
  // import XTriangle from "$icons/close.svelte"
  // import ShieldError from "$icons/shield-error.svelte"

  const colorVariations = {
    success: {
      overlay: "from-green-500/25",
      circle: "bg-green-500"
    },
    error: {
      overlay: "from-red-500/25",
      circle: "bg-red-500"
    },
    warning: {
      overlay: "from-green-500/25",
      circle: "bg-green-500"
    },
  }

  const defaultTitles = {
    success: "Success!",
    error: "Error!",
    warning: "Warning!"
  }
</script>

<div
  id="svoast-{toast.id}"
  aria-live="polite"
  role="status" 
  data-position={$position}
  class="bg-[#1D2535] rounded-xl flex items-center gap-1 w-[320px] p-3.5 z-[100] pointer-events-auto relative overflow-hidden"
>
  <div class="{colorVariations[toast.type].circle} absolute bottom-0 left-0 h-[3px] rounded-full w-full origin-left" style="animation: scale-x-0 {toast.duration}ms linear forwards"></div>

  <div class="absolute left-0 top-0 size-full bg-gradient-to-r {colorVariations[toast.type].overlay} via-40% via-transparent to-transparent"></div>
  <div class="bg-white/5 size-9 p-1 rounded-full shrink-0">
    <div class="{colorVariations[toast.type].circle} rounded-full size-full flex items-center justify-center">
      {#if toast.type == "success"}
        <Check class="text-[#1D2535] size-5" strokeWidth={5} />
      {:else if toast.type == "error"}
        <Close class="text-[#1D2535] size-5" strokeWidth={3}/>
      {:else if toast.type == "warning"}
        <!-- <ShieldError class="text-yellow-500 size-[30px]" strokeWidth={2.6}/> -->
      {/if}
    </div>
  </div>
  <div class="flex flex-col ml-2 z-[101]">
    <p class="text-white font-semibold leading-none">{defaultTitles[toast.type]}</p>
    <p class="text-[#A0C3DB] text-sm font-medium mt-0.5">{toast.message}</p>
  </div>

  {#if toast.closable}
    <button class="absolute right-2 top-2 z-[101]" on:click={() => { _toast.removeById(toast.id) }}>
      <Close class="size-[18px] text-[#A0C3DB]" strokeWidth={2.5} />
    </button>
  {/if}
</div>