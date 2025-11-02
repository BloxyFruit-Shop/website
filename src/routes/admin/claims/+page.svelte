<script>
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import Button from '$lib/components/Button.svelte';
  import { Search } from '$lib/icons';
  import { bgBlur } from '$lib/utils';
  import { enhance } from '$app/forms';
  import { toast } from '$lib/svoast';
  import { flyAndScale } from '$lib/utils';
  import { Robux, ArrowDown, Check } from '$lib/icons';
  import { Select } from 'bits-ui';
  import { fade, fly, scale, slide } from 'svelte/transition';
  import { format } from 'date-fns';

  export let data;

  // Reactive destructuring of loaded data
  $: ({ claims, pagination, searchTerm: initialSearchTerm } = data);
  $: ({ currentPage, totalPages, totalClaims, limit } = pagination || {
    currentPage: 1,
    totalPages: 1,
    totalClaims: 0,
    limit: 12
  });

  let searchTerm = initialSearchTerm || '';
  let sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Highest Amount', value: 'amount_desc' },
    { label: 'Lowest Amount', value: 'amount_asc' }
  ];

  let currentSort = 'newest';

  let sortBy = {
    value: 'newest',
    label: 'Newest First'
  };

  $: {
    const searchParams = new URLSearchParams($page.url.search);
    searchParams.set('sort', sortBy.value);
    if (sortBy.value !== currentSort) {
      currentSort = sortBy.value;
      goto(`/admin/claims?${searchParams.toString()}`, {
        keepFocus: false,
        noScroll: true,
        replaceState: true
      });
    }
  }

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

  const statusColors = {
    resolved: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400'
  };
</script>

<div
  class="max-w-[1440px] h-full w-full mx-auto"
  in:slide={{ y: 20, duration: 300 }}
>
  <div
    class="flex flex-col w-full h-full p-6 rounded-lg"
    style={bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}
    in:fly={{ y: 20, duration: 300 }}
  >
    <div
      class="flex flex-wrap items-center justify-between gap-2"
      in:slide={{ duration: 300 }}
    >
      <div class="flex items-center gap-3">
        <div
          class="p-3 bg-blue-500/20 rounded-xl"
        >
          <Robux class="text-blue-400 size-8" />
        </div>
        <div>
          <h1
            class="text-2xl font-bold text-blue-400"
          >
            Claims Management
          </h1>
          <p class="text-sm text-[#809BB5]">
            Manage and fulfill user Robux claims
          </p>
        </div>
      </div>
      {#if totalClaims > 0}
        <p
          class="text-sm text-[#809BB5]"
          in:fade={{ duration: 200, delay: 300 }}
        >
          Showing {(currentPage - 1) * limit + 1}-{Math.min(
            (currentPage - 1) * limit + claims.length,
            totalClaims
          )} of {totalClaims} claims
        </p>
      {/if}
    </div>

    <div class="w-full h-[3px] bg-[#1D2535] my-5 rounded-full"></div>

    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex-1 max-w-md">
        <div class="flex flex-wrap items-center gap-2">
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

      <div class="flex items-center gap-2">
        <Select.Root items={sortOptions} bind:selected={sortBy}>
          <Select.Trigger
            class="bg-[#1D2535] rounded-lg flex items-center px-2.5 font-semibold text-sm h-[46px] group"
          >
            <p class="ml-2 font-semibold pointer-events-none">{sortBy.label}</p>
            <ArrowDown
              class="ml-1 transition-transform size-5 group-aria-expanded:rotate-180"
              strokeWidth={2}
            />
          </Select.Trigger>
          <Select.Content
            class="!w-[190px] rounded-lg bg-[#1D2535] px-0.5 py-[3px] shadow-popover outline-none z-50"
            transition={flyAndScale}
            align="end"
            sideOffset={8}
          >
            <div
              class="px-1 py-1 max-h-[calc(min(100dvh-160px,300px))] overflow-y-auto"
            >
              {#each sortOptions as option}
                <Select.Item
                  class="flex h-10 w-full text-sm select-none items-center rounded-button outline-none transition-all duration-75 data-[highlighted]:bg-white/10 rounded-md"
                  value={option.value}
                  label={option.label}
                >
                  <div
                    class="flex items-center justify-between w-full py-1.5 px-2.5"
                  >
                    <p class="font-semibold">{option.label}</p>
                    <Select.ItemIndicator class="ml-auto">
                      <Check class="size-4" strokeWidth={2.5} />
                    </Select.ItemIndicator>
                  </div>
                </Select.Item>
              {/each}
            </div>
          </Select.Content>
        </Select.Root>

        <form
          method="POST"
          action="?/fulfillAllClaims"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                toast.success('All pending claims fulfilled successfully');
                await invalidateAll();
              } else {
                toast.error('Failed to fulfill all claims');
              }
            };
          }}
        >
          <Button
            variant="gradient"
            color="accent"
            type="submit"
            disabled={!claims || claims.every((claim) => claim.resolved)}
          >
            Fulfill All
          </Button>
        </form>

        <form
          method="POST"
          action="?/clearFulfilledClaims"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                toast.success('Fulfilled claims cleared successfully');
                await invalidateAll();
              } else {
                toast.error('Failed to clear fulfilled claims');
              }
            };
          }}
        >
          <Button variant="outlined" color="red" type="submit">
            Clear Fulfilled
          </Button>
        </form>
      </div>
    </div>

    {#if claims && claims.length > 0}
      <div class="flex-grow min-h-0 overflow-x-auto">
        <table class="w-full border-separate border-spacing-y-2 min-w-[1000px]">
          <thead>
            <tr class="text-left">
              <th class="text-[#809BB5] font-medium pb-3 pl-4">User</th>
              <th class="text-[#809BB5] font-medium pb-3">Amount</th>
              <th class="text-[#809BB5] font-medium pb-3">Game</th>
              <th class="text-[#809BB5] font-medium pb-3">Gamepass</th>
              <th class="text-[#809BB5] font-medium pb-3">Price</th>
              <th class="text-[#809BB5] font-medium pb-3">Submitted</th>
              <th class="text-[#809BB5] font-medium pb-3">Status</th>
              <th class="text-[#809BB5] font-medium pb-3 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {#each claims as claim (claim._id)}
              <tr class="bg-[#1D2535]/30 hover:bg-[#1D2535]/50 transition-colors" in:fly={{ y: 10, duration: 300 }}>
                <td class="py-4 pl-4 rounded-l-lg">
                  <div class="flex items-center gap-2">
                    <img
                      src="/assets/bacon-headshot.webp"
                      alt="{claim.user.username}'s avatar"
                      class="size-8 rounded-full object-cover border border-[#3BA4F0]/30"
                    />
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-white truncate">
                        {claim.user.displayName}
                      </p>
                      <p class="text-xs text-[#809BB5] truncate">
                        @{claim.user.username}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="py-4">
                  <div class="flex items-center gap-1.5 w-fit">
                    <Robux class="size-4 text-[#3BA4F0]" />
                    <span class="font-semibold text-[#3BA4F0]">{claim.robuxAmount}</span>
                  </div>
                </td>
                <td class="py-4 text-sm text-white">
                  {claim.game.name}
                </td>
                <td class="py-4 text-sm text-white max-w-[200px] truncate">
                  {claim.gamepass.displayName}
                </td>
                <td class="py-4 text-sm text-white">
                  {claim.gamepass.price} Robux
                </td>
                <td class="py-4 text-sm text-[#809BB5]">
                  {format(new Date(claim.createdAt), 'MMM dd, yyyy HH:mm')}
                </td>
                <td class="py-4">
                  <span class="px-3 py-1 rounded-full text-xs font-medium {statusColors[claim.resolved ? 'resolved' : 'pending']}">
                    {claim.resolved ? 'Fulfilled' : 'Pending'}
                  </span>
                </td>
                <td class="py-4 pr-4 rounded-r-lg">
                  <div class="flex items-center justify-end gap-2">
                    <a
                      href={`https://www.roblox.com/game-pass/${claim.gamepass.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="contained" color="gray" size="small">
                        View
                      </Button>
                    </a>

                    {#if claim.resolved}
                      <Button variant="contained" color="gray" size="small" disabled>
                        Done
                      </Button>
                    {:else}
                      <form
                        method="POST"
                        action="?/fulfillClaim"
                        class="inline-block"
                        use:enhance={() => {
                          return async ({ result, update }) => {
                            if (result.type === 'success' && result.data?.success) {
                              toast.success(
                                `Claim fulfilled successfully for ${claim.user.username}.`,
                                { duration: 2500 }
                              );
                              await invalidateAll();
                            } else if (result.type === 'failure') {
                              toast.error(
                                result.data?.message || 'Failed to fulfill claim.',
                                { duration: 3000 }
                              );
                            } else if (result.type === 'error') {
                              toast.error(
                                `An unexpected error occurred: ${result.error.message}`,
                                { duration: 3000 }
                              );
                            }
                          };
                        }}
                      >
                        <input type="hidden" name="claimId" value={claim._id} />
                        <Button
                          variant="gradient"
                          color="accent"
                          size="small"
                          type="submit"
                        >
                          Fulfill
                        </Button>
                      </form>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if totalPages > 1}
        <div class="flex items-center justify-center gap-4 mt-6 shrink-0">
          <Button
            variant="contained"
            color="gray"
            size="small"
            disabled={currentPage <= 1}
            onClick={goToPreviousPage}
          >
            Previous
          </Button>
          <span class="text-sm text-[#809BB5]">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="contained"
            color="gray"
            size="small"
            disabled={currentPage >= totalPages}
            onClick={goToNextPage}
          >
            Next
          </Button>
        </div>
      {/if}
    {:else}
      <div
        class="flex items-center justify-center flex-grow"
        in:scale={{ duration: 300, delay: 400, start: 0.9 }}
      >
        <p
          class="text-center text-[#809BB5]"
          in:fade={{ duration: 200, delay: 500 }}
        >
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
