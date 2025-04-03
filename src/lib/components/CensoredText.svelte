<script>
  import { onDestroy } from 'svelte';
  export let text;
  export let censor;
  export let delay = 200; // Delay in milliseconds before censoring again

  let censoredText = "";
  let isHovered = false;
  let timeoutId = null;

  $: {
    // Recalculate censored text if the input text changes
    censoredText = "*".repeat(text?.length || 0);
  }

  function handleMouseOver() {
    // Clear any existing timeout to prevent censoring if mouse re-enters quickly
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    isHovered = true;
  }

  function handleMouseOut() {
    // Start a timer to censor the text after the specified delay
    timeoutId = setTimeout(() => {
      isHovered = false;
      timeoutId = null;
    }, delay);
  }

  // Ensure timeout is cleared if the component is destroyed while waiting
  onDestroy(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

</script>

<span
  on:mouseover={handleMouseOver}
  on:mouseout={handleMouseOut}
  title={censor ? "Hover to reveal" : ""}
>
  {isHovered || !censor ? text : censoredText}
</span>