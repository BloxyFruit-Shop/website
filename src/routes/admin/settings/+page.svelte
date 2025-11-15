<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import { Gear, Robux, Euro, Dollar } from '$lib/icons';
  import { toast } from '$lib/svoast';
  import { bgBlur } from '$lib/utils';
  import { fly, slide } from 'svelte/transition';

  export let data;
  export let form;
  let euroToRobuxRateInput;
  let usdToRobuxRateInput;
  let maxRobuxInput;
  let minRobuxInput;
  let purchaseLimitHoursInput;
  let squareWebhookPaymentsKeyInput;
  let squareWebhookDisputesKeyInput;
  let discordWebhookUrlInput;
  let isSubmitting = false;

  // Initialize the input values once
  $: if (data.settings && euroToRobuxRateInput === undefined) {
    euroToRobuxRateInput = data.settings.euroToRobuxRate;
    usdToRobuxRateInput = data.settings.usdToRobuxRate;
    maxRobuxInput = data.settings.maxRobuxPerPurchase;
    minRobuxInput = data.settings.minRobuxPerPurchase;
    purchaseLimitHoursInput = data.settings.purchaseLimitHours;
    squareWebhookPaymentsKeyInput =
      data.settings.squareWebhookSignatures?.payments || '';
    squareWebhookDisputesKeyInput =
      data.settings.squareWebhookSignatures?.disputes || '';
    discordWebhookUrlInput = data.settings.discordDisputeWebhookUrl || '';
  }

  // Handle potential form errors passed back from the server action
  $: if (form?.success === false && form?.message) {
    toast.error(form.message);
  }

  // Calculate preview values
  $: previewEuro = 10;
  $: previewRobux = previewEuro * euroToRobuxRateInput;
  $: previewUsd = 10;
</script>

<div
  class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/landing-background.webp)] bg-no-repeat bg-cover bg-center z-[-1]"
></div>
<div
  class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/background-glow.webp)] opacity-[0.05] bg-no-repeat bg-cover bg-center z-[-1]"
></div>

<div class="px-6 min-h-[calc(100dvh-178px-104px)] pb-10">
  <div class="max-w-[1440px] w-full mx-auto  flex flex-col gap-6">
    <div
      class="w-full p-6 rounded-lg"
      style={bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}
      in:fly={{ y: 20, duration: 300 }}
    >
      <div
        class="flex items-center justify-between"
        in:slide={{ duration: 300 }}
      >
        <div class="flex items-center gap-3">
          <div class="p-3 bg-blue-500/20 rounded-xl">
            <Gear class="text-blue-400 size-8" />
          </div>
          <div>
            <h1 class="text-2xl font-bold">Global Settings</h1>
            <p class="text-sm text-[#809BB5]">
              Manage the application's configuration
            </p>
          </div>
        </div>
      </div>

      <form
        method="POST"
        action="?/updateSettings"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ result }) => {
            console.log('Form result:', result);
            if (result.type === 'success') {
              console.log('Success result data:', result.data);
              toast.success('Settings updated successfully!');
              await invalidateAll();
            } else if (result.type === 'failure') {
              toast.error(result.data?.message || 'Failed to update settings');
            } else if (result.type === 'error') {
              toast.error(
                `An unexpected error occurred: ${result.error.message}`
              );
            }
            isSubmitting = false;
          };
        }}
        class="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2"
      >
        <!-- Affiliate Currency -->
        <div
          class="space-y-4 p-4 rounded-lg bg-[#1D2535]/30 border border-white/5"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="p-2 rounded-lg bg-blue-500/10">
                <Euro class="text-blue-400 size-5" />
              </div>
              <h2 class="text-lg font-semibold">Affiliate Currency</h2>
            </div>
          </div>

          <Input
            type="number"
            name="euroToRobuxRate"
            bind:value={euroToRobuxRateInput}
            label="Euro to Robux Conversion Rate"
            placeholder="e.g., 10"
            error={form?.errors?.euroToRobuxRate}
            min="0"
            max="1000"
            helperText={form?.errors?.euroToRobuxRate
              ? [form.errors.euroToRobuxRate]
              : undefined}
          >
            <div slot="endIcon" class="flex items-center gap-2 text-[#809BB5]">
              <Robux class="text-white size-4" />
            </div>
          </Input>

          <div class="p-3 border rounded-lg bg-blue-500/10 border-white/5">
            <p class="text-xs text-[#809BB5] mb-2">Preview</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Euro class="text-blue-400 size-5" />
                <span class="text-base font-semibold">{previewEuro} EUR</span>
              </div>
              <span class="text-[#809BB5]">=</span>
              <div class="flex items-center gap-2">
                <Robux class="text-amber-300 size-5" />
                <span class="text-base font-semibold">{previewRobux} R$</span>
              </div>
            </div>
            <div class="text-xs text-[#809BB5] mt-2">
              1 EUR = {euroToRobuxRateInput} R$
            </div>
          </div>
        </div>

        <!-- Square Payment -->
        <div
          class="space-y-4 p-4 rounded-lg bg-[#1D2535]/30 border border-white/5"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="p-2 rounded-lg bg-green-500/10">
                <Dollar class="text-green-400 size-5" />
              </div>
              <h2 class="text-lg font-semibold">Square Payment</h2>
            </div>
          </div>

          <Input
            type="number"
            name="usdToRobuxRate"
            class="items-center pt-0.5"
            bind:value={usdToRobuxRateInput}
            label="USD to Robux Conversion Rate"
            placeholder="e.g., 0.00829"
            error={form?.errors?.usdToRobuxRate}
            step="0.00001"
            min="0"
            helperText={form?.errors?.usdToRobuxRate
              ? [form.errors.usdToRobuxRate]
              : ['Rate per 1 USD (e.g., 0.00829 = 1 Robux per $0.00829)']}
          >
            <div
              slot="startIcon"
              class="flex items-center gap-2 text-[#809BB5]"
            >
              <Dollar class="p-0 mr-1 text-white size-4" />
            </div>
          </Input>

          <div class="grid grid-cols-2 gap-4">
            <Input
              type="number"
              name="minRobuxPerPurchase"
              bind:value={minRobuxInput}
              label="Minimum Robux per Purchase"
              placeholder="e.g., 300"
              error={form?.errors?.minRobuxPerPurchase}
              min="1"
              helperText={form?.errors?.minRobuxPerPurchase
                ? [form.errors.minRobuxPerPurchase]
                : undefined}
            >
              <div
                slot="endIcon"
                class="flex items-center gap-2 text-[#809BB5]"
              >
                <Robux class="text-white size-4" />
              </div>
            </Input>

            <Input
              type="number"
              name="maxRobuxPerPurchase"
              bind:value={maxRobuxInput}
              label="Maximum Robux per Purchase"
              placeholder="e.g., 10000"
              error={form?.errors?.maxRobuxPerPurchase}
              min="1"
              helperText={form?.errors?.maxRobuxPerPurchase
                ? [form.errors.maxRobuxPerPurchase]
                : undefined}
            >
              <div
                slot="endIcon"
                class="flex items-center gap-2 text-[#809BB5]"
              >
                <Robux class="text-white size-4" />
              </div>
            </Input>
          </div>

          <Input
            type="number"
            name="purchaseLimitHours"
            bind:value={purchaseLimitHoursInput}
            label="Purchase Limit (Hours)"
            placeholder="e.g., 6"
            error={form?.errors?.purchaseLimitHours}
            min="0"
            helperText={form?.errors?.purchaseLimitHours
              ? [form.errors.purchaseLimitHours]
              : [
                  'Users can only purchase once per this many hours. Set to 0 to disable ratelimiting.'
                ]}
          />

          <div class="p-3 border rounded-lg bg-green-500/10 border-white/5">
            <p class="text-xs text-[#809BB5] mb-2">Preview</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-base font-semibold">${previewUsd} USD</span>
              </div>
              <span class="text-[#809BB5]">=</span>
              <div class="flex items-center gap-2">
                <Robux class="text-amber-300 size-5" />
                <span class="text-base font-semibold"
                  >{Math.round(previewUsd / usdToRobuxRateInput)} R$</span
                >
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs text-[#809BB5] mt-2">
              <div>
                <span class="block">
                  1 R$ = ${usdToRobuxRateInput}
                </span>
                <span class="block text-xs text-[#809BB5] mt-1">
                  {purchaseLimitHoursInput > 0
                    ? `Rate limit: 1 order per ${purchaseLimitHoursInput} hour${purchaseLimitHoursInput > 1 ? 's' : ''}`
                    : 'No ratelimit.'}
                </span>
              </div>
              <div>
                <span class="block text-right">Min: {minRobuxInput} R$</span>
                <span class="block text-right">Max: {maxRobuxInput} R$</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Webhooks / Integrations -->
        <div
          class="space-y-4 p-4 rounded-lg bg-[#1D2535]/30 border border-white/5 lg:col-span-2"
        >
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-purple-500/10">
              <Gear class="text-purple-400 size-5" />
            </div>
            <h2 class="text-lg font-semibold">Webhooks & Integrations</h2>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              type="password"
              name="squareWebhookSignaturesPayments"
              bind:value={squareWebhookPaymentsKeyInput}
              label="Square Payments Webhook Signature Key"
              placeholder="Leave empty to keep current value"
              error={form?.errors?.squareWebhookSignaturesPayments}
              helperText={form?.errors?.squareWebhookSignaturesPayments
                ? [form.errors.squareWebhookSignaturesPayments]
                : ['Square Dashboard > Webhooks (payment.created)']}
            />

            <Input
              type="password"
              name="squareWebhookSignaturesDisputes"
              bind:value={squareWebhookDisputesKeyInput}
              label="Square Disputes Webhook Signature Key"
              placeholder="Leave empty to keep current value"
              error={form?.errors?.squareWebhookSignaturesDisputes}
              helperText={form?.errors?.squareWebhookSignaturesDisputes
                ? [form.errors.squareWebhookSignaturesDisputes]
                : ['Square Dashboard > Webhooks (dispute.created)']}
            />

            <Input
              type="url"
              name="discordDisputeWebhookUrl"
              bind:value={discordWebhookUrlInput}
              label="Discord Dispute Webhook URL"
              placeholder="https://discord.com/api/webhooks/..."
              error={form?.errors?.discordDisputeWebhookUrl}
              helperText={form?.errors?.discordDisputeWebhookUrl
                ? [form.errors.discordDisputeWebhookUrl]
                : ['Leave empty to disable Discord notifications']}
            />
          </div>
        </div>

        <div class="lg:col-span-2">
          <Button
            type="submit"
            variant="gradient"
            color="accent"
            class="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  </div>
</div>
