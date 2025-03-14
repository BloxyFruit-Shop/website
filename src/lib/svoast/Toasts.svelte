<script>
  import Toast from "./Toast.svelte"
  import { toast as toasts, position as toastPos } from "./stores"
  import { fly, fade } from "svelte/transition"
  import { flip } from "svelte/animate"
  import { DEFAULT_ANIMATION, objectMerge } from "./utils"
  export let position = "bottom-left"
  export let animation = void 0
  export let component = void 0
  $toastPos = position
  const ANIMATION = objectMerge(DEFAULT_ANIMATION, animation)
</script>

<div class="svoast-container" data-position={position}>
	{#each $toasts as toast (toast.id)}
		<div
			class="svoast-wrapper"
			data-position={position}
			in:fly={{ duration: 150, x: 320}}
			out:fade={{ duration: 100 }}
			animate:flip={{ duration: ANIMATION.duration }}
		>
			{#if toast?.component?.[0] || component}
				{@const { component: _, ...props } = toast}
				<svelte:component this={toast?.component?.[0] || component} {...props} />
			{:else}
				<Toast {toast} />
			{/if}
		</div>
	{/each}
</div>

<style>
  .svoast-container {
    position: fixed;
    padding: var(--svoast-offset, 16px);
    padding-right: calc(var(--scrollbar-width, 0px) + var(--svoast-offset, 16px));
    top: 0;
    height: 100%;
    width: 100%;
    z-index: 999;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    gap: var(--svoast-gap, 16px);
    overflow: hidden;
  }
  .svoast-container[data-position*=center] {
    align-items: center;
  }
  .svoast-container[data-position*=bottom] {
    justify-content: flex-end;
  }
  .svoast-container[data-position*=center] {
    left: 50%;
    transform: translateX(-50%);
  }
  .svoast-container[data-position*=-left] {
    left: 0;
    align-items: flex-start;
  }
  .svoast-container[data-position*=-right] {
    right: 0;
    align-items: flex-end;
  }
  .svoast-wrapper[data-position=bottom-center] {
    transform-origin: bottom center;
  }
  .svoast-wrapper[data-position=bottom-left] {
    transform-origin: bottom left;
  }
  .svoast-wrapper[data-position=bottom-right] {
    transform-origin: bottom right;
  }
  .svoast-wrapper[data-position=top-center] {
    transform-origin: top center;
  }
  .svoast-wrapper[data-position=top-left] {
    transform-origin: top left;
  }
  .svoast-wrapper[data-position=top-right] {
    transform-origin: top right;
  }
</style>