<script>
  import { onMount, onDestroy } from "svelte";
  import { languageStore, currencyStore, currencyRateStore } from "$lib/utils/stores"
  import { currencies as currenciesObject, languages as languagesObject, flyAndScale } from "$lib/utils"
  import { Select } from "bits-ui"
  import { Check, ArrowDown, Gear } from "$icons"
  import { browser } from "$app/environment"

  const currencies = Object.keys(currenciesObject).map(key => ({
    value: key,
    label: key,
    name: currenciesObject[key].name,
    symbol: currenciesObject[key].symbol
  }))

  const languages = Object.keys(languagesObject).map(key => ({
    value: key,
    label: key,
    name: languagesObject[key].name
  }))

  export let initialLanguage
  export let initialCurrency

  let currency = currencies.find(currency => currency.value == initialCurrency)
  let language = languages.find(language => language.value == initialLanguage)

  $: $currencyStore = currency?.value
  $: $languageStore = language?.value

  // Mobile dropdown state and handlers
  let open = false;
  let view = "root"; // "root" | "language" | "currency"
  let container;

  function toggle() {
    open = !open;
    if (open) view = "root";
  }
  const toRoot = () => (view = "root");
  const toLanguage = () => (view = "language");
  const toCurrency = () => (view = "currency");

  function isInside(e) {
    const path = typeof e.composedPath === "function" ? e.composedPath() : [];
    return (path && path.includes(container)) || (container && container.contains(e.target));
  }
  function onDocClick(e) {
    if (open && !isInside(e)) {
      open = false;
      view = "root";
    }
  }
  function onKey(e) {
    if (e.key === "Escape") {
      open = false;
      view = "root";
    }
  }
  onMount(() => {
    if (!browser) return;
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
  });
  onDestroy(() => {
    if (!browser) return;
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onKey);
  });

  async function setCurrency(code) {
    try {
      const res = await fetch(`/api/currency?from=EUR&to=${code}`);
      const data = await res.json();
      currency = currencies.find(c => c.value === code) || currency;
      $currencyStore = code;
      $currencyRateStore = data.rate;
    } catch (err) {
      console.error("Failed to update currency rate", err);
      currency = currencies.find(c => c.value === code) || currency;
      $currencyStore = code;
    } finally {
      open = false;
      view = "root";
    }
  }

  function setLanguage(code) {
    language = languages.find(l => l.value === code) || language;
    $languageStore = code;
    open = false;
    view = "root";
  }
</script>

<div class="gap-1 h-[46px] hidden md:flex">
  <Select.Root items={languages} bind:selected={language}>
    <Select.Trigger
      class="bg-[#1D2535] rounded-l-lg flex items-center px-2.5 font-semibold text-sm"
    >
      <div class="size-6 md:size-7">
        <img src="/assets/flags/{$languageStore}.png" class="size-full" />
      </div>
    </Select.Trigger>
    <Select.Content
      class="!w-[170px] rounded-lg bg-[#1D2535] px-0.5 py-[3px] shadow-popover outline-none z-[100]"
      transition={flyAndScale}
      align="end"
      sideOffset={8}
    >
      <div class="px-1 py-1 max-h-[calc(min(100dvh-160px,300px))] overflow-y-auto">
        {#each languages as language}
          <Select.Item
            class="flex h-10 w-full text-sm select-none items-center rounded-button py-1.5 px-2.5 outline-none transition-all duration-75 data-[highlighted]:bg-white/10 rounded-md"
            value={language.value}
            label={language.label}
          >
            <div class="size-6 mr-1.5">
              <img src="/assets/flags/{language.value}-full.png" alt="Country Flag" class="size-full" />
            </div>
            {language.name}
            <Select.ItemIndicator class="ml-auto" asChild={false}>
              <Check class="size-4" strokeWidth={2.5}/>
            </Select.ItemIndicator>
          </Select.Item>
        {/each}
      </div>
    </Select.Content>
  </Select.Root>
  <Select.Root items={currencies} selected={currency} onSelectedChange={(newCurrency) => {
    fetch(`/api/currency?from=EUR&to=${newCurrency.value}`).then(response => response.json()).then((data) => {
      currency = newCurrency
      $currencyRateStore = data.rate
    })
  }}>
    <Select.Trigger
      class="bg-[#1D2535] rounded-r-lg flex items-center px-2.5 font-semibold text-sm group"
    >
      <Select.Value class=""/>
      <ArrowDown class="ml-1 transition-transform size-5 group-aria-expanded:rotate-180" strokeWidth={2} />
    </Select.Trigger>
    <Select.Content
      class="!w-[220px] rounded-lg bg-[#1D2535] px-0.5 py-[3px] shadow-popover outline-none z-[100]"
      transition={flyAndScale}
      align="end"
      sideOffset={8}
    >
      <div class="px-1 py-1 max-h-[calc(min(100dvh-160px,300px))] overflow-y-auto">
        {#each currencies as currency}
          <Select.Item
            class="flex h-10 w-full select-none items-center rounded-button py-2.5 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-white/10 rounded-md"
            value={currency.value}
            label={currency.label}
          >
            {currency.name} ({currency.symbol})
            <Select.ItemIndicator class="ml-auto" asChild={false}>
              <Check class="size-4" strokeWidth={2.5}/>
            </Select.ItemIndicator>
          </Select.Item>
        {/each}
      </div>
    </Select.Content>
  </Select.Root>
</div>

<!-- Mobile config dropdown-->
<div class="relative md:hidden" bind:this={container}>
  <button
    class="bg-[#1D2535] rounded-lg size-[46px] flex items-center justify-center active:scale-[0.97] transition-transform"
    aria-haspopup="menu"
    aria-expanded={open}
    type="button"
    on:click|stopPropagation={toggle}
  >
    <Gear class="size-[22px] text-white" />
  </button>

  {#if open}
    <div
      class="absolute right-0 mt-2 w-[260px] rounded-lg bg-[#1D2535] p-1 shadow-popover outline-none z-[200]"
      transition:flyAndScale={{ y: 6, start: 0.96, duration: 140 }}
      role="menu"
    >
      {#if view === "root"}
        <button
          class="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm hover:bg-white/10 transition-colors"
          on:click|stopPropagation={toLanguage}
          role="menuitem"
          type="button"
        >
          <div class="flex items-center gap-2">
            <span>Language</span>
          </div>
          <div class="flex items-center gap-2 opacity-80">
            <img src="/assets/flags/{$languageStore}.png" alt="flag" class="rounded-sm size-5" />
            <ArrowDown class="-rotate-90 size-4" />
          </div>
        </button>
        <button
          class="mt-0.5 flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm hover:bg-white/10 transition-colors"
          on:click|stopPropagation={toCurrency}
          role="menuitem"
          type="button"
        >
          <div class="flex items-center gap-2">
            <span>Currency</span>
          </div>
          <div class="flex items-center gap-2 opacity-80">
            <span class="text-[#809BB5] text-xs font-mono">{$currencyStore}</span>
            <ArrowDown class="-rotate-90 size-4" />
          </div>
        </button>
      {:else if view === "language"}
        <div class="flex items-center gap-2 px-1.5 py-1.5">
          <button class="text-[#809BB5] text-xs hover:text-white transition-colors" on:click|stopPropagation={toRoot} type="button">← Back</button>
          <p class="text-sm font-semibold">Language</p>
        </div>
        <div class="max-h-[calc(min(100dvh-160px,300px))] overflow-y-auto px-1 pb-1">
          {#each languages as lang}
            <button
              class="flex h-10 w-full items-center rounded-md px-2.5 text-sm hover:bg-white/10 transition-colors"
              on:click|stopPropagation={() => setLanguage(lang.value)}
              type="button"
            >
              <div class="mr-2 size-6">
                <img src="/assets/flags/{lang.value}-full.png" alt="{lang.name}" class="size-full" />
              </div>
              <span>{lang.name}</span>
              {#if $languageStore === lang.value}
                <Check class="ml-auto size-4" strokeWidth={2.5} />
              {/if}
            </button>
          {/each}
        </div>
      {:else if view === "currency"}
        <div class="flex items-center gap-2 px-1.5 py-1.5">
          <button class="text-[#809BB5] text-xs hover:text-white transition-colors" on:click|stopPropagation={toRoot} type="button">← Back</button>
          <p class="text-sm font-semibold">Currency</p>
        </div>
        <div class="max-h-[calc(min(100dvh-160px,300px))] overflow-y-auto px-1 pb-1">
          {#each currencies as curr}
            <button
              class="flex h-10 w-full items-center rounded-md pl-3 pr-2.5 text-sm hover:bg-white/10 transition-colors"
              on:click|stopPropagation={() => setCurrency(curr.value)}
              type="button"
            >
              <span>{curr.name} ({curr.symbol})</span>
              {#if $currencyStore === curr.value}
                <Check class="ml-auto size-4" strokeWidth={2.5} />
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>