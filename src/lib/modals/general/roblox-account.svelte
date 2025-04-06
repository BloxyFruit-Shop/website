<script>
  import { Dialog } from "bits-ui"
  import { Close } from "$lib/icons"
  import { toast } from "$lib/svoast"
  import { invalidateAll } from '$app/navigation';
  import RobloxUserSearch from "$lib/components/RobloxUserSearch.svelte"

  export let open = false
  export let order = {}

  let loading = false
  let error = ""

  // Ran when the user selects a Roblox user from the search results
  async function updateReciever(event) {
    const userResult = event.detail.user;
    loading = true;
    error = "";
    try {
      // POST the updated reciever info to endpoint
      const res = await fetch('/api/orders/reciever', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId : order?.id,
          reciever: {
            username: userResult.username,
            displayName: userResult.displayName,
            id: userResult.userId,
            thumbnail: userResult.thumbnail
          }
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        error = data.error || "Failed to update order with Roblox account.";
        return;
      }
      open = false;
      invalidateAll()
      toast["success"]("Reciever updated successfully.", {duration: 3000})
    } catch (err) {
      error = "Failed to update order due to a network error.";
      console.error(err);
    } finally {
      loading = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]" />
    <Dialog.Content class="
      fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-xl w-full bg-[#131620] rounded-lg shadow-xl p-6 z-[110]
      duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
    ">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold">Search Roblox Account</h2>
        <Dialog.Close class="text-[#809BB5] hover:text-white">
          <Close class="size-5" />
        </Dialog.Close>
      </div>

      <RobloxUserSearch on:userSelected={updateReciever} />
      
      {#if error}
        <p class="mt-4 text-sm text-red-500">{error}</p>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
