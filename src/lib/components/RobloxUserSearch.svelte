<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  const dispatch = createEventDispatcher();

  // Optional initial value can be passed from the parent if needed
  export let initialUsername = "";
  
  let username = initialUsername;
  let loading = false;
  let error = "";
  let userResult = null;

  // Search for the Roblox user using our server endpoint
  async function searchRobloxUser() {
    error = "";
    userResult = null;
    if (!username) {
      error = "Please enter a username.";
      return;
    }
    loading = true;
    try {
      const res = await fetch("/api/roblox/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        error = data.error || "An error occurred. Try again later.";
        return;
      }
      userResult = data;
    } catch (err) {
      error = "An error occurred while searching. Please try again later.";
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function clearResult() {
    userResult = null;
    error = "";
  }

  // Once the user has confirmed, dispatch event to the parent
  function confirm() {
    if (!userResult) {
      error = "No Roblox user selected.";
      return;
    }
    dispatch('userSelected', { user: userResult });
  }
</script>

{#if !userResult}
  <div class="flex flex-col gap-6" in:fade={{ duration: 300 }}>
    <div in:fly={{ y: 20, duration: 100, easing: quintOut }}>
      <Input label="Roblox Username" bind:value={username} placeholder="Enter username" />
    </div>
    {#if error}
      <p class="text-sm text-red-500" in:fly={{ y: 20, duration: 100, easing: quintOut }}>{error}</p>
    {/if}
    <div class="flex justify-end" in:fly={{ y: 20, duration: 100, delay: 150, easing: quintOut }}>
      <Button variant="gradient" color="accent" onClick={searchRobloxUser} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </Button>
    </div>
  </div>
{:else}
  <div class="flex flex-col gap-4" in:fade={{ duration: 300 }}>
    <div 
      class="p-6 transition-all duration-300 border bg-gradient-to-br from-slate-800/20 to-transparent rounded-xl backdrop-blur-sm border-white/10 hover:border-white/20"
      in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}
    >
      <div class="flex items-center gap-6">
        <div class="relative group">
          <div class="absolute inset-0 transition-all duration-300 rounded-full bg-blue-500/20 blur-xl group-hover:bg-blue-500/30"></div>
          <img 
            src={userResult.thumbnail} 
            alt={userResult.displayName} 
            class="relative object-cover w-20 h-20 transition-all duration-300 rounded-full ring-2 ring-white/10 group-hover:ring-white/20"
          />
        </div>
        <div class="space-y-1">
          <h3 class="text-2xl font-semibold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text">
            {userResult.displayName}
          </h3>
          <p class="text-sm text-[#809BB5] flex items-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-400/70"></span>
            @{userResult.username}
          </p>
        </div>
      </div>
      <p class="pt-4 mt-4 text-sm border-t text-slate-400/90 border-white/5">
        If this is your account, click confirm. Otherwise, press back to search again.
      </p>
    </div>
    {#if error}
      <p class="text-sm text-red-500" in:fly={{ y: 20, duration: 400, easing: quintOut }}>{error}</p>
    {/if}
    <div class="flex justify-between" in:fly={{ y: 20, duration: 400, delay: 200, easing: quintOut }}>
      <Button color="gray" onClick={clearResult}>
        Back
      </Button>
      <Button variant="gradient" color="accent" onClick={confirm} disabled={loading}>
        {loading ? "Updating..." : "Confirm"}
      </Button>
    </div>
  </div>
{/if}
