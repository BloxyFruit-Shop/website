
<script>
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import Button from '$lib/components/Button.svelte';
  import { Search } from '$lib/icons';
  import { bgBlur } from '$lib/utils';
  import { enhance } from '$app/forms';
  import { toast } from '$lib/svoast';
  import { Robux } from '$lib/icons';

  export let data;

  // Reactive destructuring of loaded data
  $: ({ claims, pagination, searchTerm: initialSearchTerm } = data);
  $: ({ currentPage, totalPages, totalClaims, limit } = pagination || { currentPage: 1, totalPages: 1, totalClaims: 0, limit: 12 });

  let searchTerm = initialSearchTerm || '';

  function handleSearch() {
    const searchParams = new URLSearchParams($page.url.search);
    if (searchTerm.trim()) {
      searchParams.set('search', searchTerm.trim());
    } else {
      searchParams.delete('search');
    }
    searchParams.set('page', '1');
    goto(`/admin/claims?${searchParams.toString()}`, {
      keepFocus: false,
      noScroll: false,
      replaceState: true
    });
  }

  function handleSearchInputKeydown(event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  function goToPage(newPage) {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) {
      return;
    }
    const searchParams = new URLSearchParams($page.url.search);
    searchParams.set('page', newPage.toString());
    goto(`/admin/claims?${searchParams.toString()}`, {
      keepFocus: true,
      noScroll: true,
      replaceState: true
    });
  }

  function goToPreviousPage() {
    goToPage(currentPage - 1);
  }

  function goToNextPage() {
    goToPage(currentPage + 1);
  }
</script>

<div class="max-w-[1440px] h-full w-full mx-auto">
  <div class="w-full h-full p-6 rounded-lg" style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold">Robux Claims Management</h1>
      </div>
      {#if totalClaims > 0}
        <p class="text-sm text-[#809BB5]">
          Showing {(currentPage - 1) * limit + 1}-{Math.min((currentPage - 1) * limit + claims.length, totalClaims)} of {totalClaims} claims
        </p>
      {/if}
    </div>

    <div class="w-full h-[3px] bg-[#1D2535] my-5 rounded-full"></div>

    <div class="max-w-md mb-6">
      <div class="flex items-center gap-2">
        <input
          type="search"
          bind:value={searchTerm}
          on:keydown={handleSearchInputKeydown}
          placeholder="Search by username..."
          class="flex-grow px-3 py-2 bg-[#1D2535]/50 border border-transparent focus:border-[#3BA4F0] rounded-md text-white placeholder-[#809BB5] focus:outline-none focus:ring-1 focus:ring-[#3BA4F0] transition"
        />
        <Button variant="gradient" color="accent" onClick={handleSearch}>
          <Search class="mr-1 size-5" /> Search
        </Button>
      </div>
    </div>

    {#if claims && claims.length > 0}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {#each claims as claim (claim._id)}
        <div class="bg-gradient-to-br from-[#1D2535]/80 to-[#1D2535]/30 rounded-lg overflow-hidden backdrop-blur-sm border border-[#3BA4F0]/10 transition-all duration-200 hover:border-[#3BA4F0]/30">
          <!-- Header Section -->
          <div class="p-4 border-b border-[#3BA4F0]/10">
            <div class="flex items-start gap-4">
              <img
                src="/assets/bacon-headshot.webp"
                alt="{claim.user.username}'s avatar"
                class="size-16 rounded-full object-cover border-2 border-[#3BA4F0]/50 shadow-lg shadow-[#3BA4F0]/10"
              />
              <div class="flex-1">
                <p class="text-lg font-bold text-white truncate">{claim.user.displayName} <span class="text-[#809BB5]">@{claim.user.username}</span></p>
                <div class="flex items-center gap-1.5 mt-1 bg-[#3BA4F0]/10 rounded-full px-3 py-1 w-fit">
                  <Robux class="size-4 text-[#3BA4F0]" />
                  <span class="font-semibold text-[#3BA4F0]">{claim.robuxAmount}</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Content Section -->
          <div class="p-4 space-y-2">
            <div class="space-y-1">
              <p class="text-sm">
                <span class="text-[#809BB5]">Game:</span>
                <span class="ml-1 font-medium text-white">{claim.game.name}</span>
              </p>
              <p class="text-sm">
                <span class="text-[#809BB5]">Gamepass:</span>
                <span class="ml-1 font-medium text-white">{claim.gamepass.displayName}</span>
              </p>
              <p class="text-sm">
                <span class="text-[#809BB5]">Price:</span>
                <span class="ml-1 font-medium text-white">{claim.gamepass.price} Robux</span>
              </p>
              <p class="text-xs text-[#809BB5] mt-2">
                Submitted: {new Date(claim.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
  
          <!-- Actions Section -->
          <div class="flex items-center justify-end gap-2 p-4 pt-0">
            <a
              href={`https://www.roblox.com/game-pass/${claim.gamepass.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="contained" color="gray" size="small">
                View Gamepass
              </Button>
            </a>
            
            {#if claim.resolved}
              <Button variant="contained" color="gray" size="small" disabled>
                Fulfilled
              </Button>
            {:else}
              <form method="POST" action="?/fulfillClaim" class="inline-block" use:enhance={() => {
                return async ({ result, update }) => {
                  if (result.type === 'success' && result.data?.success) {
                    toast.success(`Claim fulfilled successfully for ${claim.user.username}.`, { duration: 2500 });
                    await invalidateAll();
                  } else if (result.type === 'failure') {
                    toast.error(result.data?.message || 'Failed to fulfill claim.', { duration: 3000 });
                  } else if (result.type === 'error') {
                    toast.error(`An unexpected error occurred: ${result.error.message}`, { duration: 3000 });
                  }
                };
              }}>
                <input type="hidden" name="claimId" value={claim._id} />
                <Button variant="gradient" color="accent" size="small" type="submit">
                  Fulfill
                </Button>
              </form>
            {/if}
          </div>
        </div>
      {/each}
    </div>

      {#if totalPages > 1}
        <div class="flex items-center justify-center gap-4 mt-8">
          <Button variant="contained" color="gray" size="small" disabled={currentPage <= 1} on:click={goToPreviousPage}>
            Previous
          </Button>
          <span class="text-sm text-[#809BB5]">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="contained" color="gray" size="small" disabled={currentPage >= totalPages} on:click={goToNextPage}>
            Next
          </Button>
        </div>
      {/if}
    {:else}
      <div class="flex items-center justify-center h-64">
        <p class="text-center text-[#809BB5]">
          {#if initialSearchTerm}
            No claims found matching "{initialSearchTerm}".
          {:else}
            There are no claims to display.
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>
