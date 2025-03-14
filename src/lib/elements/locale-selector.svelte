<script>
  import { languageStore, currencyStore, currencyRateStore } from "$lib/utils/stores"
  import { currencies as currenciesObject, languages as languagesObject, flyAndScale } from "$lib/utils"
  import { Select } from "bits-ui"
  import { Check, ArrowDown } from "$icons"

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

  $: $currencyStore = currency.value
  $: $languageStore = language.value
</script>

<div class="flex gap-1 h-[46px]">
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
      <ArrowDown class="size-5 ml-1 transition-transform group-aria-expanded:rotate-180" strokeWidth={2} />
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