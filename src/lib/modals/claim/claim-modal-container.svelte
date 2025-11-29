<script>
  import { createEventDispatcher } from 'svelte';
  import { Dialog } from 'bits-ui';
  import { fade } from 'svelte/transition';
  import Close from '$icons/close.svelte';
  import cn from '$lib/utils/cn';
  import StepA from './step-a.svelte';
  import StepB from './step-b.svelte';
  import StepC from './step-c.svelte';
  import StepD from './step-d.svelte';
  import StepRegional from './step-regional.svelte';
  import StepE from './step-e.svelte';
  import StepIndicator from '$lib/components/StepIndicator.svelte';

  export let open;
  export let robuxAmount;
  export let finishFunction = null; // NEW: Custom handler for robux purchases

  const dispatch = createEventDispatcher();

  let currentStep = 1;
  let stepData = {};

  // Keep robux-related values in sync with the latest prop value
  $: if (robuxAmount != null && stepData.robuxAmount !== robuxAmount) {
    stepData = {
      ...stepData,
      robuxAmount,
      adjustedRobuxAmount: Math.ceil((robuxAmount / 70) * 100)
    };
  }

  const steps = ['Account', 'Game', 'Pass', 'ID', 'Regional', 'Confirm']; // Define step labels

  function handleStepAConfirm(event) {
    stepData = { ...stepData, user: event.detail.robloxUser };
    currentStep = 2; // Move to step B
  }

  function handleStepBFinish(event) {
    stepData = { ...stepData, game: event.detail.game };
    currentStep = 3; // Move to step C
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

  function handleStepDFinish(event) {
    stepData = { ...stepData, gamepass: event.detail.gamepass };
    currentStep = 5; // Move to step Regional
  }

  function handleStepRegionalFinish() {
    currentStep = 6; // Move to step E (Confirm)
  }

  function handleStepEFinish() {
    if (finishFunction) {
      // Use custom finish function if provided (for robux purchases)
      finishFunction(stepData);
    } else {
      // Default behavior: dispatch event for affiliate claims
      dispatch('claim-success', { amount: stepData.robuxAmount });
      open = false;
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

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={{ duration: 150 }}
      class="fixed inset-0 z-[150] bg-[#0C0E16]/80"
    />

    <Dialog.Content
      class={cn(
        'bg-[#131620] overflow-hidden rounded-xl fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 outline-none z-[170] w-full min-[870px]:max-w-[500px] xl:min-w-[400px] max-[869px]:h-full min-[870px]:max-h-[calc(100%-40px)] flex flex-col min-[870px]:flex-row',
        'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        $$props.contentClass
      )}
    >
      <Dialog.Close class="absolute z-10 top-6 right-6">
        <Close class="size-[22px]" strokeWidth={2} />
      </Dialog.Close>
      <div
        class="size-72 bg-[#3BA4F0]/10 blur-[100px] absolute -top-36 -left-36 z-[-1]"
      ></div>

      <div class="relative flex flex-col w-full p-6">
        <StepIndicator {steps} {currentStep} onStepClick={handleStepClick} />

        <div class="mt-6">
          {#if currentStep === 1}
            <StepA on:confirm={handleStepAConfirm} />
          {:else if currentStep === 2}
            <StepB data={stepData} on:finish={handleStepBFinish} />
          {:else if currentStep === 3}
            <StepC
              data={stepData}
              on:finish={() => {
                currentStep = 4;
              }}
            />
          {:else if currentStep === 4}
            <StepD data={stepData} on:finish={handleStepDFinish} />
          {:else if currentStep === 5}
            <StepRegional on:finish={handleStepRegionalFinish} />
          {:else if currentStep === 6}
            <StepE
              data={stepData}
              {finishFunction}
              on:finish={handleStepEFinish}
            />
          {/if}
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
