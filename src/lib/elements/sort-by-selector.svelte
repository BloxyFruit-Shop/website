<script>
  import { Select } from "bits-ui"
  import { ArrowDown, Check } from "$icons"
  import { flyAndScale } from "$lib/utils"

  const sortingOptions = [
    {
      value: "popularity",
      label: "Popularity"
    },
    {
      value: "ascending",
      label: "High - Low"
    },
    {
      value: "descending",
      label: "Low - High"
    } 
  ]

  export let sortBy
</script>

<Select.Root items={sortingOptions} bind:selected={sortBy}>
  <Select.Trigger
    class="bg-[#1D2535] rounded-r-lg flex items-center px-2.5 font-semibold text-sm"
  >
    <Select.Value class=""/>
    <ArrowDown class="size-5 ml-1 transition-transform" strokeWidth={2} />
  </Select.Trigger>
  <Select.Content
    class="!w-[150px] rounded-lg bg-[#1D2535] px-0.5 py-[3px] shadow-popover outline-none z-50 scrollbar-track-transparent scrollbar-color scrollbar-thumb-slate-600 scrollbar-thumb-ro"
    transition={flyAndScale}
    align="end"
    sideOffset={8}
  >
    <div class="px-1 py-1 max-h-[calc(min(100dvh-160px,300px))] overflow-y-auto">
      {#each sortingOptions as option}
        <Select.Item
          class="flex h-10 w-full font-medium select-none items-center rounded-button py-2.5 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-white/10 rounded-md"
          value={option.value}
          label={option.label}
        >
          {option.label}
          <Select.ItemIndicator class="ml-auto" asChild={false}>
            <Check class="size-4" strokeWidth={2.5}/>
          </Select.ItemIndicator>
        </Select.Item>
      {/each}
    </div>
  </Select.Content>
</Select.Root>