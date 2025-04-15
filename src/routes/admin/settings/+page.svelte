<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import { Gear, Robux, Euro } from '$lib/icons';
  import { toast } from '$lib/svoast';
  import { bgBlur } from '$lib/utils';
  import { fly, slide } from 'svelte/transition';

  export let data;
  export let form;
  let euroToRobuxRateInput;
  let isSubmitting = false;

  // Initialize the input value once
  $: if (data.settings && euroToRobuxRateInput === undefined) {
    euroToRobuxRateInput = data.settings.euroToRobuxRate;
  }

  // Handle potential form errors passed back from the server action
  $: if (form?.success === false && form?.message) {
    toast.error(form.message);
  }

  // Calculate preview values
  $: previewEuro = 10;
  $: previewRobux = previewEuro * euroToRobuxRateInput;
</script>

<div class="max-w-[1440px] h-full w-full mx-auto" in:slide={{ y:20, duration: 300 }}>
  <div class="w-full h-full p-8 space-y-8 rounded-lg"
       style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}"
       in:fly={{ y: 20, duration: 300 }}>

    <div class="flex items-center justify-between"
         in:slide={{ duration: 300 }}>
      <div class="flex items-center gap-3">
        <div class="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
          <Gear class="text-blue-400 size-8" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
            Global Settings
          </h1>
          <p class="text-sm text-[#809BB5]">Manage your application's global configuration</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <form
        method="POST"
        action="?/updateSettings"
        use:enhance={() => {
          isSubmitting = true;
          
          return async ({ result, update }) => {
            if (result.type === 'success' && result.data?.success) {
              toast.success('Settings updated successfully!');
              await invalidateAll();
            } else if (result.type === 'failure') {
              console.error('Failed to update settings:', result.data?.message);
            } else if (result.type === 'error') {
              toast.error(`An unexpected error occurred: ${result.error.message}`);
            }
            isSubmitting = false;
          };
        }}
        class="space-y-6 bg-[#1D2535]/30 p-6 rounded-xl border border-white/5"
      >
        <div class="flex items-center gap-2 mb-4">
          <div class="p-2 rounded-lg bg-blue-500/10">
            <Euro class="text-blue-400 size-5" />
          </div>
          <h2 class="text-lg font-semibold">Currency Settings</h2>
        </div>

        <div class="space-y-4">
          <div>
            <Input
              type="number"
              name="euroToRobuxRate"
              bind:value={euroToRobuxRateInput}
              label="Euro to Robux Conversion Rate"
              placeholder="e.g., 10"
              error={form?.errors?.euroToRobuxRate}
              min="0"
              max="1000"
              helperText={form?.errors?.euroToRobuxRate ? [form.errors.euroToRobuxRate] : undefined}
            >
              <div slot="endIcon" class="flex items-center gap-2 text-[#809BB5]">
                <Robux class="size-4" />
              </div>
            </Input>
          </div>
    
          <Button 
            type="submit" 
            variant="gradient" 
            color="accent" 
            class="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>

      <div class="space-y-6 bg-[#1D2535]/30 p-6 rounded-xl border border-white/5">
        <div class="flex items-center gap-2 mb-4">
          <div class="p-2 rounded-lg bg-purple-500/10">
            <Robux class="text-purple-400 size-5" />
          </div>
          <h2 class="text-lg font-semibold">Live Preview</h2>
        </div>

        <div class="space-y-4">
          <div class="p-4 border rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-[#809BB5]">Example Conversion</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Euro class="text-blue-400 size-5" />
                <span class="text-xl font-semibold">{previewEuro}</span>
              </div>
              <span class="text-[#809BB5]">=</span>
              <div class="flex items-center gap-2">
                <Robux class="text-purple-400 size-5" />
                <span class="text-xl font-semibold">{previewRobux}</span>
              </div>
            </div>
          </div>

          <div class="p-4 space-y-2 border rounded-lg border-white/5">
            <div class="flex items-center justify-between text-sm">
              <span class="text-[#809BB5]">Current Rate:</span>
              <span class="font-medium">1 EUR = {euroToRobuxRateInput} R$</span>
            </div>
            <div class="w-full bg-[#1D2535]/50 h-1 rounded-full overflow-hidden">
              <div class="h-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-400 to-purple-400" 
                   style="width: {Math.min((euroToRobuxRateInput / 100) * 100, 100)}%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>