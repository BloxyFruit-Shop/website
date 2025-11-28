<script>
  import { Dialog } from 'bits-ui';
  import { fade } from 'svelte/transition';
  import Close from '$icons/close.svelte';
  import cn from '$lib/utils/cn';
  import Button from '$lib/components/Button.svelte';

  export let open = false;

  let language = 'en'; // 'en' | 'es'

  // Placeholder video sources - replace with actual URLs when available
  const videos = {
    en: 'https://eew5md6xck.ufs.sh/f/rnzfS37zDImSchsQijGsNiqP4Ap5hLGxdM8ebCS61oTm3aXf', // Placeholder
    es: 'https://eew5md6xck.ufs.sh/f/rnzfS37zDImS0pkTyys17CuQr8A4Mp1LTvVlHEtaWcKeqwgm' // Placeholder
  };

  function setLanguage(lang) {
    language = lang;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={{ duration: 150 }}
      class="fixed inset-0 z-[150] bg-[#0C0E16]/80 backdrop-blur-sm"
    />

    <Dialog.Content
      class={cn(
        'bg-[#131620] overflow-hidden rounded-xl fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 outline-none z-[170] w-full max-w-[800px] max-h-[calc(100%-40px)] flex flex-col shadow-2xl border border-[#3BA4F0]/10',
        'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        $$props.contentClass
      )}
    >
      <Dialog.Close
        class="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors"
      >
        <Close class="size-5" strokeWidth={2} />
      </Dialog.Close>

      <!-- Video Container -->
      <div class="relative w-full aspect-video bg-black">
        {#key language}
          <video
            class="w-full h-full object-contain"
            controls
            autoplay
            src={videos[language]}
          >
            <track kind="captions" />
          </video>
        {/key}
      </div>

      <!-- Controls -->
      <div
        class="p-6 bg-[#131620] border-t border-[#3BA4F0]/10 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <h3 class="text-lg font-bold text-white">How it works</h3>
          <p class="text-sm text-[#809BB5]">
            Watch our guide on buying and exchanging Bloxypoints.
          </p>
        </div>

        <div
          class="flex items-center gap-2 bg-[#0C0E16] p-1 rounded-lg border border-[#3BA4F0]/10"
        >
          <button
            class={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              language === 'en'
                ? 'bg-[#3BA4F0] text-white shadow-lg shadow-[#3BA4F0]/20'
                : 'text-[#809BB5] hover:text-white hover:bg-[#3BA4F0]/10'
            )}
            on:click={() => setLanguage('en')}
          >
            English
          </button>
          <button
            class={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              language === 'es'
                ? 'bg-[#3BA4F0] text-white shadow-lg shadow-[#3BA4F0]/20'
                : 'text-[#809BB5] hover:text-white hover:bg-[#3BA4F0]/10'
            )}
            on:click={() => setLanguage('es')}
          >
            Español
          </button>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
