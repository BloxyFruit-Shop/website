<script>
  import { Account, History, Pencil, Copy, EmptyCircleInfo, Robux } from "$lib/icons";
  import { format } from "date-fns";
  import { bgBlur } from "$lib/utils";
  import { toast } from "$lib/svoast"
  import Button from "$lib/components/Button.svelte";
  import OrderDetails from "$lib/modals/general/order-details.svelte";
  import RobloxAccount from "$lib/modals/general/roblox-account.svelte";

  export let data;

  let selectedOrder = null;
  let orderDetailsOpen = false;
  let robloxAccountModalOpen = false;

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

  async function copyReferralCode() {
    if (!data.localUser.referralCode) return;
    
    try {
      await navigator.clipboard.writeText(data.localUser.referralCode);
      toast.success("Referral code copied to clipboard!", { duration: 2000 });
    } catch (err) {
      toast.error("Failed to copy referral code", { duration: 2000 });
    }
  }
</script>

<div class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/landing-background.webp)] bg-no-repeat bg-cover bg-center z-[-1]"></div>
<div class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/background-glow.webp)] opacity-[0.05] bg-no-repeat bg-cover bg-center z-[-1]"></div>

<div class="px-6 min-h-[calc(100dvh-178px-104px)]">
  <!-- <div class="absolute top-[900px] left-[-250px] size-[220px] bg-[#3BA4F0]/50 blur-[200px]"></div> -->

  <div class="max-w-[1440px] w-full mx-auto mt-[104px] flex flex-col lg:flex-row gap-6">
    <div class="w-full p-6 rounded-lg lg:w-4/12 h-fit" style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}">
      <div class="flex items-center gap-2">
        <Account class="w-9 h-9" />
        <p class="text-2xl font-bold">Your Details</p>
      </div>

      <div class="w-full h-[3px] bg-[#1D2535] my-5 rounded-full"></div>

      <div class="flex flex-col gap-3 mb-5">
        <div class="flex items-center gap-2 text-lg font-medium">
          <p class="text-[#809BB5]">Username:</p>
          <p class="text-white">{data.localUser.username}</p>
        </div>
        <div class="flex items-center gap-2 text-lg font-medium">
          <p class="text-[#809BB5]">Email:</p>
          <p class="text-white">{data.localUser.email}</p>
        </div>
        <div class="flex items-center gap-2 text-lg font-medium">
          <p class="text-[#809BB5]">Password:</p>
          <p class="text-white">********</p>
        </div>
        <div class="grid">
          <div class="flex items-center gap-2 text-lg font-medium">
            <p class="text-[#809BB5]">Referral:</p>
            <div class="flex items-center gap-1">
              <p class="text-white">{data.localUser.referralCode ?? "You may need to log back in to see this."}</p>
              {#if data.localUser.referralCode}
              <Button
              variant="bordered"
              color="user"
              onClick={copyReferralCode}
              title="Copy referral code"
              >
              <Copy class="text-white size-3" />
            </Button>
            {/if}
          </div>
          </div>
          <div class="grid grid-cols-[auto_1fr] gap-1 text-[#809BB5]">
            <EmptyCircleInfo class="size-3 mt-0.5" />
            <p class="text-sm">Recieve robux everytime anyone buys using your code!</p>
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
        disabled={data.robuxAmount === 0}
        class="w-full"
      >
        Claim Robux
      </Button>
    </div>

    <div class="w-full p-6 rounded-lg lg:w-8/12" style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <History class="w-8 h-8" />
          <p class="text-2xl font-bold">Order History</p>
        </div>
      </div>

      <div class="w-full h-[3px] bg-[#1D2535] my-5 rounded-full" />

      <div class="overflow-x-auto">
        <table class="w-full border-separate border-spacing-y-2 min-w-[830px]">
          <thead>
            <tr class="text-left">
              <th class="text-[#809BB5] font-medium pb-3">Order ID</th>
              <th class="text-[#809BB5] font-medium pb-3">Date</th>
              <th class="text-[#809BB5] font-medium pb-3">Items</th>
              <th class="text-[#809BB5] font-medium pb-3">Total</th>
              <th class="text-[#809BB5] font-medium pb-3">Status</th>
              <th class="text-[#809BB5] font-medium pb-3">Reciever</th>
              <th class="text-[#809BB5] font-medium pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {#each data.orders as order}
              <tr class="bg-[#1D2535]/30 hover:bg-[#1D2535]/50 transition-colors">
                <td class="py-4 pl-4 rounded-l-lg">
                  #{order.id}
                </td>
                <td>
                  {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="flex -space-x-2">
                      {#each order.items.slice(0, 3) as item}
                        <div class="size-8 rounded-full bg-[#131620] ring-2 ring-[#1D2535] relative">
                          <img src={item.image} alt={item.title} class="object-contain p-1 size-full" />
                        </div>
                      {/each}
                    </div>
                    {#if order.items.length > 3}
                      <span class="text-sm text-[#809BB5]">+{order.items.length - 3}</span>
                    {/if}
                  </div>
                </td>
                <td class="font-medium">
                  ${order.totalAmount}
                </td>
                <td>
                  <span class="px-[11px] py-[5px] rounded-full capitalize text-sm font-medium {statusColors[order.status]}">
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
                      onClick={() => openRobloxAccountModal(order)}
                    >
                      {#if order.reciever && order.reciever.displayName}
                        <div class="flex items-center gap-2 pr-2">
                          <img
                            src={order.reciever.thumbnail}
                            alt={order.reciever.displayName}
                            class="object-cover w-8 h-8 rounded-full"
                          />
                          <span class="text-sm font-medium max-w-[110px] truncate">{order.reciever.displayName}</span>
                        </div>
                      {:else}
                        {#if order.status === "pending"}
                          <span class="flex gap-2"> <Pencil class="size-4" /> Add reciever</span>
                        {:else}
                          No data
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
    </div>
  </div>
</div>

<OrderDetails 
  bind:open={orderDetailsOpen}
  bind:order={selectedOrder}
/>

<RobloxAccount bind:open={robloxAccountModalOpen} bind:order={selectedOrder} />
