<script>
  import { Account, History, Pencil, Copy, EmptyCircleInfo, Robux, Eye, EyeOff, Crown, Discord, Link, ArrowDown } from "$lib/icons";
  import { format } from "date-fns";
  import { bgBlur } from "$lib/utils";
  import { toast } from "$lib/svoast"
  import CensoredText from '$lib/components/CensoredText.svelte';
  import ClipboardCopy from '$lib/components/ClipboardCopy.svelte';
  import Button from "$lib/components/Button.svelte";
  import OrderDetails from "$lib/modals/general/order-details.svelte";
  import RobloxAccount from "$lib/modals/general/roblox-account.svelte";
  import ClaimModal from "$lib/modals/claim/claim-modal-container.svelte";
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';
  import { fly, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { Collapsible } from "bits-ui";
  import { quintOut } from 'svelte/easing';

  export let data;

  let selectedOrder = null;
  let orderDetailsOpen = false;
  let robloxAccountModalOpen = false;
  let claimModalOpen = false;
  let censored = true;

  $: ({ currentPage, totalPages } = data.pagination || { currentPage: 1, totalPages: 1 }); // Add default fallback

  const statusColors = {
    pending: "bg-[#dd8231]",
    completed: "bg-[#2fc462]",
    cancelled: "bg-[#C42F30]"
  };

  function openOrderDetails(order) {
    if (!order?.reciever?.username && order.status === "pending") {
      toast["error"]("You need to add a reciever before claiming your order.", {duration: 3_000})
      return
    }
    selectedOrder = order;
    orderDetailsOpen = true;
  }

  function openRobloxAccountModal(order) {
    if (order.status !== "pending") return;
    selectedOrder = order;
    robloxAccountModalOpen = true;
  }

  function claimSuccess(event) {
    const message = `You have successfully claimed ${event.detail.amount} Robux!`;
    invalidateAll();
    toast.success(message, {duration: 4000})
  }

  function goToPage(newPage) {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) {
      return; // Don't navigate if page is invalid or the same
    }

    const searchParams = new URLSearchParams($page.url.search);
    searchParams.set('page', newPage.toString());
    goto(`?${searchParams.toString()}`, { keepFocus: true, noScroll: true, replaceState: true });
  }

  function goToPreviousPage() {
    goToPage(currentPage - 1);
  }

  function goToNextPage() {
    goToPage(currentPage + 1);
  }

  console.log(data.claims)
</script>

<div class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/landing-background.webp)] bg-no-repeat bg-cover bg-center z-[-1]"></div>
<div class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/background-glow.webp)] opacity-[0.05] bg-no-repeat bg-cover bg-center z-[-1]"></div>

<div class="px-6 min-h-[calc(100dvh-178px-104px)] pb-10">
  <!-- <div class="absolute top-[900px] left-[-250px] size-[220px] bg-[#3BA4F0]/50 blur-[200px]"></div> -->

  <div class="max-w-[1440px] w-full mx-auto mt-[104px] flex flex-col lg:flex-row gap-6">
    <div class="flex flex-col w-full gap-6 lg:w-4/12 h-fit">
      <div class="w-full p-6 rounded-lg" style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}">
        <div class="flex items-center justify-between gap-2">
          <p class="flex items-center gap-2">
            <Account class="w-9 h-9" />
            <span class="text-2xl font-bold">Your Details</span>
          </p>
          
          <Button
            variant="bordered"
            color="user"
            class="p-2"
            onClick={() => {censored = !censored}}
          >
            {#if censored}
            <EyeOff class="size-4" />
            {:else}
            <Eye class="size-4" />
            {/if}
          </Button>
        </div>
  
        <div class="w-full h-[3px] bg-[#1D2535] my-5 rounded-full"></div>
  
        <div class="flex flex-col gap-3 mb-5">
          <div class="flex items-center gap-2 text-lg font-medium">
            <p class="text-[#809BB5]">Username:</p>
            <CensoredText text={data.localUser.username} censor={censored} />
          </div>
          <div class="flex items-center gap-2 text-lg font-medium">
            <p class="text-[#809BB5]">Email:</p>
            <CensoredText text={data.localUser.email} censor={censored} />
          </div>
          <div class="flex items-center gap-2 text-lg font-medium">
            <p class="text-[#809BB5]">Password:</p>
            <p class="text-white">********</p>
          </div>
        </div>
      </div>
      
      <div class="w-full p-6 pb-2 rounded-lg" style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}">
        <div class="flex items-center justify-between gap-2">
          <p class="flex items-center gap-2">
            <Crown class="pb-1.5 px-1 size-9" />
            <span class="text-2xl font-bold">Affiliate panel</span>
          </p>
        </div>
  
        <div class="w-full h-[3px] bg-[#1D2535] my-5 rounded-full"></div>
  
        <div class="flex flex-col gap-3 mb-4">
          <div class="grid">
            <div class="flex items-center gap-2 text-lg font-medium">
              <p class="text-[#809BB5]">Link:</p>
              <div class="flex items-center gap-1">
                {#if data.referral}
                  <ClipboardCopy class="underline" copy={`https://bloxyfruit.com/?ref=${data.referral}`} successMessage="Referral link copied to clipboard">bloxyfruit.com/?ref={data.referral} <Link class="size-3"/></ClipboardCopy>
                {:else}
                   <p class="text-sm text-gray-400">Not available. Try logging in again.</p>
                {/if}
              </div>
            </div>
            <div class="flex items-center gap-2 text-lg font-medium">
              <p class="text-[#809BB5]">Code:</p>
              <div class="flex items-center gap-1">
                {#if data.referral}
                  <ClipboardCopy class="underline" copy={data.referral} successMessage="Referral code copied to clipboard">{data.referral}<Link class="size-3"/></ClipboardCopy>
                {:else}
                   <p class="text-sm text-gray-400">Not available. Try logging in again.</p>
                {/if}
              </div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-1 text-[#809BB5] mt-2">
              <EmptyCircleInfo class="size-3 mt-0.5" />
              <p class="text-sm">Share your link, recieve robux everytime anyone buys using your code!</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-lg font-medium">
            <p class="text-[#809BB5]">Collected Robux:</p>
            <p class="flex items-center gap-1 text-white"><Robux class="size-4" />{data.robuxAmount}</p>
          </div>
        </div>

        <Button
          variant="gradient"
          color="accent"
          disabled={data.robuxAmount < 50}
          class="w-full"
          onClick={() => {
            if (data.robuxAmount < 50) {
                 toast.info("You need at least 50 Robux to claim.", { duration: 3000 });
                 return;
            }
            claimModalOpen = true;
          }}
        >
          Claim Robux {data.robuxAmount < 50 ? '(Need 50+)' : ''}
        </Button>
        <a href="https://discord.gg/efzkFH5mxc" target="_blank" class="flex items-center justify-center w-fit mx-auto my-2 gap-2 p-2 text-[#809BB5] hover:text-white transition-colors rounded-lg">
          <Discord class="size-8"/>
          <span>Join our affiliates Discord Server</span>
        </a>
      </div>

      <div class="w-full p-6 rounded-lg" style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}">
        <Collapsible.Root>
          <Collapsible.Trigger class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1D2535]/30 transition-colors">
            <div class="flex items-center gap-2">
              <p class="text-[#809BB5]">View Claims</p>
              {#if data.claims?.length}
                <span class="text-sm text-[#809BB5]">({data.claims.length})</span>
              {/if}
            </div>
            <ArrowDown class="size-4 text-[#809BB5] transition-transform duration-200 collapsible-icon" />
          </Collapsible.Trigger>
          
          <Collapsible.Content class="pt-2">
            <div class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar" transition:slide={{ duration: 300 }}>
              {#if data.claims?.length}
                <div class="space-y-2">
                  {#each data.claims as claim, i (claim._id)}
                    <div 
                      class="p-3 rounded-lg bg-gradient-to-br from-[#1D2535]/80 to-[#1D2535]/30 backdrop-blur-sm border border-[#3BA4F0]/10 transition-all duration-200 hover:border-[#3BA4F0]/30"
                      in:fly|local={{ 
                        y: 20,
                        x: 20,
                        duration: 400, 
                        delay: 100 + (i * 100),
                        easing: quintOut 
                      }}
                      animate:flip={{ duration: 300 }}
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <Robux class="size-4 text-[#3BA4F0]" />
                          <span class="font-medium">{claim.robuxAmount}</span>
                        </div>
                        <span class={`text-sm px-2 py-1 rounded-full ${claim.resolved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {claim.resolved ? 'Resolved' : 'Pending'}
                        </span>
                      </div>
                      <div class="mt-2 text-sm text-[#809BB5] space-y-1">
                        <p>Username: {claim.user.username}</p>
                        <p>Requested: {format(new Date(claim.createdAt), "MMM dd, yyyy HH:mm")}</p>
                        {#if claim.resolved && claim.resolvedAt}
                          <p>Bought: {format(new Date(claim.resolvedAt), "MMM dd, yyyy HH:mm")}</p>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-sm text-[#809BB5] px-2">No claims history yet.</p>
              {/if}
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </div>

    <div class="flex flex-col w-full p-6 rounded-lg lg:w-8/12 flex-shrink-0 h-fit" style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}">
      <div class="shrink-0">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <History class="w-8 h-8" />
            <p class="text-2xl font-bold">Order History</p>
          </div>
          {#if data.pagination && data.pagination.totalOrders > 0}
            <p class="text-sm text-[#809BB5]">
              Showing {(currentPage - 1) * data.pagination.limit + 1}-{(currentPage - 1) * data.pagination.limit + data.orders.length} of {data.pagination.totalOrders} orders
            </p>
          {/if}
        </div>

        <div class="w-full h-[3px] bg-[#1D2535] my-5 rounded-full" />
      </div>

      <div class="flex flex-col flex-grow min-h-0">
        {#if data.orders && data.orders.length > 0}
          <div class="flex-grow overflow-x-auto">
            <table class="w-full border-separate border-spacing-y-2 min-w-[830px]">
            <thead>
              <tr class="text-left">
                <th class="text-[#809BB5] font-medium pb-3 pl-4">Order ID</th> 
                <th class="text-[#809BB5] font-medium pb-3">Date</th>
                <th class="text-[#809BB5] font-medium pb-3">Items</th>
                <th class="text-[#809BB5] font-medium pb-3">Total</th>
                <th class="text-[#809BB5] font-medium pb-3">Status</th>
                <th class="text-[#809BB5] font-medium pb-3">Reciever</th>
                <th class="text-[#809BB5] font-medium pb-3 pr-4"></th> 
              </tr>
            </thead>
            <tbody>
              {#each data.orders as order (order._id)} 
                <tr class="bg-[#1D2535]/30 hover:bg-[#1D2535]/50 transition-colors">
                  <td class="py-4 pl-4 rounded-l-lg min-w-[160px]">
                    <CensoredText text={`#${order.id}`} censor={censored} />
                  </td>
                  <td>
                    {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <div class="flex -space-x-2">
                        {#each order.items.slice(0, 3) as item (item._id || Math.random())}
                          <div class="size-8 rounded-full bg-[#131620] ring-2 ring-[#1D2535] relative flex items-center justify-center"> 
                            {#if item.image}
                              <img src={item.image} alt={item.title ?? 'Item'} class="object-contain p-1 size-full" />
                            {:else}
                              <span class="text-xs text-gray-400">?</span> 
                            {/if}
                          </div>
                        {/each}
                      </div>
                      {#if order.items.length > 3}
                        <span class="text-sm text-[#809BB5]">+{order.items.length - 3}</span>
                      {/if}
                    </div>
                  </td>
                  <td class="font-medium">
                    ${order.totalAmount?.toFixed(2) ?? 'N/A'}
                  </td>
                  <td>
                    <span class="px-[11px] py-[5px] rounded-full capitalize text-sm font-medium {statusColors[order.status] ?? 'bg-gray-500'}">
                      {order.status}
                    </span>
                  </td>
                  <td class="pr-4 max-w-[180px]">
                      <Button
                        variant="bordered"
                        color="user"
                        size="small"
                        disabled={order.status !== "pending"}
                        class="mx-auto"
                        title={order.status === 'pending' ? 'Add or Edit Roblox Account' : 'Roblox account cannot be changed'}
                        onClick={() => openRobloxAccountModal(order)}
                      >
                        {#if order.reciever && order.reciever.displayName}
                          <div class="flex items-center gap-2 pr-2">
                            {#if order.reciever.thumbnail}
                              <img
                                src={order.reciever.thumbnail}
                                alt={order.reciever.displayName}
                                class="object-cover w-8 h-8 rounded-full"
                              />
                            {/if}
                            <span class="text-sm font-medium max-w-[110px] truncate">{order.reciever.displayName}</span>
                          </div>
                        {:else}
                          {#if order.status === "pending"}
                            <span class="flex items-center gap-2"> <Pencil class="size-4" /> Add reciever</span>
                          {:else}
                            <span class="text-sm text-gray-400">No data</span>
                          {/if}
                        {/if}
                      </Button>
                  </td>
                  <td class="pr-4 w-[120px] rounded-r-lg">
                    <Button
                      variant="gradient"
                      color="accent"
                      class="w-[120px]"
                      onClick={() => openOrderDetails(order)}
                    >
                      {order.status === 'ready' ? 'Claim' : 'Details'}
                    </Button>
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
          <div class="flex items-center justify-center flex-grow">
            <p class="text-center text-[#809BB5]">You have no order history yet.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<OrderDetails
  bind:open={orderDetailsOpen}
  bind:order={selectedOrder}
/>

<RobloxAccount bind:open={robloxAccountModalOpen} bind:order={selectedOrder} />

<ClaimModal bind:open={claimModalOpen} bind:robuxAmount={data.robuxAmount} on:claim-success={claimSuccess} />

<style>
  :global(.collapsible-icon) {
    transform: rotate(0deg);
    transition: transform 0.3s ease;
  }
  
  :global([data-state="open"] .collapsible-icon) {
    transform: rotate(180deg);
  }
</style>