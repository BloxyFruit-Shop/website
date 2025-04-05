<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let data;
  const dispatch = createEventDispatcher();

  let loading = false;
  let error = "";
  let games = [];
  let selectedGame = null;

  onMount(async () => {
    if (data?.user?.userId) {
      loading = true;
      error = "";
      try {
        const res = await fetch('/api/roblox/games', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: data.user.userId })
        });
        const result = await res.json();
        if (!res.ok || result.error) {
          error = result.error || "Failed to fetch games.";
          return;
        }
        games = result;
      } catch (e) {
        error = "Unable to fetch games. Please try again later.";
        console.error(e);
      } finally {
        loading = false;
      }
    } else {
      error = "User ID not provided.";
    }
  });

  function selectGame(game) {
    selectedGame = game;
  }

  function finishModal() {
    if (!selectedGame) {
      error = "Please select a game first.";
      return;
    }
    dispatch('finish', { game: selectedGame });
  }
</script>

<div class="flex flex-col gap-4" in:fade={{ duration: 300, delay: 200 }}>
  <div class="flex items-center gap-2" in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}>
    <span class="text-2xl font-bold">Select Game</span>
  </div>

  <div 
    class="w-full h-[3px] bg-[#1D2535] rounded-full"
    in:fly={{ y: 20, duration: 400, delay: 400, easing: quintOut }}
  />

  {#if loading}
    <div 
      class="flex items-center justify-center p-8"
      in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}
    >
      <div class="w-8 h-8 border-4 rounded-full border-t-blue-500 border-blue-500/30 animate-spin"></div>
    </div>
  {:else if error}
    <p 
      class="text-sm text-red-500"
      in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}
    >
      {error}
    </p>
  {:else if games.length > 0}
    <div 
      class="relative"
      in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}
    >
      <div class="max-h-[400px] overflow-y-auto pr-2 pb-8 scrollbar-thin scrollbar-track-[#1D2535] scrollbar-thumb-[#3BA4F0]">
        <div class="grid grid-cols-1 gap-2">
          {#each games as game, i}
            <div in:fly={{ y: 20, duration: 400, delay: 300 + (i * 100), easing: quintOut }}>
              <Button
                variant="bordered"
                color="game"
                class="w-full !p-0 {selectedGame?.id === game.id ? '!bg-gradient-to-br !from-sky-600/20 !to-transparent !border-sky-400/50' : ''}"
                onClick={() => selectGame(game)}
                insideDivClass="w-full"
              >
                <div class="w-full p-4">
                  <div class="grid items-center grid-cols-[80px_1fr] w-full gap-6">
                    <div class="relative group">
                      <div class="absolute inset-0 transition-all duration-300 rounded-lg bg-blue-500/20 blur-xl group-hover:bg-blue-500/30"></div>
                      <img 
                        src={game.thumbnail} 
                        alt={game.name} 
                        class="relative object-cover w-20 h-20 transition-all duration-300 rounded-lg aspect-square ring-2 ring-white/10 group-hover:ring-white/20"
                      />
                    </div>
                    <div class="w-full space-y-1">
                      <h3 class="text-lg font-semibold text-left text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text">
                        {game.name}
                      </h3>
                      <p class="text-sm text-[#809BB5] flex items-center gap-2">
                        <span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-400/70"></span>
                        ID: {game.id}
                      </p>
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

    <div 
      class="flex justify-end"
      in:fly={{ y: 20, duration: 400, delay: 500, easing: quintOut }}
    >
      <Button
        variant="gradient"
        color="accent"
        disabled={!selectedGame}
        onClick={finishModal}
      >
        Confirm Selection
      </Button>
    </div>
  {:else}
    <div 
      class="p-6 text-center text-[#809BB5]"
      in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}
    >
      No games found for the provided user. Make sure you have at least one public game.
    </div>
  {/if}
</div>