<script>
  import { createEventDispatcher } from 'svelte';
  import { Dialog } from "bits-ui";
  import { fade } from "svelte/transition";
  import Close from "$icons/close.svelte";
  import cn from "$lib/utils/cn";
  import StepA from './step-a.svelte';
  import StepB from './step-b.svelte';
  import StepIndicator from '$lib/components/StepIndicator.svelte';

  export let open;
  export let robuxAmount;

  const dispatch = createEventDispatcher();

  let currentStep = 1;
  let stepData = {};
  
  const steps = ['Account Selection', 'Confirm']; // Define step labels

  function handleStepAConfirm(event) {
      stepData = { confirmedInput: event.detail.robloxUser };
      currentStep = 2; // Move to Step B
  }

  function handleStepBFinish() {
      console.log('Modal finished with data:', stepData);
      dispatch('finish', stepData);
      open = false;
      setTimeout(() => {
          currentStep = 1;
          stepData = {};
      }, 200);
  }

  function handleStepClick(step) {
      // Only allow going back to previous steps
      if (step < currentStep) {
          currentStep = step;
          // Optionally clear data for subsequent steps
          if (step === 1) {
              stepData = {};
          }
      }
  }

  // Reset state when modal is closed
  $: if (!open && currentStep !== 1) {
      setTimeout(() => {
          currentStep = 1;
          stepData = {};
      }, 200);
  }
</script>

<Dialog.Root bind:open={open}>
  <Dialog.Portal>
      <Dialog.Overlay
          transition={fade}
          transitionConfig={{ duration: 150 }}
          class="fixed inset-0 z-[150] bg-[#0C0E16]/80"
      />

      <Dialog.Content
          class={cn(
              "bg-[#131620] overflow-hidden rounded-xl fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 outline-none z-[170] w-full min-[870px]:max-w-[400px] xl:min-w-[400px] max-[869px]:h-full min-[870px]:max-h-[calc(100%-40px)] flex flex-col min-[870px]:flex-row",
              "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
              $$props.contentClass
          )}
      >
          <Dialog.Close class="absolute z-10 top-6 right-6">
              <Close class="size-[22px]" strokeWidth={2} />
          </Dialog.Close>
          <div class="size-72 bg-[#3BA4F0]/10 blur-[100px] absolute -top-36 -left-36 z-[-1]"></div>

          <div class="relative flex flex-col w-full p-6">
              <!-- Step Indicator -->
              <StepIndicator 
                  {steps}
                  {currentStep}
                  onStepClick={handleStepClick}
              />

              <div class="mt-4">
                  {#if currentStep === 1}
                      <StepA on:confirm={handleStepAConfirm} />
                  {:else if currentStep === 2}
                      <StepB data={stepData} on:finish={handleStepBFinish} />
                  {/if}
              </div>
          </div>
      </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>