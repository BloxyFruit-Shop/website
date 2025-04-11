<script>
  import { page } from '$app/stores';
  import { bgBlur } from "$lib/utils";
  import { fade, fly, slide } from "svelte/transition";
  import { Games, Users, Robux, Hamburger, Close } from "$lib/icons";
  import Logo from "$icons/logo.svelte"
  import UserSection from "$elements/user-section.svelte"
  import { quintOut } from 'svelte/easing';

  export let data

  let isMobileMenuOpen = false;

  const navItems = [
    { href: "/admin", icon: Games, label: "Dashboard" },
    { href: "/admin/affiliates", icon: Users, label: "Affiliates" },
    { href: "/admin/claims", icon: Robux, label: "Claims" },
  ];

  $: currentPath = $page.url.pathname;

  // Close mobile menu when route changes
  $: if ($page) {
    isMobileMenuOpen = false;
  }
</script>

<div class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/landing-background.webp)] bg-no-repeat bg-cover bg-center z-[-1]"
     in:fade={{ duration: 1000 }}></div>
<div class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/background-glow.webp)] opacity-[0.05] bg-no-repeat bg-cover bg-center z-[-1]"
     in:fade={{ duration: 1000, delay: 200 }}></div>

<header class="fixed top-0 left-0 [--padding-x:16px] sm:[--padding-x:24px] md:[--padding-x:40px] flex justify-center items-center w-full h-[80px] border-b-2 border-[#1D2535] z-[100] pl-[var(--padding-x,0px)] pr-[calc(var(--padding-x,0px)+var(--scrollbar-width,0px))]" 
        style="{bgBlur({ color: "#1D242F", opacity: 0.2 })}"
        in:fly={{ y: -20, duration: 400, delay: 100 }}>
  <div class="w-full flex items-center justify-between max-w-[1440px] mx-auto">
    <div class="flex items-center gap-12"
         in:slide={{ duration: 400, delay: 200 }}>
      <a href="/"
         in:fade={{ duration: 300, delay: 300 }}>
        <Logo class="w-[110px] md:w-[132px]" />
      </a>
    </div>

    <div class="flex items-center gap-4"
         in:slide={{ x: 20, duration: 400, delay: 200 }}>
      <UserSection data={data} />
      <!-- Mobile menu button -->
      <button
        class="lg:hidden p-2 rounded-lg hover:bg-[#1D2535]/50 transition-colors"
        on:click={() => isMobileMenuOpen = !isMobileMenuOpen}
        aria-label="Toggle menu"
      >
        {#if isMobileMenuOpen}
          <Close class="size-6" />
        {:else}
          <Hamburger class="size-6" />
        {/if}
      </button>
    </div>
  </div>
</header>

<div class="flex min-h-[calc(100dvh-80px)] text-white mt-[80px]">
  <!-- Desktop Sidebar -->
  <aside 
    class="fixed hidden lg:block w-64 top-[80px] bottom-0 overflow-y-auto z-10 [--admin-header-height:80px]"
    style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.95 })}"
    in:fly={{ x: -20, duration: 400, delay: 300 }}
  >
    <div class="sticky top-0 p-6 flex flex-col min-h-[calc(100dvh-80px)]">
      <div class="flex items-center gap-2 mb-8"
           in:slide={{ duration: 400, delay: 400 }}>
        <h2 class="text-2xl font-bold">Admin Panel</h2>
      </div>

      <nav class="flex-grow">
        <ul class="space-y-2">
          {#each navItems as { href, icon, label }, i}
            {@const isActive = currentPath === href || (href !== '/admin' && currentPath.startsWith(href))}
            <li in:fly|local={{ 
              x: -20, 
              duration: 400, 
              delay: 500 + (i * 100),
              easing: quintOut
            }}>
              <a
                {href}
                class="relative flex items-center gap-3 px-4 py-3 transition-colors rounded-lg group"
                class:active={isActive}
              >
                <svelte:component this={icon} class="size-5 shrink-0" />
                <span class="font-medium">{label}</span>
                
                {#if isActive}
                  <div class="absolute inset-0 bg-[#3BA4F0]/10 rounded-lg"
                       in:fade|local={{ duration: 200 }}></div>
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#3BA4F0] rounded-r"
                       in:slide|local={{ duration: 200 }}></div>
                {:else}
                  <div class="absolute inset-0 bg-[#1D2535]/0 group-hover:bg-[#1D2535]/50 rounded-lg transition-colors"></div>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </nav>

      <div class="pt-4 mt-auto border-t border-[#1D2535]"
           in:fade={{ duration: 400, delay: 800 }}>
        <p class="text-sm text-[#809BB5] px-4">Admin v1.0.0</p>
      </div>
    </div>
  </aside>

  <!-- Mobile Navigation Overlay -->
  {#if isMobileMenuOpen}
    <div
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      on:click={() => isMobileMenuOpen = false}
      on:keydown={(event) => {
        if (event.key === 'Enter') {
          isMobileMenuOpen = false;
        }
      }}
      transition:fade={{ duration: 200 }}
    ></div>
  {/if}

  <!-- Mobile Navigation Menu -->
  <aside
    class="fixed lg:hidden {isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} top-[80px] bottom-0 w-64 z-50 transition-transform duration-300 ease-in-out"
    style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.95 })}"
  >
    <div class="flex flex-col h-full p-6">
      <div class="flex items-center gap-2 mb-8">
        <h2 class="text-2xl font-bold">Admin Panel</h2>
      </div>

      <nav class="flex-grow">
        <ul class="space-y-2">
          {#each navItems as { href, icon, label }, i}
            {@const isActive = currentPath === href || (href !== '/admin' && currentPath.startsWith(href))}
            <li>
              <a
                {href}
                class="relative flex items-center gap-3 px-4 py-3 transition-colors rounded-lg group"
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

  <main class="flex-1 lg:ml-64 sm:p-6 min-h-[calc(100dvh-80px)]">
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