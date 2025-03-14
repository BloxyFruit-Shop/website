<script lang="ts">
  import { Motion, useMotionValue, useMotionTemplate, useSpring } from "svelte-motion";
  import { onMount } from "svelte";
  import cn from "$lib/utils/cn";
  
  export let gradientSize: number = 200;
  export let gradientColor: string = "#262626";
  export let gradientOpacity: number = 0.8;
  export let growDuration: number = 0.3; // Duration of the growth animation in seconds
  
  let className: string = "";
  export { className as class };
  
  let gradSize = useSpring(0, { duration: growDuration * 1000 });
  let gradColor = useMotionValue(gradientColor);
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);
  
  function handleMouseMove(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }
  
  function handleMouseEnter() {
    gradSize.set(gradientSize);
  }
  
  function handleMouseLeave() {
    gradSize.set(0);
    mouseX.set(-1000);
    mouseY.set(-1000);
  }
  
  onMount(() => {
    gradSize.set(0);
    mouseX.set(-1000);
    mouseY.set(-1000);
  });
  
  let bg = useMotionTemplate`radial-gradient(${gradSize}px circle at ${mouseX}px ${mouseY}px, ${gradColor}, transparent 75%)`;
</script>

<div
  on:mousemove={handleMouseMove}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  class={cn("group", className)}
  role="tooltip"
>
  <div class="relative z-10">
    <slot />
  </div>
  <Motion
    style={{ background: bg, opacity: gradientOpacity }}
    let:motion
  >
    <div
      use:motion
      class="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300"
    />
  </Motion>
</div>