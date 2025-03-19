<script>
  import { Dialog } from "bits-ui"
  import { onMount } from "svelte"
  import Button from "$lib/components/Button.svelte"
  import Input from "$lib/components/Input.svelte"
  import { Close } from "$lib/icons"

  export let open = false

  // Local state
  let username = ""
  let loading = false
  let error = ""
  let userResult = null

  async function searchRobloxUser() {
    error = ""
    userResult = null
    if (!username) {
      error = "Please enter a username."
      return
    }
    loading = true
    try {
      // Use the new server endpoint to search for the Roblox user
      const res = await fetch("/api/roblox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        error = data.error || "An error occurred."
        return
      }

      userResult = data
    } catch (err) {
      error = "An error occurred while searching. Please try again later."
      console.error(err)
    } finally {
      loading = false
    }
  }

  // Called when confirm button is pressed
  function confirmAccount() {
    open = false;
    // TODO: Add the roblox account info to the order
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]" />
    <Dialog.Content class="
      fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-xl w-full bg-[#131620] rounded-lg shadow-xl p-6 z-[110]
      duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out
    ">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold">Search Roblox Account</h2>
        <Dialog.Close class="text-[#809BB5] hover:text-white">
          <Close class="size-5" />
        </Dialog.Close>
      </div>

      {#if !userResult}
        <div class="flex flex-col gap-4">
          <Input label="Roblox Username" bind:value={username} placeholder="Enter username" />
          {#if error}
            <p class="text-sm text-red-500">{error}</p>
          {/if}
          <div class="flex justify-end">
            <Button variant="gradient" color="accent" onClick={searchRobloxUser} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      {:else}
        <div class="flex flex-col gap-4">
          <div class="p-6 transition-all duration-300 border bg-gradient-to-br from-slate-800/20 to-transparent rounded-xl backdrop-blur-sm border-white/10 hover:border-white/20">
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
              If this is your account, click confirm. Otherwise, you can go back and search again.
            </p>
          </div>
          <div class="flex justify-between">
            <Button color="gray" onClick={() => {userResult = null}}>
              Back
            </Button>
            <Button variant="gradient" color="accent" onClick={() => confirmAccount()}>
              Confirm
            </Button>
          </div>
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
