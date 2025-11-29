<script>
  import Button from '$lib/components/Button.svelte';
  import HoverCard from '$lib/components/HoverCard.svelte';
  import { Robux, Trustpilot, RoundedArrowRight, Discord } from '$lib/icons';
  import { bgBlur } from '$lib/utils';
  import translations from '$lib/utils/translations';
  import { languageStore } from '$lib/utils/stores';
  import { fade, fly, scale, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  import { toast } from '$lib/svoast';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import VideoModal from '$lib/modals/bloxypoints/video-modal.svelte';

  export let data;

  let showVideoModal = false;

  let products = data.bloxypointsProducts || [];

  // Sort products by price or robux amount
  $: sortedProducts = products.sort((a, b) => a.price - b.price);

  // Map products to the structure we need
  $: robuxPacks = sortedProducts
    .map((p) => {
      // modifyProductTags converts tags to properties and removes the tags array
      const amount = p.robuxAmount ? parseInt(p.robuxAmount) : 0;
      return {
        id: p.variantId, // Use variantId as the ID
        amount: amount,
        price: p.price,
        best: p.best === 'true'
      };
    })
    .filter((p) => p.amount > 0);

  let selectedPackId = null;
  $: selectedPack =
    robuxPacks.find((p) => p.id === selectedPackId) || robuxPacks[0];
  $: amount = selectedPack?.amount || 0;
  $: approxPrice = selectedPack?.price || 0;

  function selectPack(id) {
    selectedPackId = id;
  }

  async function handleBuy() {
    // Check authentication
    if (!$page.data.localUser) {
      toast.error('Please log in to purchase Bloxypoints');
      return;
    }

    if (!selectedPack) return;

    try {
      const res = await fetch('/api/payments/shopify/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: selectedPack.id })
      });

      const result = await res.json();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.webUrl) {
        window.location.href = result.webUrl;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to initiate checkout');
    }
  }
</script>

<svelte:head>
  <title
    >{translations[$languageStore].robuxPage?.metaTitle ??
      'Buy Bloxypoints - BloxyFruit'}</title
  >
  <meta
    name="description"
    content={translations[$languageStore].robuxPage?.metaDescription ??
      'Buy Bloxypoints securely on BloxyFruit. Choose an amount and get fast delivery with a trusted process.'}
  />
  <link rel="canonical" href="https://bloxyfruit.com/bloxypoints" />
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

          <h1 class="mt-4 text-[34px] sm:text-5xl font-extrabold leading-tight">
            {translations[$languageStore].robuxPage?.heroPowerUp ??
              'Power up with'}
            <span class="text-[#3BA4F0]"
              >{translations[$languageStore].robuxPage?.robuxWord ??
                'Bloxypoints'}</span
            >
          </h1>
          <p class="text-[#809BB5] md:text-lg font-medium max-w-[620px] mt-2">
            {translations[$languageStore].robuxPage?.heroSubtitle ??
              'The internal currency of BloxyFruit. Buy Bloxypoints and exchange them for Robux instantly!'}
          </p>

          <!-- Pack Selection Grid -->
          <div
            class="grid grid-cols-2 gap-3 mt-8"
            in:fly|local={{
              y: 20,
              duration: 300,
              delay: 100,
              easing: quintOut
            }}
          >
            {#each robuxPacks as p, i (p.id)}
              <button
                class="relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 group
                {selectedPackId === p.id
                  ? 'bg-[#3BA4F0]/10 border-[#3BA4F0] shadow-[0_0_20px_rgba(59,164,240,0.15)]'
                  : 'bg-[#1D2535]/40 border-[#3BA4F0]/10 hover:border-[#3BA4F0]/40 hover:bg-[#1D2535]/60 hover:-translate-y-1'}"
                on:click={() => selectPack(p.id)}
              >
                {#if p.best}
                  <div
                    class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#3BA4F0] to-[#2B7CB0] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
                  >
                    BEST VALUE
                  </div>
                {/if}

                <div
                  class="size-10 rounded-full flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110
                  {selectedPackId === p.id
                    ? 'bg-[#3BA4F0]/20'
                    : 'bg-[#3BA4F0]/10'}"
                >
                  <Robux class="size-6 text-[#3BA4F0]" />
                </div>

                <span
                  class="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 group-hover:to-white"
                >
                  {p.amount}
                </span>
                <span
                  class="text-xs font-bold text-[#3BA4F0] uppercase tracking-wider mb-1"
                  >Bloxypoints</span
                >
              </button>
            {/each}
          </div>

          <!-- Summary & Action -->
          <div
            class="mt-6 p-4 rounded-xl border border-[#3BA4F0]/10 bg-[#1D2535]/40 backdrop-blur-sm"
            in:fly|local={{
              y: 20,
              duration: 300,
              delay: 200,
              easing: quintOut
            }}
          >
            <div class="flex items-center justify-between mb-4">
              <span class="text-[#809BB5] font-medium">Total Price</span>
              <span class="text-xl font-bold text-white">€{approxPrice}</span>
            </div>

            <Button
              color="accent"
              variant="gradient"
              class="w-full shadow-[0_4px_20px_rgba(59,164,240,0.25)] hover:shadow-[0_4px_25px_rgba(59,164,240,0.4)] transition-shadow duration-300"
              onClick={handleBuy}
              disabled={!selectedPack}
            >
              <span class="flex items-center gap-2">
                {translations[$languageStore].robuxPage?.continueCta ??
                  'Purchase'}
                {amount} BP
                <RoundedArrowRight class="size-4" />
              </span>
            </Button>

            <p class="text-xs text-[#809BB5]/80 text-center mt-3">
              {translations[$languageStore].robuxPage?.disclaimer}
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
            src="/assets/character-ilustration-3.webp"
            class="max-w-none max-xl:w-[600px] max-[1650px]:w-[650px] w-[700px] absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none hidden md:block"
            alt=""
            in:fly|local={{
              x: 40,
              duration: 400,
              delay: 100,
              easing: quintOut
            }}
          />

          <div
            class="absolute top-[15%] left-[10%] animate-float [--duration:2.4s] [--rotation:-10deg] hidden md:block"
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
            class="absolute top-[60%] left-[5%] animate-float [--duration:3.1s] [--rotation:14deg] [--adjusted-rotation:10deg] hidden md:block"
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
            class="absolute top-[15%] right-[10%] animate-float [--duration:2.8s] [--rotation:10deg] hidden md:block"
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
            class="absolute bottom-[20%] right-[10%] animate-float [--duration:3.4s] [--rotation:-12deg] hidden md:block"
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
        <p class="text-[#809BB5] font-medium mt-1 mb-4">
          {translations[$languageStore].robuxPage?.howItWorksSubtitle ??
            'Simple, transparent, and fast.'}
        </p>

        <button
          class="relative w-full aspect-video rounded-lg overflow-hidden bg-black/40 border border-[#3BA4F0]/20 group cursor-pointer"
          on:click={() => (showVideoModal = true)}
        >
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="size-16 rounded-full bg-[#3BA4F0]/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300"
            >
              <div
                class="size-12 rounded-full bg-[#3BA4F0] flex items-center justify-center pl-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="text-white size-6"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div
            class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
          >
            <p class="text-sm font-medium text-white">
              Watch how to buy and exchange Bloxypoints
            </p>
          </div>
          <!-- Video placeholder - Replace src with actual video URL later -->
          <video
            class="object-cover w-full h-full opacity-60"
            poster="/assets/landing-background.webp"
          >
            <track kind="captions" />
          </video>
        </button>
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

  <!-- Discord CTA Section -->
  <section class="max-w-[1400px] w-full px-4 sm:px-6 pb-12 md:pb-20">
    <div
      class="relative flex flex-col items-center justify-between gap-8 p-8 overflow-hidden rounded-2xl md:p-12 md:flex-row"
      style="background: linear-gradient(125.74deg, rgba(88, 101, 242, 0.1) 0%, rgba(88, 101, 242, 0.05) 100%); border: 1px solid rgba(88, 101, 242, 0.2);"
    >
      <!-- Background effects -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          class="absolute top-0 right-0 size-[300px] bg-[#5865F2]/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3"
        ></div>
        <div
          class="absolute bottom-0 left-0 size-[200px] bg-[#5865F2]/10 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3"
        ></div>
      </div>

      <div class="relative z-10 max-w-2xl">
        <h2 class="mb-3 text-3xl font-bold text-white">
          Join our Bloxypoints Community
        </h2>
        <p class="text-[#B6C6D8] text-lg">
          Get 24/7 support, stay updated with the latest news, participate in
          giveaways, and connect with other traders.
        </p>
      </div>

      <div class="relative z-10 shrink-0">
        <Button
          to="https://discord.gg/fhBthxED3f"
          target="_blank"
          class="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-lg px-8 py-4 rounded-xl flex items-center gap-3 transition-all shadow-lg shadow-[#5865F2]/25 hover:shadow-[#5865F2]/40 hover:-translate-y-1"
        >
          <Discord class="size-6" />
          Join Server
        </Button>
      </div>
    </div>
  </section>
</div>

<VideoModal bind:open={showVideoModal} />

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
