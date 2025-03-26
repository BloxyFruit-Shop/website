<script>
  import { Basket, CircleInfo, Support } from "$icons"
  import { Popover } from "bits-ui"
  import { flyAndScale } from "$lib/utils"
  import { page } from "$app/stores"
  
  let navSelector
  let navContainer

  const navLinks = [
    {
      name: "Store",
      path: "/store/blox-fruits",
      matchPath: "/store",
      target: "_self",
      icon: Basket
    },
    // {
    //   name: "Tutorial",
    //   path: "https://www.youtube.com/watch?v=G6Gl5LOjKeY",
    //   target: "_blank",
    //   icon: CircleInfo
    // },
    {
      name: "Support",
      onClick: () => {
        window.$crisp.do('chat:open')
      },
      icon: Support
    }
  ]

  function isActive(matchPath) {
    return $page.url.pathname.startsWith(matchPath)
  }

  function updateSelector(element) {
    if (!navSelector || !navContainer || !element) return
    
    const elementRect = element.getBoundingClientRect()
    const parentRect = navContainer.getBoundingClientRect()
    
    const translateX = elementRect.left - parentRect.left
    const newWidth = elementRect.width
    
    navSelector.style.transform = `translateX(${translateX}px)`
    navSelector.style.width = `${newWidth}px`
    navSelector.style.opacity = '1'
  }

  $: {
    if (navContainer) {
      const activeLink = [...navContainer.children].find(
        child => child.dataset.selected === "true"
      )
      if (activeLink) {
        updateSelector(activeLink)
      }
    }
  }
</script>

<div 
  class="flex gap-8 mr-10 text-[#809BB5] font-semibold relative {$$props.class}"
  bind:this={navContainer}
>
  <div 
    class="w-16 h-1 rounded-t-xl absolute bg-[#3BA4F0] -bottom-[27px] shadow-[0_-5px_28px_#3BA4F0] transition-[transform,opacity] opacity-0"
    bind:this={navSelector}
  />
  {#each navLinks as link}
    <svelte:element 
      this={link.onClick ? "button" : "a"}
      href={link.path} 
      class="flex items-center gap-2 data-[selected=true]:text-white" 
      target={link.target}
      data-selected={link.matchPath && isActive(link.matchPath)}
      on:click={(e) => link.onClick ? link.onClick() : link.path ? updateSelector(e.currentTarget) : null}
    >
      <svelte:component this={link.icon} class="size-[18px]" />
      <p class="">{link.name}</p>
    </svelte:element>
  {/each}
  <Popover.Root>
    <Popover.Trigger class="flex items-center gap-2">
      <CircleInfo class="size-[18px]" />
      <p class="">Tutorial</p>
    </Popover.Trigger>
    <Popover.Content
      class="!w-[170px] rounded-lg bg-[#1D2535] p-2 flex flex-col gap-1 shadow-popover outline-none z-[100]"
      transition={flyAndScale}
      align="start"
      sideOffset={8}
    >
      {#each [
        { value: "EN", label: "English", video: "5T7m6wJkM2Y" },
        { value: "ES", label: "Español", video: "8RHDSvYC-ic" }
      ] as language}
        <a href={`https://www.youtube.com/watch?v=${language.video}`} target="_blank" class="flex h-10 w-full text-sm select-none items-center rounded-button py-1.5 px-2.5 outline-none transition-all duration-75 hover:bg-white/10 rounded-md">
          <div class="size-6 mr-1.5">
            <img src="/assets/flags/{language.value}-full.png" alt="Country Flag" class="size-full" />
          </div>
          {language.label}
        </a>
      {/each}
    </Popover.Content>
  </Popover.Root>
</div>