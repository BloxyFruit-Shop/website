<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import Tickets from '$icons/tickets.svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let data;
  const dispatch = createEventDispatcher();

  let loading = false;
  let error = '';
  let gamepassId = '';
  let gamepassInfo = null;
  let validationAttempted = false;

  async function validateGamepass() {
    validationAttempted = true;

    if (!gamepassId || gamepassId.trim() === '') {
      error = 'Please enter a gamepass ID.';
      return;
    }

    // Validate that it's a number
    if (isNaN(gamepassId) || parseInt(gamepassId) <= 0) {
      error = 'Please enter a valid numeric gamepass ID.';
      return;
    }

    loading = true;
    error = '';
    gamepassInfo = null;

    try {
      const res = await fetch('/api/roblox/passes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gamepassId: parseInt(gamepassId) })
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        error = result.error || 'Failed to fetch gamepass information.';
        gamepassInfo = null;
        return;
      }

      // Validate that the gamepass price matches the required amount
      if (result.price !== data.adjustedRobuxAmount) {
        error = `Gamepass price (R$ ${result.price}) does not match the required amount (R$ ${data.adjustedRobuxAmount}). Please check the gamepass ID.`;
        gamepassInfo = null;
        return;
      }

      gamepassInfo = result;
      error = '';
    } catch (e) {
      error = 'Unable to fetch gamepass information. Please try again later.';
      console.error(e);
      gamepassInfo = null;
    } finally {
      loading = false;
    }
  }

  function handleContinue() {
    if (!gamepassInfo) {
      error = 'Please validate a gamepass first.';
      return;
    }
    dispatch('finish', { gamepass: gamepassInfo });
  }

  function handleInputKeydown(e) {
    if (e.key === 'Enter') {
      validateGamepass();
    }
  }
</script>

<div class="flex flex-col gap-6" in:fade={{ duration: 300, delay: 200 }}>
  <div class="flex items-center gap-2">
    <span
      class="text-2xl font-bold text-transparent bg-gradient-to-r from-accent-500 to-accent-400 bg-clip-text"
    >
      Gamepass Selection
    </span>
  </div>

  <div
    class="w-full h-[3px] bg-gradient-to-r from-[#1D2535] via-[#2A3547] to-[#1D2535] rounded-full"
  ></div>

  <div
    class="flex flex-col gap-4"
    in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}
  >
    <div class="flex flex-col gap-2">
      <video
        autoplay
        loop
        src="https://eew5md6xck.ufs.sh/f/rnzfS37zDImS2iGBxXKYgZWcQie1nGtBXDNuCzxSMfaOdJL3"
      ></video>
      <label for="gamepass-id" class="text-sm font-medium text-[#809BB5]">
        Enter Gamepass ID
      </label>
      <Input
        id="gamepass-id"
        type="number"
        placeholder="Paste the ID from the panel"
        bind:value={gamepassId}
        disabled={loading}
        on:keydown={handleInputKeydown}
        class="w-full"
      />
      <p class="text-xs text-[#809BB5]/60">
        You can also find the gamepass ID in the URL when viewing the gamepass on
        Roblox
      </p>
    </div>

    {#if error}
      <div
        class="w-full p-3 text-sm text-red-400 rounded-md bg-red-500/10"
        transition:fade
      >
        {error}
      </div>
    {/if}

    {#if gamepassInfo}
      <div
        class="relative"
        in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}
      >
        <div class="p-4 border rounded-lg border-accent-500/30 bg-accent-500/5">
          <div class="grid items-center grid-cols-[80px_1fr] w-full gap-6">
            <div class="relative group">
              <div
                class="absolute inset-0 transition-all duration-300 rounded-lg bg-accent-500/20 blur-xl group-hover:bg-accent-500/30"
              ></div>
              <div
                class="relative flex items-center justify-center w-20 h-20 transition-all duration-300 rounded-lg ring-2 ring-white/10 group-hover:ring-white/20 bg-accent-500/10"
              >
                <Tickets class="w-10 h-10 text-accent-400" />
              </div>
            </div>
            <div class="w-full space-y-2">
              <h3
                class="text-lg font-semibold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text"
              >
                {gamepassInfo.name}
              </h3>
              <div class="flex flex-col gap-1">
                <p class="text-sm text-[#809BB5] flex items-center gap-2">
                  <span
                    class="inline-block w-1.5 h-1.5 rounded-full bg-accent-400/70"
                  ></span>
                  ID: {gamepassInfo.id}
                </p>
                <p class="text-sm text-[#809BB5]">
                  Price: R$ {gamepassInfo.price}
                </p>
                <p class="text-sm text-[#809BB5]">
                  Creator: {gamepassInfo.creator}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <div
      class="flex gap-2"
      in:fly={{ y: 20, duration: 400, delay: 400, easing: quintOut }}
    >
      <Button
        variant="gradient"
        color="accent"
        disabled={loading || !gamepassId}
        onClick={validateGamepass}
        class="flex-1"
      >
        {loading ? 'Validating...' : 'Validate Gamepass'}
      </Button>
      <Button
        variant="gradient"
        color="accent"
        disabled={!gamepassInfo}
        onClick={handleContinue}
        class="flex-1"
      >
        Continue
      </Button>
    </div>
  </div>
</div>
