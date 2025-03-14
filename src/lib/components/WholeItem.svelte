<script>
  import { Tag, CirlceIlustration, ShoppingCart } from "$icons"
  import { lazyLoad, formatCurrency, alpha } from "$lib/utils"
  import { currencyStore, currencyRateStore } from "$lib/utils/stores"
  import colorVariations from "$lib/utils/colors"
  import games from "$lib/utils/games"
  import { draw, fade } from "svelte/transition"

  export let image
  export let category
  export let title
  export let price
  export let comparePrice
  export let rarity
  export let onClick
  export let game
  export let disabled
  export let id
  export let to
  export let inStock

  $: color = games?.[game]?.rarities?.find(r => r.name === rarity)?.color || "gray"

  let showAnimation = false
  const handleClick = () => {
    if (disabled) return

    const shouldAnimate = onClick?.()
    showAnimation = shouldAnimate
    setTimeout(() => showAnimation = false, 1100)
  }
</script>

<svelte:element
  this={to ? "a" : "button"}
  href={to}
  class="rounded-xl overflow-hidden relative flex group flex-col items-center cursor-pointer transition-transform {$$props.class} {disabled || inStock == false ? 'opacity-35 pointer-events-none' : ''} min-h-[250px] sm:min-h-[286px]"
  on:click={handleClick}
  id={id}
>
  {#key title}
    <div 
      class="absolute size-full pointer-events-none select-none"
      style="background: {colorVariations[color].gradient}"
    ></div>
    <CirlceIlustration class="absolute bottom-[-308px] right-[-308px] rotate-90 size-[524px]" color={colorVariations[color].solid} />

    <div class="px-2 py-1 bg-[#24AB26] text-white flex items-center rounded-lg absolute top-2.5 right-2.5" style="background: {colorVariations[color].solid}">
      <Tag class="size-4 mr-1" />
      <p class="text-sm font-semibold">{rarity}</p>
    </div>

    <!-- Add to cart & animation -->
    <div 
      class="absolute bottom-4 right-4 size-8 flex items-center justify-center rounded-lg overflow-hidden"
      style="background: {alpha(colorVariations[color].solid, 0.55)}"
    >
      {#if showAnimation}
        <div class="relative size-full flex items-center justify-center">
          <div 
            class="absolute animate-drop-item size-[3px] bg-white rounded-full z-0 [--top:calc(50%-4px)]"
            style="left: calc(50% - 2px);"
          />
          <div 
            class="absolute animate-drop-item size-[3px] bg-white rounded-full z-0 [--top:calc(50%-4px)]"
            style="left: calc(50% + 2px);"
          />
          <div 
            class="absolute animate-cart-slide z-10"
          >
            <ShoppingCart class="size-[18px]" />
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="size-[18px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 24 24">
            <path in:draw={{ duration: 200, delay: 600 }} fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" d="m5 14l4 4L19 8" />
          </svg>
        </div>
      {:else}
        <div in:fade={{ duration: 200 }}>
          <ShoppingCart class="size-[18px]" />
        </div>
      {/if}
    </div>

    <div class="size-[100px] sm:size-[136px] relative mt-11 pointer-events-none select-none group-hover:scale-[1.115] transition-transform duration-200">
      <img use:lazyLoad={{ src: image, opacity: 0.2 }} alt="Item thumbnail" class="size-full object-contain object-center absolute top-0 left-0 blur-xl z-0 opacity-0 group-hover:!opacity-70 group-hover:scale-105 transition-[opacity,transform] duration-200" />
      <img use:lazyLoad={image} alt="Item thumbnail" class="size-full object-contain object-center z-10 relative opacity-0 transition-opacity" />
    </div>
    
    <div class="px-4 w-full flex flex-col justify-start items-start gap-1 pb-4 mt-auto z-10">
      <p class="text-[11px] sm:text-xs text-[#809BB5] font-semibold !leading-none">{category}</p>
      <p class="text-base sm:text-lg font-semibold !leading-none my-1 line-clamp-1 text-left break-all">{title}</p>
      <div class="flex max-sm:flex-col sm:items-center gap-1 !leading-none">
        <p class="text-[15px] sm:text-[17px] text-left font-extrabold text-white">{formatCurrency(price * $currencyRateStore, $currencyStore)}</p>
        {#if comparePrice}
          <p class="text-xs sm:text-sm font-semibold text-[#C42F30] text-left line-through">{formatCurrency(comparePrice * $currencyRateStore, $currencyStore)}</p>
        {/if}
      </div>
    </div>
  {/key}
</svelte:element>

<style>
  @keyframes drop-item {
    0% {
      top: -8px;
      opacity: 0;
      transform: translateX(0);
    }
    40% {
      top: var(--top);
      opacity: 1;
      transform: translateX(0);
    }
    50% {
      top: var(--top);
      opacity: 0;
      transform: translateX(0);
    }
    55% {
      top: var(--top);
      opacity: 0;
      transform: translateX(0);
    }
    100% {
      top: var(--top);
      opacity: 0;
      transform: translateX(32px);
    }
  }

  @keyframes cart-slide {
    0% {
      transform: translateX(0) rotate(0deg);
    }
    55% {
      transform: translateX(0) rotate(0deg);
    }
    100% {
      transform: translateX(32px) rotate(-15deg);
    }
  }

  .animate-drop-item {
    animation: drop-item 800ms cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  }

  .animate-cart-slide {
    animation: cart-slide 800ms ease-in-out forwards;
  }
</style>