<script>
  import { page } from '$app/stores';
  import { bgBlur } from "$lib/utils";
  import { Games, Users } from "$lib/icons";
  import Logo from "$icons/logo.svelte"
  import UserSection from "$elements/user-section.svelte"

  export let data

  const navItems = [
    { href: "/admin", icon: Games, label: "Dashboard" },
    { href: "/admin/affiliates", icon: Users, label: "Affiliates" },
  ];

  $: currentPath = $page.url.pathname;
</script>

<div class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/landing-background.webp)] bg-no-repeat bg-cover bg-center z-[-1]"></div>
<div class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/background-glow.webp)] opacity-[0.05] bg-no-repeat bg-cover bg-center z-[-1]"></div>

<header class="fixed top-0 left-0 [--padding-x:16px] sm:[--padding-x:24px] md:[--padding-x:40px] flex justify-center items-center w-full h-[80px] border-b-2 border-[#1D2535] z-[100] pl-[var(--padding-x,0px)] pr-[calc(var(--padding-x,0px)+var(--scrollbar-width,0px))]" style="{bgBlur({ color: "#1D242F", opacity: 0.2 })}">
  <div class="w-full flex items-center justify-between max-w-[1440px] mx-auto">
    <div class="flex items-center gap-12">
      <a href="/">
        <Logo class="w-[110px] md:w-[132px]" />
      </a>
    </div>

    <div class="flex items-center gap-4">
      <UserSection data={data} />
    </div>
  </div>
</header>

<div class="flex min-h-[calc(100dvh-80px)] text-white mt-[80px]">
  <aside 
    class="fixed w-64 top-[80px] bottom-0 overflow-y-auto z-10 [--admin-header-height:80px]"
    style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.95 })}"
  >
    <div class="sticky top-0 p-6 flex flex-col min-h-[calc(100dvh-80px)]">
      <div class="flex items-center gap-2 mb-8">
        <h2 class="text-2xl font-bold">Admin Panel</h2>
      </div>

      <nav class="flex-grow">
        <ul class="space-y-2">
          {#each navItems as { href, icon, label }}
            {@const isActive = currentPath === href || (href !== '/admin' && currentPath.startsWith(href))}
            <li>
              <a
                {href}
                class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative group"
                class:active={isActive}
              >
                <svelte:component this={icon} class="size-5 shrink-0" />
                <span class="font-medium">{label}</span>
                
                {#if isActive}
                  <div class="absolute inset-0 bg-[#3BA4F0]/10 rounded-lg"></div>
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#3BA4F0] rounded-r"></div>
                {:else}
                  <div class="absolute inset-0 bg-[#1D2535]/0 group-hover:bg-[#1D2535]/50 rounded-lg transition-colors"></div>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </nav>

      <div class="pt-4 mt-auto border-t border-[#1D2535]">
        <p class="text-sm text-[#809BB5] px-4">Admin v1.0.0</p>
      </div>
    </div>
  </aside>

  <main class="flex-1 ml-64 p-6 min-h-[calc(100dvh-80px)]">
    <slot />
  </main>
</div>

<style>
  .active {
    color: #3BA4F0;
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  aside::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  aside {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
</style>