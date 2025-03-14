<script>
  import { CircleInfo, Support, Basket } from "$icons"
  import { Popover } from "bits-ui"
  import { flyAndScale } from "$lib/utils"
  import { page } from "$app/stores"

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


  const isActive = (matchPath) => {
    return $page.url.pathname.startsWith(matchPath)
  }
</script>

<div class="flex items-center justify-evenly bottom-0 md:translate-y-[72px] fixed h-[72px] bg-[#121620] border-t-2 border-[#1D2535] w-full z-[15] transition-transform pl-[var(--padding-x,0px)] pr-[var(--scrollbar-width,0px)]">
  {#each navLinks as link}
    <svelte:element 
      this={link.onClick ? "button" : "a"}
      on:click={link.onClick}
      href={link.path}
      target={link.target}
      class="flex flex-col items-center gap-1 text-[#809BB5] group" 
      data-selected={link.matchPath && isActive(link.matchPath)}
    >
      <svelte:component this={link.icon} class="size-6 group-data-[selected=true]:text-[#3BA4F0]" />
      <p class="font-semibold leading-none group-data-[selected=true]:text-white">{link.name}</p>
    </svelte:element>
  {/each}
  <Popover.Root>
    <Popover.Trigger class="flex flex-col items-center gap-1 text-[#809BB5] group">
      <CircleInfo class="size-[18px]" />
      <p class="font-semibold leading-none">Tutorial</p>
    </Popover.Trigger>
    <Popover.Content
      class="!w-[170px] rounded-lg bg-[#1D2535] p-2 flex flex-col gap-1 shadow-popover outline-none z-[100]"
      transition={flyAndScale}
      align="center"
      sideOffset={8}
    >
      {#each [
        { value: "EN", label: "English", video: "jijKD1a4GY8" },
        { value: "ES", label: "Español", video: "G6Gl5LOjKeY" }
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
  <slot />
</div>