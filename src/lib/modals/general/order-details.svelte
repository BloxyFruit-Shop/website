<script>
  import { Dialog } from 'bits-ui';
  import { Close, Discord, User, Password } from '$lib/icons';
  import servers from '$lib/utils/servers';
  import Button from '$lib/components/Button.svelte';

  export let open = false;
  export let order;
  $: url = servers[order?.game ?? 'blox-fruits'];

  $: automaticItems =
    order?.items.filter((item) => item.deliveryType === 'account') || [];
  $: manualItems =
    order?.items.filter((item) => item.deliveryType === 'manual') || [];
  $: isRobuxPurchase =
    order?.robuxPurchase?.robuxPurchaseId !== null &&
    order?.robuxPurchase?.robuxPurchaseId !== undefined;
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
    />
    <Dialog.Content
      class="
      fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#131620] rounded-lg shadow-xl p-6 z-[110]
      duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
    "
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold">Order #{order.id}</h2>
        <Dialog.Close class="text-[#809BB5] hover:text-white">
          <Close class="size-5" />
        </Dialog.Close>
      </div>

      <div class="flex flex-col gap-4">
        {#if isRobuxPurchase}
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-medium text-[#809BB5]">Robux Purchase</h3>
              <div class="flex-1 h-[3px] bg-[#1D2535] rounded-full"></div>
            </div>
            <div class="p-4 bg-[#1A1F2E] rounded-lg">
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-[#809BB5]">Robux Amount:</span>
                  <span class="font-semibold"
                    >{order.robuxPurchase.robuxAmount} R$</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[#809BB5]">EUR Amount:</span>
                  <span class="font-semibold"
                    >€{order.robuxPurchase.eurAmount?.toFixed(2) ||
                      '0.00'}</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[#809BB5]">Gamepass:</span>
                  <a
                    href={`https://www.roblox.com/game-pass/${order.robuxPurchase.gamepass.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="contained" color="gray" size="small">
                      View
                    </Button>
                  </a>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[#809BB5]">Gamepass Price:</span>
                  <span class="font-semibold"
                    >{order.robuxPurchase.gamepass?.price || 'N/A'} R$</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[#809BB5]">Fulfilled:</span>
                  <span class="font-semibold"
                    >{order.robuxPurchase.fulfillmentDate
                      ? new Date(
                          order.robuxPurchase.fulfillmentDate
                        ).toLocaleDateString()
                      : 'Waiting delivery'}</span
                  >
                </div>
              </div>
              <div
                class="mt-4 p-3 bg-[#131620] rounded-lg border-l-4 border-[#809BB5]"
              >
                <p class="text-sm text-[#809BB5]">
                  Once bought, Roblox takes up to a week to insert funds from
                  gamepasses. Please be patient.
                </p>
              </div>
            </div>
          </div>
        {/if}

        {#if automaticItems.length > 0}
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-medium text-[#809BB5]">
                Automatic Delivery
              </h3>
              <div class="flex-1 h-[3px] bg-[#1D2535] rounded-full"></div>
            </div>
            {#each automaticItems as item}
              <div class="p-3 bg-[#1A1F2E] rounded-lg">
                <div class="flex items-center gap-4">
                  <div class="size-16 rounded-lg bg-[#131620]/70 relative p-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      class="object-contain size-full"
                    />
                  </div>
                  <div class="flex flex-col justify-center flex-1 gap-1">
                    <p class="text-xs text-[#809BB5] font-medium leading-none">
                      {item.category}
                    </p>
                    <div class="flex items-center gap-1">
                      <h3 class="text-lg font-medium leading-none">
                        {item.title}
                      </h3>
                      <p class="font-medium text-[#809BB5]">
                        x {item.quantity}
                      </p>
                    </div>
                    <p class="font-extrabold leading-none text-white">
                      ${item.price}
                    </p>
                  </div>
                </div>

                {#if item.inventoryItems?.length > 0}
                  <div
                    class="mt-4 p-3 bg-[#1D2535] rounded-lg flex flex-col gap-2"
                  >
                    {#each item.inventoryItems as account}
                      <div class="flex">
                        <div
                          class="bg-[#131620] flex items-center gap-2 py-2 px-3 rounded-l-lg flex-1"
                        >
                          <User class="size-5" />
                          <p class="text-sm font-medium">
                            {account.data.username}
                          </p>
                        </div>
                        <div
                          class="bg-[#131620] flex items-center gap-2 py-2 px-3 border-l-[3px] border-[#1D2535] rounded-r-lg flex-1"
                        >
                          <Password class="size-5" />
                          <p class="text-sm font-medium">
                            {account.data.password}
                          </p>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}

        {#if manualItems.length > 0}
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-medium text-[#809BB5]">
                Manual Delivery
              </h3>
              <div class="flex-1 h-[3px] bg-[#1D2535] rounded-full"></div>
            </div>
            {#each manualItems as item}
              <div class="p-3 bg-[#1A1F2E] rounded-lg">
                <div class="flex gap-4">
                  <div class="size-16 rounded-lg bg-[#131620]/70 relative p-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      class="object-contain size-full"
                    />
                  </div>
                  <div class="flex flex-col justify-center flex-1 gap-1">
                    <p class="text-xs text-[#809BB5] font-medium leading-none">
                      {item.category}
                    </p>
                    <div class="flex items-center gap-1">
                      <h3 class="text-lg font-medium leading-none">
                        {item.title}
                      </h3>
                      <p class="font-medium text-[#809BB5]">
                        x {item.quantity}
                      </p>
                    </div>
                    <p class="font-extrabold leading-none text-white">
                      ${item.price}
                    </p>
                  </div>
                </div>
              </div>
            {/each}

            <Button
              variant="gradient"
              color="accent"
              to={url}
              target="_blank"
              class="inline-flex items-center justify-center w-full"
            >
              <Discord class="mr-2 size-5" />
              Join Discord
            </Button>
          </div>
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
