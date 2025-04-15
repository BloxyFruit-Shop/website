<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import { Robux, Tickets } from '$lib/icons';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { toast } from "$lib/svoast"

  export let data;

  const dispatch = createEventDispatcher();
  
  let hasClickedCreate = false;
  let hasClickedTutorial = false;

  function handleCreate() {
    hasClickedCreate = true;
    window.open(`https://create.roblox.com/dashboard/creations/experiences/${data.game.id}/monetization/passes`, '_blank');
  }
  
  function handleTutorial() {
    hasClickedTutorial = true;
    toast.error("We're still working on a tutorial for this.", { duration: 2000 })
  }

  function handleContinue() {
    if (hasClickedCreate) {
      dispatch('finish');
    }
  }

  async function copyAmount() {
    if (!data.adjustedRobuxAmount) return;
    
    try {
      await navigator.clipboard.writeText(data.adjustedRobuxAmount);
      toast.success("Robux amount copied to clipboard!", { duration: 2000 });
    } catch (err) {
      toast.error("Failed to copy robux amount", { duration: 2000 });
    }
  }
  
</script>

<div class="flex flex-col gap-6" in:fade={{ duration: 300, delay: 200 }}>
  <div class="flex items-center gap-2">
    <span class="text-2xl font-bold text-transparent bg-gradient-to-r from-accent-500 to-accent-400 bg-clip-text">
      Create Gamepass
    </span>
  </div>

  <div class="w-full h-[3px] bg-gradient-to-r from-[#1D2535] via-[#2A3547] to-[#1D2535] rounded-full"></div>

  <div class="flex flex-col items-center gap-6 pt-4">
    <div class="relative" in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}>
      <div class="absolute inset-0 transform scale-125 rounded-full bg-accent-500/20 blur-xl"></div>
      <div class="relative bg-gradient-to-b from-[#2A3547] to-[#1D2535] p-6 rounded-full border border-accent-500/20">
        <Tickets class="size-20 text-accent-400" />
      </div>
    </div>

    <div class="flex flex-col items-center gap-2 text-center" in:fly={{ y: 20, duration: 400, delay: 400, easing: quintOut }}>
      <p class="text-xl text-[#809BB5] gap-2 font-medium flex flex-col items-center">
        Create and sell a gamepass for
        <Button variant="outlined" color="accent" onClick={copyAmount}>
          <Robux class="mr-1.5 size-5" />
          <span class="font-bold">{data.adjustedRobuxAmount}</span>
        </Button>
      </p>
      <p class="text-sm text-[#809BB5]/80">
        Click on continue once you're done
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <div class="grid w-full grid-cols-3 gap-3 mt-2 place-items-center" in:fly={{ y: 20, duration: 400, delay: 500, easing: quintOut }}>
        <Button
          variant="gradient"
          color="accent"
          onClick={handleCreate}
          class="flex-1"
        >
          Create
        </Button>
        
        <Button
          variant="contained"
          color="gray"
          onClick={handleTutorial}
          class="flex-1"
        >
          Tutorial
        </Button>
        
        <Button
          variant="gradient"
          color="accent"
          onClick={handleContinue}
          disabled={!hasClickedCreate}
          class="flex-1 disabled:opacity-50 disabled:hover:scale-100"
        >
          Continue
        </Button>
      </div>
      <p class={"text-sm text-[#809BB5]/80 " + (hasClickedTutorial ? "opacity-0 pointer-events-none" : "")}>
        Check the tutorial if you need help creating the gamepass
      </p>
    </div>
  </div>
</div>
