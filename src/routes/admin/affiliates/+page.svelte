<script>
  import { goto, invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  import Button from '$lib/components/Button.svelte';
  import { Robux, Search, Check, Close, Pencil, Users } from '$lib/icons';
  import { bgBlur } from '$lib/utils';
  import { enhance } from '$app/forms';
  import { toast } from '$lib/svoast';
  import { fade, fly, scale, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';

  export let data;

  // Reactive destructuring of data
  $: ({ affiliates, pagination, searchTerm: initialSearchTerm } = data);
  $: ({ currentPage, totalPages } = pagination || {
    currentPage: 1,
    totalPages: 1
  });

  let searchTerm = initialSearchTerm || '';
  let editingUserId = null;
  let editRobuxValue = 0;

  // Rest of your existing functions remain the same
  function startEditing(user) {
    editingUserId = user._id;
    editRobuxValue = user.robux;
    setTimeout(() => {
      const inputElement = document.getElementById(`robux-input-${user._id}`);
      inputElement?.focus();
      inputElement?.select();
    }, 0);
  }

  function cancelEditing() {
    editingUserId = null;
  }

  function handleSearch() {
    editingUserId = null;
    const searchParams = new URLSearchParams($page.url.search);
    if (searchTerm.trim()) {
      searchParams.set('search', searchTerm.trim());
    } else {
      searchParams.delete('search');
    }
    searchParams.set('page', '1');
    goto(`/admin/affiliates?${searchParams.toString()}`, {
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
    editingUserId = null;
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) {
      return;
    }
    const searchParams = new URLSearchParams($page.url.search);
    searchParams.set('page', newPage.toString());
    goto(`/admin/affiliates?${searchParams.toString()}`, {
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

<div
  class="max-w-[1440px] h-full w-full mx-auto"
  in:slide={{ y: 20, duration: 300 }}
>
  <div
    class="w-full h-full p-6 rounded-lg"
    style={bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}
    in:fly={{ y: 20, duration: 300 }}
  >
    <div class="flex flex-wrap items-center justify-between gap-2" in:slide={{ duration: 300 }}>
      <div class="flex items-center gap-3">
        <div
          class="p-3 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl"
        >
          <Users class="text-indigo-400 size-8" />
        </div>
        <div>
          <h1
            class="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text"
          >
            Affiliates Management
          </h1>
          <p class="text-sm text-[#809BB5]">
            Manage and track your affiliate partners
          </p>
        </div>
      </div>
      {#if pagination && pagination.totalUsers > 0}
        <p
          class="text-sm text-[#809BB5]"
          in:fade={{ duration: 200, delay: 300 }}
        >
          Showing {(currentPage - 1) * pagination.limit + 1}-{Math.min(
            (currentPage - 1) * pagination.limit + affiliates.length,
            pagination.totalUsers
          )} of {pagination.totalUsers} affiliates
        </p>
      {/if}
    </div>

    <div class="w-full h-[3px] bg-[#1D2535] my-5 rounded-full"></div>

    <div class="max-w-md mb-6">
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

    {#if affiliates && affiliates.length > 0}
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {#each affiliates as user, i (user._id)}
          <div
            class="rounded-lg flex flex-col items-center p-4 text-center bg-[#1D2535]/30 hover:bg-[#1D2535]/50 transition-colors"
            in:fly|local={{
              y: 20,
              x: 20,
              duration: 400,
              delay: 100 + i * 100,
              easing: quintOut
            }}
            animate:flip={{ duration: 300 }}
            out:fade|local={{ duration: 200 }}
          >
            <img
              src="/assets/bacon-headshot.webp"
              alt="{user.username}'s avatar"
              class="size-20 rounded-full mb-3 object-cover border-2 border-[#3BA4F0]/50"
            />
            <p
              class="w-full mb-1 text-lg font-semibold text-white truncate"
              title={user.username}
            >
              {user.username}
            </p>

            {#if editingUserId === user._id}
              <form
                method="POST"
                action="?/updateRobux"
                use:enhance={() => {
                  return async ({ result, update }) => {
                    if (result.type === 'success' && result.data?.success) {
                      const userIndex = affiliates.findIndex(
                        (u) => u._id === result.data.userId
                      );
                      if (userIndex > -1) {
                        affiliates[userIndex].robux = result.data.updatedAmount;
                        affiliates = affiliates;
                      }
                      await invalidate('app:admin/affiliates');
                      toast.success(
                        `Robux updated successfully for ${user.username}.`,
                        { duration: 2500 }
                      );
                      cancelEditing();
                    } else if (result.type === 'failure') {
                      toast.error(
                        result.data?.message || 'Failed to update Robux.',
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
                class="flex flex-col items-center w-full gap-2 mt-1"
                in:scale={{ duration: 200 }}
              >
                <input type="hidden" name="userId" value={user._id} />
                <input
                  type="number"
                  name="newRobuxAmount"
                  bind:value={editRobuxValue}
                  required
                  min="0"
                  step="1"
                  id="robux-input-{user._id}"
                  class="w-3/4 px-2 py-1 bg-[#1D2535]/70 border border-[#3BA4F0]/50 rounded-md text-white text-center focus:outline-none focus:ring-1 focus:ring-[#3BA4F0] transition"
                  aria-label="Edit Robux amount for {user.username}"
                />
                <div class="flex gap-2 mt-1">
                  <button
                    type="submit"
                    class="p-1 text-green-400 rounded hover:bg-white/10"
                  >
                    <Check class="size-5" />
                  </button>
                  <button
                    on:click={cancelEditing}
                    class="p-1 text-red-400 rounded hover:bg-white/10"
                  >
                    <Close class="size-5" />
                  </button>
                </div>
              </form>
            {:else}
              <button
                type="button"
                on:click={() => startEditing(user)}
                class="text-sm text-[#809BB5] hover:text-white flex items-center justify-center gap-1 mt-1 p-1 rounded transition-colors group focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-offset-[#111A28] focus:ring-[#3BA4F0]"
                title="Click to edit Robux"
                aria-label="Current Robux for {user.username}: {user?.robux.toLocaleString() ??
                  0}. Click to edit."
              >
                <Robux class="size-4" />
                {user.robux}
                <Pencil
                  class="ml-1 transition-opacity opacity-0 size-3 group-hover:opacity-100 group-focus:opacity-100"
                />
              </button>
            {/if}
          </div>
        {/each}
      </div>

      {#if totalPages > 1}
        <div class="flex items-center justify-center gap-4 mt-8">
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
        class="flex items-center justify-center h-64"
        in:scale={{ duration: 300, delay: 400, start: 0.9 }}
      >
        <p
          class="text-center text-[#809BB5]"
          in:fade={{ duration: 200, delay: 500 }}
        >
          {#if initialSearchTerm}
            No users found matching "{initialSearchTerm}".
          {:else}
            There are no users to display.
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>
