<script>
  import { Checkbox } from "bits-ui";
  import Check from "$icons/check.svelte";

  export let label
</script>
 
<div class="flex items-center gap-2 {$$props.wrapperClass}">
  <Checkbox.Root
    id="terms"
    aria-labelledby="terms-label"
    class="peer inline-flex size-[22px] items-center justify-center rounded-md bg-[#1D2535] transition-all duration-150 ease-in-out data-[state=checked]:bg-[#3BA4F0]"
  >
    <Checkbox.Indicator
      let:isChecked
      class="inline-flex items-center justify-center text-background"
    >
      <Check class="text-white size-4 {isChecked ? "opacity-100" : "opacity-0"} transition-opacity" strokeWidth={2.5} />
    </Checkbox.Indicator>
  </Checkbox.Root>
  {#if label}
    <p class="text-[#809BB5] font-semibold">{label}</p>
  {:else}
    <slot />
  {/if}
</div>