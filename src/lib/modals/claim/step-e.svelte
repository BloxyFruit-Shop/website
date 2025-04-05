<script>
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import Button from '$lib/components/Button.svelte';
  import { Robux, Tickets } from '$lib/icons';
  import { createEventDispatcher } from 'svelte';

  export let data;
  const dispatch = createEventDispatcher();
  let error = null;
  let loading = false;

  async function handleFinish() {
    if (loading) return; // Prevent multiple clicks while loading

    loading = true;
    error = null; // Reset error on new attempt

    try {
      const response = await fetch('/api/affiliate/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || `HTTP error! Status: ${response.status}`;
        console.error('Claim API Error:', result);
      } else if (result.success) {
        dispatch('finish'); // Dispatch finish only on successful API response
      } else {
        error = result.message || 'An unexpected issue occurred.';
        console.warn('Claim API Warning:', result);
      }
    } catch (e) {
      console.error('Failed to fetch claim API:', e);
      error = 'Failed to connect to the server. Please try again later.';
      if (e instanceof SyntaxError) {
        error = 'Received an invalid response from the server.';
      }
    } finally {
      loading = false; // Ensure loading is set to false after the attempt
    }
  }
</script>

<div class="flex flex-col h-full" in:fade={{ duration: 300, delay: 200 }}>
  <div class="flex flex-col flex-shrink-0 gap-4">
    <div class="flex items-center gap-2">
      <span class="text-2xl font-bold text-transparent bg-gradient-to-r from-accent-500 to-accent-400 bg-clip-text">
        Confirm Claim
      </span>
    </div>

    <div class="w-full h-[3px] bg-gradient-to-r from-[#1D2535] via-[#2A3547] to-[#1D2535] rounded-full"></div>
  </div>

  <div class="flex-1 overflow-y-auto"> 
    <div class="grid gap-2 py-4" in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}>
      <div 
        class="relative px-6 pb-4"
        in:fly={{ y: 20, duration: 400, delay: 400, easing: quintOut }}
      >
        <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent"></div> 
        
        <h3 class="mb-3 text-sm font-medium text-[#809BB5]">Account</h3>
        <div class="flex items-center gap-4">
          <div class="relative group">
            <div class="absolute inset-0 transition-all duration-300 rounded-lg bg-accent-500/20 blur-xl group-hover:bg-accent-500/30"></div>
            <img 
              src={data.user.thumbnail} 
              alt={data.user.displayName}
              class="relative rounded-lg size-14 ring-2 ring-white/10 group-hover:ring-white/20"
            />
          </div>
          <div>
            <p class="text-lg font-semibold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text">
              {data.user.displayName}
            </p>
            <p class="text-sm text-[#809BB5]">@{data.user.username}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div 
          class="relative px-6 py-4"
          in:fly={{ y: 20, duration: 400, delay: 500, easing: quintOut }}
        >
          <h3 class="mb-3 text-sm font-medium text-[#809BB5]">Game</h3>
          <div class="space-y-3">
            <div class="relative group aspect-video max-h-24">
              <div class="absolute inset-0 transition-all duration-300 rounded-lg bg-accent-500/20 blur-xl group-hover:bg-accent-500/30 "></div>
              <img 
                src={data.game.thumbnail} 
                alt={data.game.name}
                class="relative object-cover w-full rounded-lg aspect-video ring-2 ring-white/10 group-hover:ring-white/20"
              />
            </div>
            <div>
              <p class="text-base font-semibold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text">
                {data.game.name}
              </p>
              <p class="text-xs text-[#809BB5] flex items-center gap-2">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-accent-400/70"></span>
                ID: {data.game.id}
              </p>
            </div>
          </div>
        </div>

        <div 
          class="relative px-6 py-4"
          in:fly={{ y: 20, duration: 400, delay: 600, easing: quintOut }}
        >
          <h3 class="mb-3 text-sm font-medium text-[#809BB5]">Gamepass</h3>
          <div class="space-y-3">
            <div class="relative group aspect-video max-h-24">
              <div class="absolute inset-0 transition-all duration-300 rounded-lg bg-accent-500/20 blur-xl group-hover:bg-accent-500/30"></div>
              <div class="relative flex items-center justify-center w-full rounded-lg aspect-video bg-accent-500/10 ring-2 ring-white/10 group-hover:ring-white/20">
                <Tickets class="w-12 h-12 text-accent-400" />
              </div>
            </div>
            <div>
              <p class="text-base font-semibold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text">
                {data.gamepass.displayName}
              </p>
              <p class="text-xs text-[#809BB5] flex items-center gap-2">
                <Robux class="w-3.5 h-3.5" />
                {data.adjustedRobuxAmount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div 
        class="relative px-6 pt-4"
        in:fly={{ y: 20, duration: 400, delay: 700, easing: quintOut }}
      >
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent"></div>

        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-[#809BB5]">Amount to Claim</h3>
          <div class="flex items-center gap-2">
            <Robux class="w-6 h-6 text-accent-400" />
            <span class="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text">
              {data.robuxAmount}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="flex flex-col items-end flex-shrink-0 pt-2 pb-2 border-t border-white/5">
    {#if error}
      <div class="w-full p-2 mb-2 text-sm text-center text-red-400 rounded-md bg-red-500/10" transition:fade>
        {error}
      </div>
    {/if}

    <Button
      variant="gradient"
      color="accent"
      onClick={handleFinish}
      class="w-full max-w-md"
      disabled={loading}
    >
      {#if loading}
        Processing... 
      {:else}
        Confirm Claim
      {/if}
    </Button>
  </div>
</div>
