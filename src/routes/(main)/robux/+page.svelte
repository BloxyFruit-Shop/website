<script>
  import Button from '$lib/components/Button.svelte';
  import HoverCard from '$lib/components/HoverCard.svelte';
  import { Robux, Trustpilot, RoundedArrowRight } from '$lib/icons';
  import { bgBlur } from '$lib/utils';
  import translations from '$lib/utils/translations';
  import { languageStore } from '$lib/utils/stores';
  import { fade, fly, scale, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  import { toast } from '$lib/svoast';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import SquarePaymentModal from '$lib/modals/payment/square-payment.svelte';
  import ClaimModal from '$lib/modals/claim/claim-modal-container.svelte';

  export let data;

  // Presets used across UI
  const robuxPacks = [
    { id: 'r300', amount: 300, best: false },
    { id: 'r500', amount: 500, best: false },
    { id: 'r800', amount: 800, best: true },
    { id: 'r1000', amount: 1000, best: false },
    { id: 'r2500', amount: 2500, best: false },
    { id: 'r5000', amount: 5000, best: false }
  ];

  let amount = 500; // default
  const MIN = 300;
  const MAX = 10000;
  const STEP = 50;

  let claimModalOpen = false;
  let paymentModalOpen = false;
  let pendingClaimData = null;
  let usdToRobuxRate = data.usdToRobuxRate;
  let rateLimitHours = data.purchaseLimitHours;
  let hoursUntilNextPurchase = 0;
  let isCreatingClaim = false; // Prevent duplicate claim creation

  $: approxPrice = Math.max(
    1,
    Math.round(amount * usdToRobuxRate * 100) / 100
  ).toFixed(2);

  // Keep presets in sync with slider when clicking
  function selectPack(id) {
    const pack = robuxPacks.find((p) => p.id === id);
    if (pack) amount = pack.amount;
  }

  function onSlide(e) {
    const val = Number(e.target.value);
    const snapped = Math.round(val / STEP) * STEP;
    amount = Math.min(MAX, Math.max(MIN, snapped));
  }

  function handleBuy() {
    if (hoursUntilNextPurchase > 0) {
      toast.error(
        `You can purchase again in ${Math.ceil(hoursUntilNextPurchase)} hours.`
      );
      return;
    }

    // Check authentication
    if (!$page.data.localUser) {
      toast.error('Please log in to purchase Robux');
      return;
    }

    // Open claim modal
    claimModalOpen = true;
  }

  // Custom finish function for robux purchase claims
  async function handleClaimFinish(claimData) {
    // Prevent duplicate claim creation
    if (isCreatingClaim) {
      console.warn('Claim creation already in progress');
      return;
    }

    isCreatingClaim = true;

    try {
      // Create robux claim via API
      const response = await fetch('/api/robux/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(claimData)
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to create claim');
        isCreatingClaim = false;
        return;
      }

      // Store claim data for payment modal
      pendingClaimData = {
        ...claimData,
        claimId: result.claimId
      };

      // Close claim modal
      claimModalOpen = false;

      // Open payment modal
      paymentModalOpen = true;
    } catch (error) {
      console.error('Error creating claim:', error);
      toast.error('Failed to create claim. Please try again.');
      isCreatingClaim = false;
    }
  }

  // Handle payment success
  function handlePaymentSuccess() {
    isCreatingClaim = false;
    // Payment webhook will update the claim
    // Redirect to account page
    goto('/account');
  }
</script>

<svelte:head>
  <title
    >{translations[$languageStore].robuxPage?.metaTitle ??
      'Buy Robux - BloxyFruit'}</title
  >
  <meta
    name="description"
    content={translations[$languageStore].robuxPage?.metaDescription ??
      'Buy Robux securely on BloxyFruit. Choose an amount and get fast delivery with a trusted process.'}
  />
  <link rel="canonical" href="https://bloxyfruit.com/robux" />
</svelte:head>

<div
  class="relative flex flex-col items-center pt-[80px] overflow-x-clip overflow-y-visible"
>
  <div
    class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/landing-background.webp)] bg-no-repeat bg-cover bg-center z-[-1]"
  ></div>
  <div
    class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/background-glow.webp)] opacity-[0.05] bg-no-repeat bg-cover bg-center z-[-1]"
  ></div>

  <div
    class="absolute top-[900px] left-[-100px] size-[200px] sm:size-[240px] bg-[#3BA4F0]/40 blur-[200px]"
  ></div>

  <!-- Hero -->
  <section class="max-w-[1400px] w-full px-4 sm:px-6 pt-6 overflow-hidden">
    <div
      class="relative overflow-hidden rounded-[32px] border border-[#3BA4F0]/10 bg-gradient-to-br from-[#101623] via-[#0f1420] to-[#12192a] [mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,1)_60%,rgba(0,0,0,0.7)_100%)]"
      in:fly={{ y: 20, duration: 300 }}
    >
      <div
        class="absolute inset-0 opacity-[0.06] bg-[url('/assets/landing-background.webp')] bg-cover bg-center"
      ></div>

      <div class="relative grid items-stretch gap-0 md:grid-cols-2">
        <!-- Left -->
        <div
          class="flex flex-col justify-center p-6 sm:p-10"
          in:slide={{ duration: 300 }}
        >
          <div class="flex gap-3 sm:items-center max-sm:flex-col">
            <a
              href="https://trustpilot.com/review/bloxyfruit.com"
              target="_blank"
            >
              <Trustpilot class="w-[200px] md:w-[230px]" />
            </a>
            <p class="text-sm font-medium md:text-base">
              {translations[$languageStore].trustpilotRated ??
                'Rated Excellent on Trustpilot'}
            </p>
          </div>

          <h1 class="mt-4 text-[34px] sm:text-5xl font-extrabold leading-tight">
            {translations[$languageStore].robuxPage?.heroPowerUp ??
              'Power up with'}
            <span class="text-[#3BA4F0]"
              >{translations[$languageStore].robuxPage?.robuxWord ??
                'Robux'}</span
            >
          </h1>
          <p class="text-[#809BB5] md:text-lg font-medium max-w-[620px] mt-2">
            {translations[$languageStore].robuxPage?.heroSubtitle ??
              'Slide to choose the exact amount or pick a preset. Fast delivery and the best prices!'}
          </p>

          <!-- Slider -->
          <div
            class="p-4 mt-6 rounded-xl"
            style={bgBlur({ color: '#111A28', blur: 8, opacity: 0.9 })}
            in:fly|local={{
              y: 20,
              duration: 300,
              delay: 100,
              easing: quintOut
            }}
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="size-8 rounded-full bg-[#3BA4F0]/10 flex items-center justify-center"
                >
                  <Robux class="size-4.5 text-[#3BA4F0]" />
                </div>
                <span class="text-lg font-semibold">{amount} R$</span>
              </div>
              <span class="text-sm text-[#809BB5]"
                >~ ${approxPrice}
                {translations[$languageStore].robuxPage?.usd ?? 'USD'}</span
              >
            </div>

            <input
              type="range"
              min={MIN}
              max={MAX}
              step={STEP}
              value={amount}
              on:input={onSlide}
              class="w-full mt-4 accent-[#3BA4F0] [--tw-shadow:0_10px_25px_0_rgba(59,164,240,0.10)]"
            />

            <div class="grid grid-cols-3 gap-2 mt-3 sm:grid-cols-6">
              {#each robuxPacks as p, i (p.id)}
                <button
                  class="relative p-2 rounded-md border transition-all group text-center text-sm font-medium {p.amount ===
                  amount
                    ? 'border-[#3BA4F0]/60 bg-[#1D2535]/60'
                    : 'border-[#3BA4F0]/10 hover:border-[#3BA4F0]/30 hover:bg-[#1D2535]/40'}"
                  on:click={() => selectPack(p.id)}
                  aria-pressed={p.amount === amount}
                  in:fly|local={{
                    y: 12,
                    duration: 220,
                    delay: 150 + i * 40,
                    easing: quintOut
                  }}
                >
                  {#if p.best}
                    <span
                      class="absolute -top-3 -right-2 text-[10px] px-1.5 py-0.5 rounded-full group-aria-pressed:bg-[#19354F] bg-[#19354F]/80 text-[#3BA4F0] font-semibold"
                      >Best</span
                    >
                  {/if}
                  {p.amount} R$
                </button>
              {/each}
            </div>

            <Button
              color="accent"
              variant="gradient"
              class="w-full mt-4"
              onClick={handleBuy}
              disabled={hoursUntilNextPurchase > 0}
            >
              {#if hoursUntilNextPurchase > 0}
                Can purchase in {Math.ceil(hoursUntilNextPurchase)} hours
              {:else}
                {translations[$languageStore].robuxPage?.continueCta ??
                  'Continue with'}
                {amount} R$ • ${approxPrice}
                <RoundedArrowRight class="size-4 ml-1.5" />
              {/if}
            </Button>

            <p class="text-xs text-[#809BB5] text-center mt-2 max-w-md mx-auto">
              {#if hoursUntilNextPurchase > 0}
                You can only purchase once every {rateLimitHours} hours
              {:else}
                {translations[$languageStore].robuxPage?.disclaimer}
              {/if}
            </p>
          </div>
        </div>

        <!-- Right -->
        <div class="relative min-h-[120px] md:min-h-[520px] overflow-hidden">
          <img
            src="/assets/pattern.webp"
            class="absolute inset-0 hidden object-contain w-full h-full pointer-events-none select-none opacity-40 md:block"
            alt="pattern"
          />
          <div
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[260px] sm:size-[300px] bg-[#3BA4F0]/55 blur-[110px] -z-10 md:block hidden"
          ></div>

          <img
            src="/assets/character-ilustration-4.webp"
            class="max-w-none max-xl:w-[465px] max-[1650px]:w-[485px] w-[515px] h-full absolute left-1/2 -translate-x-1/2 object-contain select-none pointer-events-none hidden md:block"
            in:fly|local={{
              x: 40,
              duration: 400,
              delay: 100,
              easing: quintOut
            }}
          />

          <div
            class="absolute top-[18%] left-[18%] animate-float [--duration:2.4s] [--rotation:-10deg] hidden md:block"
          >
            <div
              class="size-16 rounded-2xl flex items-center justify-center shadow-[0_10px_25px_0_rgba(59,164,240,0.12)]"
              style={bgBlur({ color: '#1D2535', blur: 12, opacity: 0.75 })}
              in:fly|local={{
                y: 20,
                x: -20,
                duration: 300,
                delay: 200,
                easing: quintOut
              }}
            >
              <Robux class="size-9 text-[#3BA4F0]" />
            </div>
          </div>
          <div
            class="absolute top-[58%] left-[10%] animate-float [--duration:3.1s] [--rotation:14deg] [--adjusted-rotation:10deg] hidden md:block"
          >
            <div
              class="flex items-center justify-center size-12 rounded-2xl"
              style={bgBlur({ color: '#1D2535', blur: 10, opacity: 0.7 })}
              in:fly|local={{
                y: 20,
                x: -20,
                duration: 300,
                delay: 250,
                easing: quintOut
              }}
            >
              <Robux class="size-7 text-[#3BA4F0]" />
            </div>
          </div>
          <div
            class="absolute top-[22%] right-[14%] animate-float [--duration:2.8s] [--rotation:10deg] hidden md:block"
          >
            <div
              class="flex items-center justify-center size-14 rounded-2xl"
              style={bgBlur({ color: '#1D2535', blur: 10, opacity: 0.7 })}
              in:fly|local={{
                y: 20,
                x: 20,
                duration: 300,
                delay: 300,
                easing: quintOut
              }}
            >
              <Robux class="size-8 text-[#3BA4F0]" />
            </div>
          </div>
          <div
            class="absolute bottom-[12%] right-[22%] animate-float [--duration:3.4s] [--rotation:-12deg] hidden md:block"
          >
            <div
              class="flex items-center justify-center size-24 rounded-2xl"
              style={bgBlur({ color: '#1D2535', blur: 14, opacity: 0.7 })}
              in:fly|local={{
                y: 20,
                x: 20,
                duration: 300,
                delay: 350,
                easing: quintOut
              }}
            >
              <Robux class="size-12 text-[#3BA4F0]" />
            </div>
          </div>

          <!-- Floating summary card -->
          <div class="absolute left-6 bottom-6 right-6">
            <div
              class="flex items-center justify-between gap-3 p-4 border border-blue-400/20 rounded-xl"
              style={bgBlur({ color: '#111A28', blur: 8, opacity: 0.9 })}
              in:fly|local={{
                y: 16,
                duration: 300,
                delay: 200,
                easing: quintOut
              }}
            >
              <div class="flex items-center gap-3">
                <div
                  class="size-9 rounded-full bg-[#3BA4F0]/10 flex items-center justify-center"
                >
                  <Robux class="size-5 text-[#3BA4F0]" />
                </div>
                <div>
                  <p class="text-sm text-[#809BB5] leading-none">
                    {translations[$languageStore].robuxPage?.selected ??
                      'Selected'}
                  </p>
                  <p class="text-lg font-semibold leading-tight">{amount} R$</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-[#809BB5] leading-none">
                  {translations[$languageStore].robuxPage?.estimated ??
                    'Estimated'}
                </p>
                <p class="text-lg font-semibold leading-tight">
                  ${approxPrice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Info & FAQ section -->
  <section
    class="max-w-[1400px] w-full px-4 sm:px-6 py-12 md:py-20 overflow-hidden"
  >
    <div class="grid items-stretch gap-6 md:grid-cols-2">
      <div
        class="relative p-6 overflow-hidden rounded-xl"
        style="background: linear-gradient(125.74deg, rgba(22, 26, 41, 0.65) 0%, rgba(22, 26, 41, 0.5525) 50%, rgba(22, 26, 41, 0.65) 100%)"
        in:fly|local={{ y: 20, duration: 300, delay: 100, easing: quintOut }}
      >
        <div class="absolute inset-0 pointer-events-none">
          <img
            src="/assets/circle-pattern.webp"
            class="size-[340px] top-[-200px] left-[-200px] mix-blend-overlay select-none absolute"
            alt="pattern"
          />
          <img
            src="/assets/circle-pattern.webp"
            class="size-[340px] bottom-[-200px] right-[-200px] mix-blend-overlay select-none absolute"
            alt="pattern"
          />
        </div>
        <HoverCard
          class="absolute inset-0 rounded-xl"
          gradientColor="#3ba4f030"
          gradientSize="190"
        />
        <h2 class="text-2xl font-extrabold">
          {translations[$languageStore].robuxPage?.howItWorksTitle ??
            'How it works'}
        </h2>
        <p class="text-[#809BB5] font-medium mt-1">
          {translations[$languageStore].robuxPage?.howItWorksSubtitle ??
            'Simple, transparent, and fast delivery.'}
        </p>
        <ol class="mt-4 space-y-2 text-sm text-[#B6C6D8]">
          <li>
            1. {translations[$languageStore].robuxPage?.steps?.[0] ??
              'Select your Robux amount using the slider above.'}
          </li>
          <li>
            2. {translations[$languageStore].robuxPage?.steps?.[1] ??
              'Proceed to checkout and pay securely.'}
          </li>
          <li>
            3. {translations[$languageStore].robuxPage?.steps?.[2] ??
              'Provide your Roblox username when requested.'}
          </li>
          <li>
            4. {translations[$languageStore].robuxPage?.steps?.[3] ??
              'Receive your Robux quickly after payment verification.'}
          </li>
        </ol>
      </div>

      <div
        class="p-6 space-y-4 rounded-xl"
        style={bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}
        in:fly|local={{ y: 20, duration: 300, delay: 200, easing: quintOut }}
      >
        <h3 class="text-xl font-extrabold">
          {translations[$languageStore].robuxPage?.faqTitle ??
            'Frequently Asked'}
        </h3>
        <div class="grid gap-3">
          <div
            class="p-4 rounded-lg border border-[#3BA4F0]/10 bg-[#1D2535]/30"
            in:fly|local={{
              y: 12,
              duration: 280,
              delay: 250,
              easing: quintOut
            }}
          >
            <p class="font-semibold">
              {translations[$languageStore].robuxPage?.faq?.speedTitle ??
                'How fast is delivery?'}
            </p>
            <p class="text-sm text-[#809BB5] mt-1">
              {translations[$languageStore].robuxPage?.faq?.speedBody ??
                'Most orders are completed shortly after payment verification. Large orders may take a bit longer.'}
            </p>
          </div>
          <div
            class="p-4 rounded-lg border border-[#3BA4F0]/10 bg-[#1D2535]/30"
            in:fly|local={{
              y: 12,
              duration: 280,
              delay: 300,
              easing: quintOut
            }}
          >
            <p class="font-semibold">
              {translations[$languageStore].robuxPage?.faq?.safetyTitle ??
                'Is my account safe?'}
            </p>
            <p class="text-sm text-[#809BB5] mt-1">
              {translations[$languageStore].robuxPage?.faq?.safetyBody ??
                'Yes. We never ask for your password. We only need your Roblox username to deliver.'}
            </p>
          </div>
          <div
            class="p-4 rounded-lg border border-[#3BA4F0]/10 bg-[#1D2535]/30"
            in:fly|local={{
              y: 12,
              duration: 280,
              delay: 350,
              easing: quintOut
            }}
          >
            <p class="font-semibold">
              {translations[$languageStore].robuxPage?.faq?.paymentsTitle ??
                'What payment methods do you accept?'}
            </p>
            <p class="text-sm text-[#809BB5] mt-1">
              {translations[$languageStore].robuxPage?.faq?.paymentsBody ??
                "We support multiple secure payment options. You'll see all options at checkout."}
            </p>
          </div>
          <div
            class="p-4 rounded-lg border border-[#3BA4F0]/10 bg-[#1D2535]/30"
            in:fly|local={{
              y: 12,
              duration: 280,
              delay: 400,
              easing: quintOut
            }}
          >
            <p class="font-semibold">
              {translations[$languageStore].robuxPage?.faq?.refundsTitle ??
                'Can I get a refund?'}
            </p>
            <p class="text-sm text-[#809BB5] mt-1">
              {translations[$languageStore].robuxPage?.faq?.refundsBody ??
                'Refunds are handled case-by-case according to our policy. Contact support if you have an issue.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<!-- Claim Modal -->
<ClaimModal
  bind:open={claimModalOpen}
  bind:robuxAmount={amount}
  finishFunction={handleClaimFinish}
/>

<!-- Payment Modal -->
<SquarePaymentModal
  bind:open={paymentModalOpen}
  robuxAmount={amount}
  {approxPrice}
  squareAppId={data.squareAppId}
  squareLocationId={data.squareLocationId}
  claimData={pendingClaimData}
  on:payment-success={handlePaymentSuccess}
/>

<style>
  :global(.animate-float) {
    animation: float var(--duration, 3s) ease-in-out infinite alternate;
  }
  @keyframes float {
    0% {
      transform: translateY(0) rotate(var(--rotation, 0deg));
    }
    100% {
      transform: translateY(-14px)
        rotate(var(--adjusted-rotation, var(--rotation, 0deg)));
    }
  }
</style>
