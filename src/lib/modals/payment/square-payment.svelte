<script>
  import { Dialog } from 'bits-ui';
  import { Close, Robux } from '$lib/icons';
  import { toast } from '$lib/svoast';
  import Button from '$lib/components/Button.svelte';
  import { bgBlur } from '$lib/utils';
  import { createEventDispatcher } from 'svelte';
  import { parseSquareError } from '$lib/utils/square-error-messages.js';

  export let open = false;
  export let robuxAmount = 500;
  export let approxPrice = '4.15';
  export let squareAppId = '';
  export let squareLocationId = '';
  export let claimData = null;  // NEW: Claim data for robux purchases

  const dispatch = createEventDispatcher();

  let loading = false;
  let error = '';
  let cardAttached = false;
  let paymentInProgress = false;

  let squarePayments = null;
  let card = null;

  // Initialize Square payments when modal opens
  $: if (open && !cardAttached) {
    initializeSquarePayments();
  }

  async function initializeSquarePayments() {
    try {
      if (!window.Square) {
        error = 'Payment system is loading. Please try again.';
        return;
      }

      if (!squareAppId || !squareLocationId) {
        error = 'Payment configuration is missing. Please contact support.';
        return;
      }

      squarePayments = window.Square.payments(squareAppId, squareLocationId);
      // Create card payment method with custom styling
      card = await squarePayments.card({
        style: {
          input: {
            color: '#FFFFFF',
            fontSize: '16px',
            fontFamily: 'inherit'
          },
          '.input-container': {
            borderColor: '#3BA4F0'
          },
          'input::placeholder': {
            color: 'rgba(128, 155, 181, 0.4)'
          }
        }
      });
      await card.attach('#card-container');
      cardAttached = true;
    } catch (err) {
      console.error('Square initialization error:', err);
      if (err.message?.includes('ApplicationIdEnvironmentMismatchError')) {
        error =
          'Payment environment mismatch. Please contact support with error code: ENV_MISMATCH';
      } else {
        error = 'Failed to initialize payment system. Please try again.';
      }
    }
  }

  async function processPayment() {
    if (!card || paymentInProgress) return;

    paymentInProgress = true;
    error = '';
    loading = true;

    try {
      // Request card details from the card element
      const result = await card.tokenize();

      if (result) {
        const token = result.token;

        // Send payment to backend
        const paymentRes = await fetch('/api/payments/square/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            robuxAmount,
            sourceId: token,
            claimData: claimData  // NEW: Pass claim data
          })
        });

        const paymentData = await paymentRes.json();

        if (!paymentRes.ok) {
          if (paymentData.rateLimitHours) {
            error = `You can purchase again in ${paymentData.rateLimitHours} hours.`;
          } else {
            // Use the improved error message from backend
            error = paymentData.error || 'Payment failed. Please try again.';
          }
          return;
        }

        toast.success(
          `Payment successful! ${robuxAmount} Robux will be added to your account shortly.`,
          { duration: 4000 }
        );
        dispatch('payment-success', { paymentId: paymentData.paymentId });
        open = false;
      } else if (result.status === 'NETWORK_ERROR') {
        error = 'Network error. Please check your connection and try again.';
      } else if (result.errors && Array.isArray(result.errors)) {
        // Parse tokenization errors
        const parsedError = parseSquareError(result.errors[0]);
        error = parsedError.message;
      } else {
        error =
          result.errors?.[0]?.message || 'Payment failed. Please try again.';
      }
    } catch (err) {
      console.error('Payment error:', err);
      error = 'An error occurred during payment. Please try again.';
    } finally {
      loading = false;
      paymentInProgress = false;
    }
  }

  // Reset state when modal closes
  $: if (!open) {
    error = '';
    cardAttached = false;
    card = null;
    squarePayments = null;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
    />
    <Dialog.Content
      class="
        fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full bg-[#131620] rounded-lg shadow-xl p-6 z-[110]
        duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
      "
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold">Complete Purchase</h2>
        <Dialog.Close class="text-[#809BB5] hover:text-white">
          <Close class="size-5" />
        </Dialog.Close>
      </div>

      <!-- Order Summary -->
      <div
        class="p-4 mb-6 rounded-lg"
        style={bgBlur({ color: '#1D2535', blur: 8, opacity: 0.6 })}
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Robux class="size-5 text-[#3BA4F0]" />
            <span class="text-sm text-[#809BB5]">Robux Amount</span>
          </div>
          <span class="font-semibold">{robuxAmount} R$</span>
        </div>
        <div
          class="flex items-center justify-between border-t border-[#3BA4F0]/10 pt-3"
        >
          <span class="text-sm text-[#809BB5]">Total Price</span>
          <span class="text-lg font-semibold">${approxPrice} USD</span>
        </div>
      </div>

      <!-- Card Input -->
      <div class="mb-6">
        <label class="block mb-2 text-sm font-medium">Card Details</label>
        <div id="card-container" class="rounded-lg square-card-container"></div>
      </div>

      <!-- Error Message -->
      {#if error}
        <div class="p-3 mb-4 border rounded-lg bg-red-500/10 border-red-500/30">
          <p class="text-sm text-red-400">{error}</p>
        </div>
      {/if}

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <Dialog.Close asChild let:builder>
          <Button
            builders={[builder]}
            variant="contained"
            color="gray"
            class="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          variant="gradient"
          color="accent"
          class="flex-1"
          disabled={loading || !cardAttached}
          onClick={processPayment}
        >
          {#if loading}
            Processing...
          {:else}
            Pay ${approxPrice}
          {/if}
        </Button>
      </div>

      <!-- Security Notice -->
      <p class="text-xs text-[#809BB5] text-center mt-4">
        Your payment is secured by Square. We never store your card details.
      </p>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.sq-card-iframe-container) {
    border: 1px solid #3ba4f0 !important;
    background-color: #0c0e16 !important;
  }

  :global(.sq-card-message) {
    color: #809bb5 !important;
  }

  :global(.sq-card-message::before) {
    background-color: #809bb5 !important;
  }

  :global(.sq-card-message-error) {
    color: #ef4444 !important;
  }
</style>
