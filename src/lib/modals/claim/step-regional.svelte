<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { Check } from '$lib/icons';

  const dispatch = createEventDispatcher();

  let confirmed = false;

  function handleConfirm() {
    if (confirmed) {
      dispatch('finish');
    }
  }
</script>

<div class="flex flex-col h-full" in:fade={{ duration: 300, delay: 200 }}>
  <div class="flex flex-col flex-shrink-0 gap-4">
    <div class="flex items-center gap-2">
      <span
        class="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text"
      >
        Regional Pricing
      </span>
    </div>

    <div
      class="w-full h-[3px] bg-gradient-to-r from-[#1D2535] via-[#2A3547] to-[#1D2535] rounded-full"
    ></div>
  </div>

  <div class="flex-1 overflow-y-auto py-4">
    <div
      class="space-y-6"
      in:fly={{ y: 20, duration: 400, delay: 300, easing: quintOut }}
    >
      <div class="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <p class="text-yellow-200 text-sm font-medium">
          ⚠️ Important: Regional pricing must be disabled for your gamepass. If
          it is enabled, you may receive less Robux than expected.
        </p>
      </div>

      <div
        class="relative aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-[#3BA4F0]/20"
      >
        
        <video
          class="w-full h-full object-cover"
          autoplay
          loop
          muted
          playsinline
        >
          <source src="https://eew5md6xck.ufs.sh/f/rnzfS37zDImSh2VqSyJ3NndlBmW8HqoK4LAhU67kzCJ2f9bj" type="video/mp4" />
        </video>
      </div>

      <button
        class="flex items-start gap-3 p-4 w-full rounded-xl border transition-all duration-200 text-left group
        {confirmed
          ? 'bg-[#3BA4F0]/10 border-[#3BA4F0] shadow-[0_0_20px_rgba(59,164,240,0.1)]'
          : 'bg-[#1D2535]/40 border-[#3BA4F0]/10 hover:bg-[#1D2535]/60 hover:border-[#3BA4F0]/30'}"
        on:click={() => (confirmed = !confirmed)}
      >
        <div
          class="relative flex-shrink-0 size-6 mt-0.5 rounded-md border transition-all duration-200 flex items-center justify-center
          {confirmed
            ? 'bg-[#3BA4F0] border-[#3BA4F0]'
            : 'border-[#809BB5]/50 group-hover:border-[#3BA4F0]/50'}"
        >
          {#if confirmed}
            <Check class="size-4 text-white" strokeWidth={3} />
          {/if}
        </div>
        <div class="space-y-1">
          <p
            class="font-medium text-white group-hover:text-[#3BA4F0] transition-colors"
          >
            I confirm that regional pricing is disabled
          </p>
          <p class="text-sm text-[#809BB5]">
            I understand that enabling regional pricing may result in incorrect
            payout amounts.
          </p>
        </div>
      </button>
    </div>
  </div>

  <div
    class="flex flex-col items-end flex-shrink-0 pt-4 border-t border-white/5"
  >
    <Button
      variant="gradient"
      color="accent"
      disabled={!confirmed}
      onClick={handleConfirm}
      class="w-full sm:w-auto"
    >
      Continue
    </Button>
  </div>
</div>
