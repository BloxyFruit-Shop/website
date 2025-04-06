<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import Tickets from '$icons/tickets.svelte'
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let data;
  const dispatch = createEventDispatcher();

  let loading = false;
  let error = "";
  let gamepasses = [];
  let selectedGamepass = null;

  onMount(async () => {
    if (data?.game?.id) {
      loading = true;
      error = "";
      try {
        const res = await fetch('/api/roblox/passes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ gameId: data.game.id })
        });
        const result = await res.json();
        if (!res.ok || result.error) {
          error = result.error || "Failed to fetch gamepasses.";
          return;
        }
        gamepasses = result;
      } catch (e) {
        error = "Unable to fetch gamepasses. Please try again later.";
        console.error(e);
      } finally {
        loading = false;
      }
    } else {
      error = "Game ID not provided.";
    }
  });

  function selectGamepass(gamepass) {
    selectedGamepass = gamepass;
  }

  function handleContinue() {
    if (!selectedGamepass) {
      error = "Please select a gamepass first.";
      return;
    }
    if (selectedGamepass.price !== data.adjustedRobuxAmount) {
      error = "Selected gamepass price does not match the indicated amount.";
      return;
    }
    dispatch('finish', { gamepass: selectedGamepass });
  }
</script>

<div class="flex flex-col gap-6" in:fade={{ duration: 300, delay: 200 }}>
  <div class="flex items-center gap-2">
    <span class="text-2xl font-bold text-transparent bg-gradient-to-r from-accent-500 to-accent-400 bg-clip-text">
      Gamepass Selection
    </span>
  </div>

  <div class="w-full h-[3px] bg-gradient-to-r from-[#1D2535] via-[#2A3547] to-[#1D2535] rounded-full"></div>

  {#if loading}
    <div class="flex items-center justify-center p-8" in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}>
      <div class="w-8 h-8 border-4 rounded-full border-t-accent-500 border-accent-500/30 animate-spin"></div>
    </div>
  {:else if gamepasses.length > 0}
    <div class="relative" in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}>
      <div class="max-h-[400px] overflow-y-auto pr-2 pb-8 scrollbar-thin scrollbar-track-[#1D2535] scrollbar-thumb-[#3BA4F0]">
        <div class="grid grid-cols-1 gap-2">
          {#each gamepasses as gamepass, i}
            <div in:fly={{ y: 20, duration: 400, delay: 300 + (i * 100), easing: quintOut }}>
              <Button
                variant="bordered"
                color="game"
                class="w-full !p-0 {selectedGamepass?.id === gamepass.id ? '!bg-gradient-to-br !from-sky-600/20 !to-transparent !border-sky-400/50' : ''}"
                onClick={() => selectGamepass(gamepass)}
                insideDivClass="w-full"
              >
                <div class="w-full p-4">
                  <div class="grid items-center grid-cols-[80px_1fr] w-full gap-6">
                    <div class="relative group">
                      <div class="absolute inset-0 transition-all duration-300 rounded-lg bg-accent-500/20 blur-xl group-hover:bg-accent-500/30"></div>
                      <div class="relative flex items-center justify-center w-20 h-20 transition-all duration-300 rounded-lg ring-2 ring-white/10 group-hover:ring-white/20 bg-accent-500/10">
                        <Tickets class="w-10 h-10 text-accent-400" />
                      </div>
                    </div>
                    <div class="w-full space-y-1">
                      <h3 class="text-lg font-semibold text-left text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text">
                        {gamepass.name}
                      </h3>
                      <div class="flex items-center gap-4">
                        <p class="text-sm text-[#809BB5] flex items-center gap-2">
                          <span class="inline-block w-1.5 h-1.5 rounded-full bg-accent-400/70"></span>
                          ID: {gamepass.id}
                        </p>
                        <p class="text-sm text-[#809BB5]">
                          Price: R$ {gamepass.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          {/each}
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-[#131620] to-transparent"></div>
    </div>

    {#if error}
      <div class="w-full p-2 mb-2 text-sm text-center text-red-400 rounded-md bg-red-500/10" transition:fade>
        {error}
      </div>
    {/if}

    <div class="flex justify-end" in:fly={{ y: 20, duration: 400, delay: 500, easing: quintOut }}>
      <Button
        variant="gradient"
        color="accent"
        disabled={!selectedGamepass}
        onClick={handleContinue}
        class="w-full max-w-md"
      >
        Continue
      </Button>
    </div>
  {:else}
    <div class="p-6 text-center text-[#809BB5]" in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}>
      No gamepasses found for this game. Please create a gamepass first.
    </div>
  {/if}
</div>