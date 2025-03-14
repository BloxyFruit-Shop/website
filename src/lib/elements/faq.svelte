<script>
  import { Accordion } from "bits-ui"
  import { CaretDown } from "$icons"
  import { slide } from "svelte/transition"
  import { languageStore } from "$lib/utils/stores"
  import translations from "$lib/utils/translations"
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'

  const questions = translations[$languageStore].faq

  let faqCategory = Object.keys(questions)[0]
  let categorySelector
  let categoryContainer

  function updateCategorySelector(element) {
    if (!categorySelector || !categoryContainer || !element) return
    
    const elementRect = element.getBoundingClientRect()
    const parentRect = categoryContainer.getBoundingClientRect()

    const translateX = elementRect.left - parentRect.left
    const newWidth = elementRect.width

    categorySelector.style.transform = `translateX(${translateX}px)`
    categorySelector.style.width = `${newWidth}px`
    categorySelector.style.opacity = '1'
  }

  // Debounce function to limit resize calculations
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Handle resize with debouncing
  const handleResize = debounce(() => {
    const activeButton = [...categoryContainer?.children || []].find(
      child => child.dataset.selected === "true"
    )
    if (activeButton) {
      updateCategorySelector(activeButton)
    }
  }, 100) // 100ms debounce

  onMount(() => {
    window.addEventListener('resize', handleResize)
  })

  onDestroy(() => {
    if (browser) {
      window?.removeEventListener('resize', handleResize)
    }
  })

  $: {
    if (categoryContainer) {
      const activeButton = [...categoryContainer.children].find(
        child => child.dataset.selected === "true"
      )
      if (activeButton) {
        updateCategorySelector(activeButton)
      }
    }
  }
</script>

<div class="flex bg-[#111A28] rounded-xl w-full text-[#809BB5] font-semibold my-7 overflow-hidden relative" bind:this={categoryContainer}>
  <div 
    class="!w-1/2 h-1 rounded-t-xl absolute bg-[#3BA4F0] bottom-0 shadow-[0_-5px_28px_#3BA4F0] transition-[transform,opacity] opacity-0" 
    bind:this={categorySelector}
  />
  {#each Object.keys(questions) as category}
    <button
      class="flex-1 py-4 transition-colors duration-300 {category === faqCategory ? 'bg-[#3BA4F0]/10 text-[#3BA4F0]' : ''}"
      on:click={() => {
        faqCategory = category
        updateCategorySelector(event.currentTarget)
      }}
      data-selected={category === faqCategory}
    >
      {category}
    </button>
  {/each}
</div>

<Accordion.Root class="flex max-md:flex-col w-full gap-4" multiple id="faq">
  {#each [Math.ceil(questions[faqCategory].length / 2), Math.floor(questions[faqCategory].length / 2)] as columns, i}
    <div class="flex flex-col flex-1 gap-4">
      {#each questions[faqCategory].slice(i * columns, (i * columns) + columns) as question, j}
        <Accordion.Item 
          value={`${i}${j}`}
          class="p-3 rounded-xl w-full h-min" 
          style="background: linear-gradient(95deg, #162030 0%, rgba(17, 26, 40, 0.36) 50%, #111A28 100%);"
        >
          <Accordion.Trigger class="[&[data-state=open]>svg]:rotate-180 flex justify-between items-center relative w-full p-2.5 rounded-lg after:content-empty after:left-0 after:right-0 after:top-0 after:bottom-0 after:mix-blend-overlay after:bg-white/45 after:absolute after:rounded-lg">
            <p class="font-medium">
              {question.content}
            </p>
            <CaretDown class="size-[18px] transition-all duration-200" />
          </Accordion.Trigger>
          <Accordion.Content
            transition={slide}
            transitionConfig={{ duration: 200 }}
            class="px-2 text-[#809BB5] font-medium"
          >
            <div class="h-3"></div>
            {question.answer}
          </Accordion.Content>
        </Accordion.Item>
      {/each}
    </div>
  {/each}
</Accordion.Root>
