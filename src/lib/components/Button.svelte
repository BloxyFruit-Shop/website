<script>
  import { ripple } from "svelte-ripple-action"
  import cn from "$lib/utils/cn"

  const colorVariantions = {
    contained: {
      gray: {
        normal: "px-6 bg-[#1D2535] text-[#809BB5] rounded-lg",
        disabled: "px-6 opacity-40 bg-[#1D2535] text-[#809BB5] rounded-lg"
      }
    },
    outlined: {

    },
    text: {
      white: {
        normal: "text-[#809BB5]",
        disabled: "opacity-40 text-[#809BB5]"
      },
      zinc: {
        normal: "px-6 text-[#809BB5]",
        disabled: "px-6 opacity-40 text-[#809BB5]"
      }
    },
    bordered: {
      sky: {
        normal: "px-6 bg-sky-600 border border-2 border-sky-400 text-sky-100 rounded-xl",
        disabled: "px-6 opacity-40 bg-sky-600 border border-2 border-sky-400 text-sky-100 rounded-xl"
      },
      paper: {
        normal: "px-6 bg-paper border-2 border-edge text-aquan-400 rounded-xl",
        disabled: "px-6 opacity-40 bg-paper border-2 border-edge text-aquan-400 rounded-xl"
      },
      accent: {
        normal: "px-6 bg-accent-500 border-2 border-accent-400 text-sky-100 rounded-xl",
        disabled: "px-6 opacity-40 bg-accent-500 border-2 border-accent-400 text-sky-100 rounded-xl"
      },
      game: {
        normal: "p-2.5 border-2 border-[#1B1F36] rounded-xl",
        disabled: "p-2.5 opacity-40 border-2 border-[#1B1F36] rounded-xl"
      }
    },
    gradient: {
      accent: {
        normal: "px-6 bg-gradient-to-r from-[#3BA4F0] to-[#1B92E9] hover:from-[#1B92E9] hover:to-[#3BA4F0] transition-colors",
        disabled: "px-6 opacity-40 bg-gradient-to-r from-[#3BA4F0] to-[#1B92E9]"
      }
    }
  }

  const sizes = {
    xsmall: {
      normal: "py-0.5 px-1.5",
      icon: "p-1.5"
    },
    small: {
      normal: "py-1 px-2",
      icon: "p-2"
    },
    medium: {
      normal: "py-2.5 px-4",
      icon: "p-3"
    },
    large: {
      normal: "py-3.5 px-6 font-[15px] font-bold",
      icon: "p-4"
    }
  }
  
  let type = 'button',
      color = "gray",
      icon = false,
      download,
      variant = 'contained',
      size = 'medium',
      loading = false,
      disabled = false,
      to,
      onClick,
      target,
      id

  export let builders = []
  const builder = builders?.[0], conditionalUse = builder ? builder.action : () => {}
  export let mouseEnter
  export let mouseLeave

  export { color, icon, type, download, variant, size, loading, disabled, to, onClick, target, id }
</script>

{#if to}
  <div
    use:conditionalUse
    {...builder}
    class={$$props.wrapperClass}
  >
    <a
      style={$$props.style}
      type={type}
      class={cn(
        `text-sm text-white font-semibold outline-none transition-all duration-200 flex items-center justify-center`,
        icon ? "rounded-full" : "rounded-lg",
        variant == "contained" ? "shadow-lg hover:shadow-none border-none": variant == "outlined" ? "border" : "",
        sizes[size][icon ? 'icon' : 'normal'],
        disabled && "cursor-default pointer-events-none",
        disabled ? colorVariantions[variant][color].disabled : colorVariantions[variant][color].normal,
        $$props.class
      )}
      href={to}
      {target}
      {id}
      {download}
      on:click={onClick}
      use:ripple={{ duration: 0.4 }}
    >
      {#if loading}
        <svg class="animate-spin h-5 w-5 absolute" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="4"/>
          <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      {/if}
      <div class={cn(`${loading ? "invisible" : ""} flex items-center justify-center z-10`, $$props.insideDivClass)}>
        <slot />
      </div>
    </a>
  </div>
{:else}
  <div
    use:conditionalUse
    {...builder}
    class={$$props.wrapperClass}
  >
    <button
      type={type}
      style={$$props.style}
      {id}
      class={cn(
        `text-sm text-white font-semibold outline-none transition-all duration-200 flex items-center justify-center`,
        icon ? "rounded-full" : "rounded-lg",
        variant == "contained" ? "shadow-lg hover:shadow-none border-none": variant == "outlined" ? "border" : "",
        sizes[size][icon ? 'icon' : 'normal'],
        disabled && "cursor-default pointer-events-none",
        disabled ? colorVariantions[variant][color].disabled : colorVariantions[variant][color].normal,
        $$props.class
      )}
      use:ripple={{ duration: 0.4 }}
      on:click={onClick}
      on:mouseenter={mouseEnter}
      on:mouseleave={mouseLeave}
    >
      {#if loading}
        <svg class="animate-spin h-5 w-5 absolute" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="4"/>
          <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      {/if}
      <div class={cn(`${loading ? "invisible" : ""} flex items-center justify-center z-10`, $$props.insideDivClass)}>
        <slot />
      </div>
    </button>
  </div>
{/if}