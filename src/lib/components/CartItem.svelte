<script>
  import { Plus, Minus } from "$icons"
  import { lazyLoad, formatCurrency } from "$lib/utils"
  import { currencyStore, currencyRateStore } from "$lib/utils/stores"
  import { blur, fly } from "svelte/transition"

  export let bgGradient
  export let image
  export let title
  export let amount
  export let price
  export let comparePrice
  export let onUpdate
</script>

<div class="flex items-center" in:fly={{ y: 20 }} out:blur={{ duration: 200 }}>
  {#key title}
    <div class="bg-[#1D2535] rounded-xl size-[64px] flex items-center justify-center relative overflow-hidden">
      <div 
        class="absolute size-full pointer-events-none select-none"
        style="background: {bgGradient}"
      ></div>
      <img use:lazyLoad={image} alt="Item thumbnail" class="size-[54px] z-[5] pointer-events-none object-contain select-none opacity-0" />
    </div>
    <div class="flex flex-col justify-center ml-2.5">
      <p class="font-semibold text-lg">{title}</p>
      <div class="flex items-center">
        <p class="font-semibold">{formatCurrency(price * $currencyRateStore, $currencyStore)}</p>
        {#if comparePrice}
          <p class="text-sm font-semibold text-[#C42F30] line-through ml-1">{formatCurrency(comparePrice * $currencyRateStore, $currencyStore)}</p>
        {/if}
      </div>
    </div>
    <div class="flex items-center gap-1.5 ml-auto">
      <button class="bg-[#1D2535] rounded-full p-1" on:click={onUpdate(-1)}>
        <Minus class="size-[12px]" strokeWidth={3.5} />
      </button>
      <p class="text-sm font-medium">{amount}</p>
      <button class="bg-[#1D2535] rounded-full p-1" on:click={onUpdate(1)}>
        <Plus class="size-[12px]" strokeWidth={3.5} />
      </button>
    </div>
  {/key}
</div>