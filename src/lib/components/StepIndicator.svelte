<script>
    import { Check } from '$lib/icons';
    import { fade, fly, scale } from 'svelte/transition';
    import { quintOut, elasticOut } from 'svelte/easing';

    export let steps = ['Step 1', 'Step 2']; // Array of step labels
    export let currentStep = 1; // Current active step (1-based)
    export let onStepClick = (step) => {}; // Callback for step navigation

    $: isCompleted = (stepIndex) => currentStep > stepIndex + 1;
    $: isActive = (stepIndex) => currentStep === stepIndex + 1;
</script>

<div class="flex flex-col items-center justify-center w-full gap-4 mb-8">
    <div class="flex items-center justify-center w-full gap-2">
    {#each steps as step, index}
        <div class="flex items-center">
            <div class="relative">
                <button
                    on:click={() => onStepClick(index + 1)}
                    class="relative flex items-center justify-center w-8 h-8 transition-all rounded-full cursor-pointer group"
                    class:bg-blue-600={isActive(index) || isCompleted(index)}
                    class:bg-gray-700={!isActive(index) && !isCompleted(index)}
                    class:hover:bg-blue-500={!isActive(index)}
                    in:fly={{ y: -20, duration: 400, delay: index * 200, easing: quintOut }}
                >
                    <div class="absolute inset-0 transition-all duration-300 rounded-full opacity-0 bg-blue-400/20 group-hover:opacity-100 group-hover:scale-150 blur-sm"></div>
                    
                    {#if isCompleted(index)}
                        <div in:scale={{ duration: 800, easing: elasticOut }}>
                            <Check class="text-white size-4" strokeWidth="4" />
                        </div>
                    {:else}
                        <span 
                            class="text-sm font-medium text-white"
                            in:fade={{ duration: 200 }}
                        >
                            {index + 1}
                        </span>
                    {/if}
                </button>
                <span 
                    class="absolute mt-2 text-xs text-center transition-all duration-300 -translate-x-1/2 translate-y-1/2 -bottom-[calc(50%+8px)] left-1/2"
                    class:text-blue-400={isActive(index)}
                    class:text-white={isCompleted(index)}
                    class:text-gray-500={!isActive(index) && !isCompleted(index)}
                    in:fly={{ y: 20, duration: 400, delay: (index * 200) + 200, easing: quintOut }}
                >
                    {step}
                </span>
            </div>

            {#if index < steps.length - 1}
                <div 
                    class="w-8 h-[2px] ml-2 transition-all duration-500"
                    class:bg-blue-600={currentStep > index + 1}
                    class:bg-gray-700={currentStep <= index + 1}
                    in:fly={{ x: 20, duration: 400, delay: (index * 200) + 100, easing: quintOut }}
                />
            {/if}
        </div>
    {/each}
    </div>
</div>
