<script>
    import { Check } from '$lib/icons';

    export let steps = ['Step 1', 'Step 2']; // Array of step labels
    export let currentStep = 1; // Current active step (1-based)
    export let onStepClick = (step) => {}; // Callback for step navigation

    $: isCompleted = (stepIndex) => currentStep > stepIndex + 1;
    $: isActive = (stepIndex) => currentStep === stepIndex + 1;
</script>

<div class="flex items-center justify-center w-full gap-3 mb-8">
    {#each steps as step, index}
        <!-- Step container -->
        <div class="flex items-center">
            <!-- Circle with number or checkmark -->
            <button
                on:click={() => onStepClick(index + 1)}
                class="relative flex items-center justify-center w-8 h-8 transition-all rounded-full cursor-pointer group"
                class:bg-blue-600={isActive(index) || isCompleted(index)}
                class:bg-gray-700={!isActive(index) && !isCompleted(index)}
                class:hover:bg-blue-500={!isActive(index)}
            >
                {#if isCompleted(index)}
                    <Check class="text-white size-4" strokeWidth="3" />
                {:else}
                    <span class="text-sm font-medium text-white">{index + 1}</span>
                {/if}
            </button>

            <!-- Connector line -->
            {#if index < steps.length - 1}
                <div 
                    class="w-12 h-[2px] mx-2 transition-all"
                    class:bg-blue-600={currentStep > index + 1}
                    class:bg-gray-700={currentStep <= index + 1}
                />
            {/if}
        </div>
    {/each}
</div>