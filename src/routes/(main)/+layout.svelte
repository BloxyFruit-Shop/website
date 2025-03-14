<script>
  import { bgBlur, currencies as currenciesObject, languages as languagesObject, alpha } from "$lib/utils"
  import Mastercard from "$icons/payment-methods/mastercard.svelte"
  import Button from "$components/Button.svelte"
  import Discord from "$icons/discord.svelte"
  import Maestro from "$icons/payment-methods/maestro.svelte"
  import Paypal from "$icons/payment-methods/paypal.svelte"
  import Visa from "$icons/payment-methods/visa.svelte"
  import { languageStore } from "$lib/utils/stores"
  import Logo from "$icons/logo.svelte"
  import LocaleSelector from "$elements/locale-selector.svelte"
  import UserSection from "$elements/user-section.svelte"
  import NavLinks from "$elements/nav-links.svelte"
  import { page } from "$app/stores"
  import MobileNavbar from "$elements/mobile-navbar.svelte"
  import translations from "$lib/utils/translations"

  export let data
</script>

<MobileNavbar />

<header class="fixed top-0 left-0 [--padding-x:16px] sm:[--padding-x:24px] md:[--padding-x:40px] flex justify-center items-center w-full h-[80px] border-b-2 border-[#1D2535] z-[100] pl-[var(--padding-x,0px)] pr-[calc(var(--padding-x,0px)+var(--scrollbar-width,0px))]" style="{bgBlur({ color: "#1D242F", opacity: 0.2 })}">
  <div class="w-full flex items-center justify-between max-w-[1440px] mx-auto">
    <div class="flex items-center gap-12">
      <a href="/">
        <Logo class="w-[110px] md:w-[132px]" />
      </a>
      <NavLinks class="hidden md:flex" />
    </div>

    <div class="flex items-center gap-4">
    
      <Button class="bg-[#7289DA]/65 hover:bg-[#7289DA]/75 size-[46px]" to="https://discord.gg/bloxyfruit" target="_blank">
        <Discord class="size-[22px] text-white" />
      </Button>
      <LocaleSelector initialLanguage={data.lang} initialCurrency={data.curr} />
      <UserSection data={data} />
    </div>
  </div>
</header>

<slot />

<!-- {#if $page.url.pathname == "/"} -->
<footer class="flex justify-center py-12 relative px-6 max-md:pb-[120px]">
  {#if $page.url.pathname == "/"}
    <div class="absolute top-0 left-0 bottom-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16fc,#0c0e16f2),url(/assets/landing-background.webp)] bg-no-repeat bg-cover bg-bottom z-[-1]"></div>
    <div class="absolute top-0 left-0 bottom-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16fc,#0c0e16f2),url(/assets/background-glow.webp)] opacity-[0.05] bg-no-repeat bg-cover bg-center z-[-1]"></div>
  {/if}

  <div class="max-w-[1440px] w-full flex flex-col">
    {#if $page.url.pathname == "/"}
      <div class="flex-col md:flex-row flex items-center md:items-start justify-between gap-6">
        <div class="flex flex-col gap-3">
          <div class="flex items-center">
            <Logo class="w-[140px]" />
          </div>

          <p class="text-[#809BB5] max-w-[640px] font-medium max-md:hidden">{translations[$languageStore].footer1}</p>
          <p class="text-[#809BB5] max-w-[640px] font-medium max-md:hidden">{translations[$languageStore].footer2}</p>
        </div>

        <div class="flex gap-3 md:gap-10">
          <div class="flex flex-col gap-1.5 md:gap-3">
            <p class="font-bold mb-1.5 md:mb-0">{translations[$languageStore].socialMedia}</p>
            <a class="text-[#809BB5] font-medium transition-colors underline decoration-transparent hover:decoration-[#809BB5]/85" href="https://discord.gg/bloxyfruit">Discord</a>
            <a class="text-[#809BB5] font-medium transition-colors underline decoration-transparent hover:decoration-[#809BB5]/85" href="https://www.youtube.com/@sepi1">TikTok</a>
            <a class="text-[#809BB5] font-medium transition-colors underline decoration-transparent hover:decoration-[#809BB5]/85" href="https://www.youtube.com/@sepi1">YouTube</a>
          </div>
          
          <div class="flex flex-col gap-1.5 md:gap-3">
            <p class="font-bold mb-1.5 md:mb-0">{translations[$languageStore].support}</p>
            <a class="text-[#809BB5] font-medium transition-colors underline decoration-transparent hover:decoration-[#809BB5]/85" href="mailto:support@bloxyfruit.com">{translations[$languageStore].contactUs}</a>
            <a class="text-[#809BB5] font-medium transition-colors underline decoration-transparent hover:decoration-[#809BB5]/85" href="/faq">FAQ</a>
            <button class="text-[#809BB5] font-medium text-left transition-colors underline decoration-transparent hover:decoration-[#809BB5]/85" on:click={() => {
              window.$crisp.do('chat:open')
            }}>Live Chat</button>
          </div>
    
          <div class="flex flex-col gap-1.5 md:gap-3">
            <p class="font-bold mb-1.5 md:mb-0">Legal</p>
            <a class="text-[#809BB5] font-medium transition-colors underline decoration-transparent hover:decoration-[#809BB5]/85" href="/tos">{translations[$languageStore].termsOfService}</a>
            <a class="text-[#809BB5] font-medium transition-colors underline decoration-transparent hover:decoration-[#809BB5]/85" href="/privacy-policy">{translations[$languageStore].privacyPolicy}</a>
            <!-- <a class="text-[#809BB5] font-medium transition-colors underline decoration-transparent hover:decoration-[#809BB5]/85" href="/refund-policy">{translations[$languageStore].refundPolicy}</a> -->
          </div>
        </div>
      </div>
    {/if}
    
    <div class="h-0.5 w-full bg-[#809BB5]/10 my-6 rounded-full"></div>
    <div class="flex-col md:flex-row flex items-center md:items-start justify-between gap-3">
      <p class="text-[#809BB5] font-medium">BloxFruit © 2024, All Rights Reserved</p>
      <div class="flex gap-4">
        <div class="bg-white rounded-lg w-[54px] h-[32px] flex items-center justify-center">
          <Mastercard class="size-10" />
        </div>
        <div class="bg-white rounded-lg w-[54px] h-[32px] flex items-center justify-center">
          <Maestro class="size-10" />
        </div>
        <div class="bg-white rounded-lg w-[54px] h-[32px] flex items-center justify-center">
          <Paypal class="size-[50px]" />
        </div>
        <div class="bg-white rounded-lg w-[54px] h-[32px] flex items-center justify-center">
          <Visa class="size-10" />
        </div>
      </div>
    </div>
  </div>
</footer>
<!-- {/if} -->