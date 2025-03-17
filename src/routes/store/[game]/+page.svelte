<script>
  import { Search, Options, Basket, Check, Filters, ArrowDown, Games, Close, ArrowRight, OptionsFill, Tag, PriceTag, ShoppingCart, Mastercard, Maestro, Paypal, Visa, CirlceIlustration, Logo, Fire } from "$icons"
  import Button from "$components/Button.svelte"
  import WholeItem from "$components/WholeItem.svelte"
  import { page } from "$app/stores"
  import { Select, Accordion, Slider, Combobox } from "bits-ui"
  import { filterAndSortCategories, flyAndScale, formatCurrency, formatNumber, currencies as currenciesObject, languages as languagesObject, alpha, categorizeProducts } from "$lib/utils"
  import { fly, slide } from "svelte/transition"
  import localstorage from "$lib/utils/localstorage"
  import CartItem from "$components/CartItem.svelte"
  import LocaleSelector from "$elements/locale-selector.svelte"
  import NavLinks from "$elements/nav-links.svelte"
  import { currencyStore, currencyRateStore } from "$lib/utils/stores"
  import pluralize from "pluralize"
  import { onMount } from "svelte"
  import UserSection from "$elements/user-section.svelte"
  import { enhance } from "$app/forms"
  import { lazyLoad } from "$lib/utils"
  import rarityColors from "$lib/utils/colors"
  import games from "$lib/utils/games"
  import Modal from "$lib/modals/index.svelte"
  import { writable } from "svelte/store"
  import MobileNavbar from "$elements/mobile-navbar.svelte"
  import SortBySelector from "$lib/elements/sort-by-selector.svelte"

  export let data

  let priceRange = [0, 100]

  $: rarities = games[data.game.internalName].rarities.map(rarity => ({
    name: rarity.name,
    color: rarity.color,
    enabled: true
  }))

  $: currency = currenciesObject[$currencyStore]
  const cart = localstorage("cart", {})

  let cartProducts = []

  onMount(() => {
    if(!$cart?.products || $cart?.products?.length <= 0 || data?.game?.internalName === $cart?.game) return

    fetch(`/api/products?game=${$cart.game}&variantIds=${$cart.products.map(item => item.variantId.replace("gid://shopify/ProductVariant/", "")).join(',')}`)
      .then(response => response.json())
      .then(fetchedProducts => {
        cartProducts = $cart.products.map(cartItem => {
          const product = fetchedProducts.find(p => p.variantId === cartItem.variantId)
          return {
            ...cartItem,
            title: product ? product.title : "Unknown",
            image: product ? product.image : "",
            price: product ? product.price : 0,
            inStock: product ? product.inStock : false,
            ...(product && product.comparePrice ? { comparePrice: product.comparePrice } : {})
          }
        })
      })
      .catch(error => {
        console.error("Error fetching products:", error);
      })
  })

  $: if (Array.isArray($cart.products)) {
    cartProducts = $cart.products.map(cartItem => {
      let product

      if (data.game.internalName === $cart.game) {
        product = data.game.products.find(p => p.variantId === cartItem.variantId)
      } else {
        const existingProduct = cartProducts.find(p => p.variantId === cartItem.variantId)
        product = existingProduct ? existingProduct : { title: "Unknown", image: "", price: 0, inStock: false }
      }

      return {
        ...cartItem,
        title: product.title,
        image: product.image,
        price: product.price,
        inStock: product.inStock,
        ...(product.comparePrice ? { comparePrice: product.comparePrice } : {}),
        quantity: cartItem.quantity
      }
    })
  }

  $: cartPrice = cartProducts.reduce((total, item) => total + (item.price * item.amount), 0)

  let searchQuery = ""
  let sortBy = {
    value: "popularity",
    label: "Popularity"
  }

  $: categories = [ "Best Sellers", ...data.game.order ]
  $: categorizedProducts = categorizeProducts(data.game.products, data.game.order)

  let cartIsAtTop = true, cartIsAtBottom = false
  let filteredCategories

  let scrollContainer
  const activeCategory = writable("Best Sellers")

  const handleCategorySelector = () => {
    if (!scrollContainer) return

    const headerHeight = 0
    const containerRect = scrollContainer.getBoundingClientRect()
    
    const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 1
    
    if (isAtBottom) {
      $activeCategory = categories.findLast(category => filteredCategories[category]?.length > 0)
      return
    }

    let foundCategory = null
    for (const category of categories) {
      const isDisabled = !filteredCategories[category]?.length > 0
      const categoryElement = document.getElementById(`${category}-category`)
      if (categoryElement && !isDisabled) {
        const rect = categoryElement.getBoundingClientRect()

        if (containerRect.y - rect.y >= headerHeight) {
          foundCategory = category
        }
      }
    }

    if(!foundCategory) {
      $activeCategory = categories.findLast(category => filteredCategories[category]?.length > 0)
    } else {
      $activeCategory = foundCategory
    }
  }

  let categorySelector

  const repositionCategorySelector = (category) => {
    if(!categorySelector) return
    
    const element = document.getElementById(`${category}-tab`)
    if (!element) return

    const elementRect = element.getBoundingClientRect()
    const parentRect = categorySelector.parentElement.getBoundingClientRect()

    const translateX = elementRect.left - parentRect.left - 16 // 16 is for padding 4
    const newWidth = elementRect.width

    categorySelector.style.transform = `translateX(${translateX}px)`
    categorySelector.style.width = `${newWidth}px`
  }

  activeCategory.subscribe(repositionCategorySelector)

  let submittingCheckout
  let multipleGamesOpen
  let permanentFruitPresent
  let mobileCartOpen, mobileFiltersOpen
  let desktopCartOpen
  let askBeforeBuyModal

  let game = { value: data.game.internalName, label: data.game.shortName }

  let prevCartLength = 0
  let shouldAnimate = false

  $: if ($cart?.products) {
    if ($cart.products.length !== prevCartLength) {
      shouldAnimate = true;
      setTimeout(() => shouldAnimate = false, 300)
      prevCartLength = $cart.products.length
    }
  }

  $: searchResults = data.game.products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  )

  function handleSelect(item) {
    searchQuery = item.value
    if (!item.value) return
    const element = document.getElementById(item.value)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  $: {
    filteredCategories = filterAndSortCategories(searchQuery, categorizedProducts, priceRange[0], priceRange[1], rarities, sortBy.value)
    
    handleCategorySelector()
  }

  $: if(categorySelector) {
    categorySelector.style.opacity = "1"
    repositionCategorySelector($activeCategory)
  }

  let searchExpanded = false

  $: allItems = Object.values(filteredCategories).flat()
</script>

<svelte:head>
  <title>BloxyFruit - {data.game.name} Items with Cheap Prices & Fast Delivery!</title>
  <meta property="og:title" content="BloxyFruit - {data.game.name} Items with Cheap Prices & Fast Delivery!" />
  <meta property="twitter:title" content="BloxyFruit - {data.game.name} Items with Cheap Prices & Fast Delivery!" />
  <meta name="description" content="Discover unbeatable deals on {data.game.name} items at BloxyFruit! From the cheapest {data.game.name} items to rare Anime Vanguards, Rivals, and Pets Go items, we offer cheap prices, fast delivery, and trusted service. Get your dream items at the best prices today!" />
  <meta property="og:description" content="Discover unbeatable deals on {data.game.name} items at BloxyFruit! From the cheapest {data.game.name} items to rare Anime Vanguards, Rivals, and Pets Go items, we offer cheap prices, fast delivery, and trusted service. Get your dream items at the best prices today!" />
  <meta property="twitter:description" content="Discover unbeatable deals on {data.game.name} items at BloxyFruit! From the cheapest {data.game.name} items to rare Anime Vanguards, Rivals, and Pets Go items, we offer cheap prices, fast delivery, and trusted service. Get your dream items at the best prices today!" />
  
  <meta property="og:image:width" content="1400" />
  <meta property="og:image:height" content="430" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:author" content="@xTheAlex14" />
  <meta property="twitter:image" content="/assets/banner.webp" />
  <link rel="canonical" href="https://bloxyfruit.com/" />
  <meta name="keywords" content="blox fruits, cheap blox fruits, blox fruits items, buy blox fruits, fast blox fruits delivery, anime defenders, anime defenders items, cheap anime defenders, buy anime defenders, the strongest battlegrounds, battlegrounds gamepasses, cheap gamepasses, Roblox items, buy Roblox items, fast delivery Roblox, online Roblox shop, game items, cheap game items, Roblox gamepasses, buy gamepasses, murder mystery 2, anime vanguards, adopt me" />
</svelte:head>

<img src="/assets/background.png" class="absolute z-20 pointer-events-none select-none size-full" />

<MobileNavbar>
  <button 
    class="flex flex-col items-center gap-1 text-[#809BB5] data-[selected=true]:text-[#3BA4F0] relative group"
    on:click={() => { mobileCartOpen = !mobileCartOpen; mobileFiltersOpen = false }}
    data-selected={mobileCartOpen}
  >
    <ShoppingCart class="size-6 transition-colors group-data-[selected=true]:text-[#3BA4F0]" />
    <p class="font-semibold leading-none transition-colors group-data-[selected=true]:text-white">Cart</p>
    <p 
      class="flex items-center justify-center font-bold text-xs bg-gradient-to-r text-white from-[#3BA4F0] to-[#1B92E9] absolute -top-[3px] -right-[3px] size-4 rounded-full"
      class:animate-pop={shouldAnimate}
    >
      {$cart?.products?.length || 0}
    </p>
  </button>
</MobileNavbar>

<div 
  class="items-center justify-center hidden gap-3 md:flex h-11" 
  style="background:
    radial-gradient(25.7% 199.93% at 100% 50%, rgba(68, 134, 183, 0.69) 0%, rgba(92, 181, 246, 0) 100%),
    radial-gradient(25.73% 200.13% at 0% 50%, rgba(68, 134, 183, 0.69) 0%, rgba(92, 181, 246, 0) 100%),
    linear-gradient(90deg, rgba(59, 119, 164, 0.55) 0%, rgba(28, 119, 186, 0.55) 100%),
    linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url(/assets/landing-background.webp)"
>
  <div class="flex justify-end flex-1 gap-3">
    <PriceTag class="size-5" />
    <p class="text-sm font-semibold">Spend {formatCurrency(100 * $currencyRateStore, $currencyStore)} — Get <span class="text-[#3BA4F0]">{formatCurrency(10 * $currencyRateStore, $currencyStore)}</span> Off!</p>
  </div>
  <div class="w-[300px] h-2.5 bg-[#1D2535] rounded-xl">
    <div class="bg-gradient-to-r from-[#3BA4F0] to-[#1B92E9] rounded-full h-2.5 origin-left transition-[width] ease-out animate-scale-x" style="width: {Math.min(cartPrice / 100 * 100, 100)}%"></div>
  </div>
  <div class="flex justify-start flex-1 gap-3">
    {#if cartPrice < 100}
      <p class="text-sm font-semibold">Add <span class="bg-[#5CB5F6]/25 text-[#C8E8FF] py-1 px-1.5 rounded-md">{formatCurrency((100 - cartPrice) * $currencyRateStore, $currencyStore)}</span>  more to unlock discount!</p>
    {:else}
      <p class="text-sm font-semibold">Discount applied!</p>
    {/if}
    <PriceTag class="rotate-90 size-5" />
  </div>
</div>

<header class="px-4 sm:px-6 md:px-10 flex justify-center items-center w-full h-[80px] bg-[#121620] border-b-2 border-[#1D2535]">
  <div class="flex items-center justify-between w-full">
    <div class="flex items-center gap-12">
      <a href="/">
        <Logo class="w-[110px] md:w-[132px]" />
      </a>
      <NavLinks class="hidden md:flex" />
    </div>

    <div class="flex flex-1 justify-end items-center gap-4 @container">
      <Combobox.Root
        options={searchResults}
        bind:inputValue={searchQuery}
        bind:touchedInput={searchExpanded}
        onOpenChange={(value) => { 
          if(!value) setTimeout(() => searchExpanded = value, 100) 
          else searchExpanded = value 
        }}
        class="relative max-w-[400px]"
        onSelectedChange={handleSelect}
      >
        <div class="max-md:hidden flex items-center gap-2 bg-[#1D2535] relative h-[46px] rounded-lg px-2.5 focus-within:ring-2 focus-within:ring-[#3BA4F0] transition-shadow {searchExpanded ? "w-[240px]" : "w-[46px]"} @[760px]:w-[240px]">
          <Search class="size-6 text-[#809BB5]" />
          <Combobox.Input
            placeholder="Search for items..."
            class="flex-1 absolute left-0 top-0 w-full h-full font-medium pl-10 pr-2.5 outline-none bg-transparent placeholder:text-[#809BB5]"
          />
        </div>
        
        <Combobox.Content
          class="
            max-w-[280px] max-h-[300px] bg-[#1D2535] rounded-[10px] p-2 mt-2 z-50 flex flex-col gap-1
          "
          transition={flyAndScale}
          sideOffset={5}
        >
          <div class="flex flex-col gap-1 [&::-webkit-scrollbar-thumb]:bg-[#809BB5] overflow-y-auto">
            {#if searchResults.length === 0}
              <p class="p-3 text-center text-[#809BB5] font-semibold">
                No results found
              </p>
            {:else}
              {#each searchResults as result, i}
                {#key result.title}
                  <Combobox.Item
                    value={result.title}
                    class={({ active }) => `
                      w-full flex items-center gap-3 p-1 rounded-lg transition-colors
                      ${active ? 'bg-white/5' : ''}
                    `}
                  >
                    <div class="flex items-center flex-1">
                      <div class="size-10 p-1.5 mr-2 bg-white/5 rounded-md">
                        {#if i > 15}
                          <img use:lazyLoad={{ src: result.image }} class="object-contain object-center rounded-md opacity-0 size-full" />
                        {:else}
                          <img src={result.image} class="object-contain object-center rounded-md size-full" />
                        {/if}
                      </div>
                      <div class="flex flex-col gap-1">
                        <p class="font-semibold leading-none">{result.title}</p>
                        <p class="text-[13px] text-[#809BB5] font-medium leading-none">{result.category}</p>
                      </div>
                    </div>
                  </Combobox.Item>
                {/key}
              {/each}
            {/if}
          </div>
        </Combobox.Content>
      </Combobox.Root>

      <div class="items-center gap-4 flex {searchExpanded ? "hidden @[760px]:flex" : ""}">
        <div class="hidden gap-1 md:flex">
          <div class="bg-[#1D2535] rounded-l-lg flex items-center px-3 font-semibold text-sm">
            <p class="text-[#809BB5] mr-2">({$cart?.products?.length || 0} items)</p>
            <p>{formatCurrency(cartPrice * $currencyRateStore, $currencyStore)}</p>
          </div>
          <Button
            color="accent" variant="gradient"
            class="size-[46px] rounded-l-none"
            onClick={() => { desktopCartOpen = !desktopCartOpen }}
          >
            <Basket class="size-[22px]" />
          </Button>
        </div>
        <LocaleSelector initialLanguage={data.lang} initialCurrency={data.curr} />
        <UserSection data={data} />
      </div>
    </div>
  </div>
</header>

<header class="px-4 sm:px-6 md:px-10 flex justify-center items-center w-full h-[80px] bg-[#121620] border-b-2 border-[#1D2535] md:hidden">
  <div class="flex items-center w-full gap-4">
    <Select.Root items={games} bind:selected={game}>
      <Select.Trigger
        class="bg-[#1D2535] rounded-lg flex items-center px-2.5 font-semibold text-sm h-[46px] group"
      >
        <div class="pointer-events-none size-6 md:size-7">
          <img src="/assets/games/{games[game.value].internalName}-logo.webp" class="object-contain object-center rounded-md size-full" />
        </div>
        <p class="ml-2 font-semibold pointer-events-none">{games[game.value].shortName}</p>
        <ArrowDown class="ml-1 transition-transform size-5 group-aria-expanded:rotate-180" strokeWidth={2} />
      </Select.Trigger>
      <Select.Content
        class="!w-[190px] rounded-lg bg-[#1D2535] px-0.5 py-[3px] shadow-popover outline-none z-50"
        transition={flyAndScale}
        align="end"
        sideOffset={8}
      >
        <div class="px-1 py-1 max-h-[calc(min(100dvh-160px,300px))] overflow-y-auto">
          {#each Object.values(games) as inGame}
            <Select.Item
              class="flex h-10 w-full text-sm select-none items-center rounded-button outline-none transition-all duration-75 data-[highlighted]:bg-white/10 rounded-md"
              value={inGame.internalName}
              label={inGame.name}
              href={`/store/${inGame.internalName}`}
            >
              <a href={`/store/${inGame.internalName}`} class="flex items-center justify-center w-full py-1.5 px-2.5">
                <div class="size-6 mr-1.5">
                  <img src="/assets/games/{inGame.internalName}-logo.webp" alt="Game Icon" class="object-contain object-center rounded-md size-full" />
                </div>
                <p class="font-semibold">{inGame.name}</p>
                <Select.ItemIndicator class="ml-auto" asChild={false}>
                  <Check class="size-4" strokeWidth={2.5}/>
                </Select.ItemIndicator>
              </a>
            </Select.Item>
          {/each}
        </div>
      </Select.Content>
    </Select.Root>

    <div class="bg-[#1D2535] rounded-lg flex items-center px-3 h-[46px] flex-1 min-w-0">
      <Search class="size-5 text-[#809BB5] shrink-0" />
      <input type="text" class="bg-transparent outline-none text-white px-2.5 py-2.5 placeholder:text-[#809BB5] font-medium flex-1 min-w-0" placeholder="Search items..." />
    </div> 

    <Button color="gray" class="text-white size-[48px]" onClick={() => { mobileFiltersOpen = !mobileFiltersOpen; mobileCartOpen = false }}>
      <Options class="size-5" />
    </Button>
  </div>
</header>

<div class="flex h-[calc(100dvh-232px)] md:h-[calc(100dvh-124px)]">
  <!-- Sidebar -->
  <div 
    class="
      {mobileFiltersOpen ? "max-md:translate-y-0" : "max-md:translate-y-full"}
      fixed max-md:top-0 max-md:left-0 max-md:z-[14] max-md:size-full max-md:pb-[88px]
      md:relative
      w-[280px] lg:w-[320px] bg-[#121620] p-4 flex flex-col transition-transform duration-300 md:duration-0 overflow-y-auto
    "
  >
    <div class="flex items-center mb-4 md:hidden">
      <Options class="size-6 mr-1.5" />
      <p class="text-lg font-semibold">Filters</p>
      <Button icon size="xsmall" variant="text" color="white" wrapperClass="md:hidden ml-auto" onClick={() => mobileFiltersOpen = false}>
        <Close class="size-[22px]" strokeWidth={2} />
      </Button>
    </div>
    <Accordion.Root multiple value={["$0", "$1", "$2"]}>
      <!-- Games -->
      <Accordion.Item value="$0" class="max-md:hidden">
        <Accordion.Header>
          <Accordion.Trigger
            class="flex flex-col text-[#809BB5] [&[data-state=open]>div>svg:last-of-type]:rotate-180 w-full pb-4"
          >
            <div class="flex items-center w-full gap-2">
              <Games class="size-4" />
              <p class="text-sm font-bold">Games</p>
              <ArrowDown class="ml-auto transition-transform size-5" />
            </div>
            <div class="w-full h-[3px] bg-[#1D2535] mt-4 rounded-full"></div>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content
          transition={slide}
          transitionConfig={{ duration: 200 }}
          class="pb-[25px] text-sm tracking-[-0.01em] flex flex-col gap-3"
        >
          {#each Object.values(games) as game, i}
            <Button variant="bordered" color="game" to={`/store/${game.internalName}`} wrapperClass="w-full" class="w-full {$page.url.pathname == `/store/${game.internalName}` ? "bg-[#1D2535] border-[#1D2535]" : "bg-[#1D2535]/25 border-[#1D2535]/55"}" insideDivClass="w-full justify-between">
                <div class="size-7 mr-1.5">
                  <img src="/assets/games/{game.internalName}-logo.webp" class="object-contain object-center rounded-lg size-full" />
                </div>
                {game.name}
              <div class="rounded-lg size-7 flex items-center justify-center ml-auto {$page.url.pathname == `/store/${game.internalName}` ? "bg-[#3BA4F0]" : "bg-[#1D2535]"}">
                {#if $page.url.pathname == `/store/${game.internalName}`}
                  <div class="bg-white rounded-full size-2"></div>
                {:else}
                  <ArrowRight class="size-[14px] text-white" />
                {/if}
              </div>
            </Button>
          {/each}
        </Accordion.Content>
      </Accordion.Item>

      <div class="flex flex-col text-[#809BB5] mb-4">
        <div class="flex items-center w-full gap-2">
          <OptionsFill class="size-[22px]" />
          <p class="text-sm font-bold">Filter Items</p>
          <button
            class="ml-auto text-[#3BA4F0] font-medium text-sm underline decoration-[#3BA4F0] underline-offset-2"
            on:click={() => {
              rarities = data.game.rarities.map(rarity => ({
                name: rarity.name,
                color: rarity.color,
                enabled: true
              }))
              priceRange = [0, 100]
            }}
          >
            Reset
          </button>
        </div>
        <div class="w-full h-[3px] bg-[#1D2535] mt-4 rounded-full"></div>
      </div>

      <!-- Price Range -->
      <Accordion.Item value="$1" class="bg-[#141925] border-2 border-[#1D2535] rounded-lg">
        <Accordion.Header>
          <Accordion.Trigger
            class="flex flex-col text-[#809BB5] [&[data-state=open]>div>svg:last-of-type]:rotate-180 w-full p-3.5"
          >
            <div class="flex items-center w-full gap-2">
              <p class="text-sm font-bold">Price Range</p>
              <ArrowDown class="ml-auto transition-transform size-5" />
            </div>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content
          transition={slide}
          transitionConfig={{ duration: 200 }}
          class="text-sm tracking-[-0.01em] flex flex-col gap-3 px-3.5 pb-3.5"
        >
         <Slider.Root
            bind:value={priceRange}
            let:thumbs
            class="relative flex items-center w-full mt-1 select-none touch-none"
          >
            <span
              class="relative h-2 w-full grow overflow-hidden rounded-full bg-[#1D2535]"
            >
              <Slider.Range class="absolute h-full bg-[#2A9AEC]" />
            </span>
            {#each thumbs as thumb}
              <Slider.Thumb
                {thumb}
                class="block size-3.5 cursor-pointer rounded-full bg-white border-2 border-white shadow transition-colors focus-visible:outline-none active:scale-98 disabled:pointer-events-none disabled:opacity-50"
              />
            {/each}
          </Slider.Root>
          <div class="flex items-center justify-between gap-2 mt-2">
            <div class="flex items-center w-full bg-[#1D2535] py-2 px-2.5 gap-1.5 rounded-md">
              <p class="font-semibold">{currency.symbol}</p>
              <p class="flex-1 font-medium text-right">{formatNumber(priceRange[0] * $currencyRateStore)}</p>
            </div>
            <div class="w-12 h-0 border-b-2 border-[#1D2535]"></div>
            <div class="flex items-center w-full bg-[#1D2535] py-2 px-2.5 gap-1.5 rounded-md">
              <p class="font-semibold">{currency.symbol}</p>
              <p class="flex-1 font-medium text-right">{formatNumber(priceRange[1] * $currencyRateStore)}</p>
            </div>
          </div>
        </Accordion.Content>
      </Accordion.Item>

      <!-- Rarities -->
      <Accordion.Item value="$2" class="bg-[#141925] border-2 border-[#1D2535] p-3.5 rounded-lg mt-3.5">
        <Accordion.Header>
          <Accordion.Trigger
            class="flex flex-col text-[#809BB5] [&[data-state=open]>div>svg:last-of-type]:rotate-180 w-full"
          >
            <div class="flex items-center w-full gap-2">
              <p class="text-sm font-bold">Rarities</p>
              <ArrowDown class="ml-auto transition-transform size-5" />
            </div>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content
          transition={slide}
          transitionConfig={{ duration: 200 }}
          class="text-sm tracking-[-0.01em] flex flex-col gap-3"
        >
          {#each rarities as rarity, i}
            <div class="flex items-center justify-between first:mt-3.5">
              <div class="flex items-center">
                <Tag class="size-5" style="color: {rarityColors[rarity.color].solid}; filter: drop-shadow(0px 0px 5px {alpha(rarityColors[rarity.color].solid, 0.3)})" />
                <p class="font-semibold ml-1.5">{rarity.name} - <span class="text-[#809BB5] text-xs">{allItems.filter(item => item.rarity === rarity.name).length}</span></p>
              </div>
              <button class="rounded-lg relative size-6 flex items-center justify-center ml-auto overflow-hidden bg-[#1D2535]" on:click={() => rarities[i].enabled = !rarities[i].enabled}>
                <div class="bg-[#3BA4F0] size-full rounded-lg transition-transform ease-in-out absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform {rarity.enabled ? "scale-100" : "scale-0"}"></div>
                <div class="rounded-full size-2 bg-white transition-opacity z-10 {rarity.enabled ? "opacity-100" : "opacity-0"}"></div>
              </button>
            </div>
          {/each}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  </div>

  <!-- Page Content  -->
  <div class="relative flex flex-col flex-1 overflow-hidden">
    <div class="p-6">
      <div class="bg-[#1D2535]/35 rounded-lg gap-5 flex items-center overflow-x-auto">
        <div 
          class="relative flex items-center flex-1 gap-5 p-3 md:p-4"
          style="min-width: {categories.reduce((acc, item) => acc + item.length * 9.5 + 25, 200 + 50 + 25 + 25)}px"
        >
          <div class="opacity-0 w-16 h-1 rounded-t-xl absolute bg-[#3BA4F0] bottom-0 shadow-[0_-5px_28px_#3BA4F0] transition-[transform,width,opacity]" bind:this={categorySelector}></div>
  
          {#each categories as category}
            <button
              class="font-bold text-[#809BB5] data-[enabled=true]:text-white data-[disabled=true]:opacity-50 flex data-[disabled=true]:pointer-events-none items-center group transition-colors" 
              id="{category}-tab" 
              data-enabled={category == $activeCategory && !filteredCategories?.[category]?.length <= 0}
              data-disabled={!filteredCategories?.[category]?.length > 0}
              on:click={() => document.getElementById(`${category}-category`)?.scrollIntoView({ behavior: "smooth" })}
            >
              {#if category == "Best Sellers"}
                <Fire class="group-data-[enabled=true]:text-[#3BA4F0] size-6 mr-1 transition-colors" />
              {/if}
              {pluralize(category)}
            </button>
            {#if category == "Best Sellers"}
              <div class="bg-[#1D2535] w-0.5 h-6 rounded-full"></div>
            {/if}
          {/each}
  
          <div class="flex gap-1 ml-auto">
            <div class="bg-[#1D2535] rounded-l-lg text-[#809BB5] flex items-center p-2.5">
              <Filters class="size-[14px] mr-1.5" />
              <p class="text-sm font-semibold">Sort By:</p>
            </div>
            <SortBySelector bind:sortBy />
          </div>
        </div>
      </div>
    </div>
    <div bind:this={scrollContainer} class="flex flex-col flex-1 px-6 pb-6 overflow-y-auto" on:scroll={handleCategorySelector}>
      {#each categories as category}
        {@const products = filteredCategories[category]}
        {#if products?.length > 0}
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              {#if category == "Best Sellers"}
                <Fire class="text-[#3BA4F0] size-8" />
              {/if}
              <p class="py-4 text-xl font-semibold" id="{category}-category">{pluralize(category, 2)}</p>
            </div>
            <div class="flex-1 bg-[#131A28] rounded-full h-1"></div>
          </div>
          <div class="grid [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(210px,1fr))] gap-6">
            {#each products as { title, image, price, comparePrice, variantId, inStock, category, description, askBeforeBuy, rarity }}
              <WholeItem
                id={variantId}
                {title}
                {image}
                {category}
                {rarity}
                {inStock}
                price={price}
                comparePrice={comparePrice}
                game={data.game.internalName}
                onClick={() => {
                  if($cart.game && $cart?.game !== data.game.internalName && $cart?.products?.length > 0) {
                    multipleGamesOpen = true
                    return
                  }

                  if ($cart.game == "blox-fruits" && $cart?.products?.length > 0 && ($cart?.products?.some(item => item.category === "Physical Fruit" || category === "Physical Fruit"))) {
                    permanentFruitPresent = true;
                    return;
                  }

                  if(askBeforeBuy) {
                    askBeforeBuyModal = { 
                      variantId,
                      category,
                      description,
                      rarity,
                      title,
                      image,
                      price,
                      comparePrice
                    }
                    return
                  }

                  desktopCartOpen = true
  
                  let newProducts = $cart?.products || []
                  const itemIndex = newProducts?.findIndex(product => product.variantId == variantId)
  
                  if(itemIndex >= 0) {
                    newProducts[itemIndex].amount++
                  } else {
                    newProducts.push({
                      variantId,
                      category,
                      amount: 1
                    })
                  }
  
                  $cart = {
                    game: data.game.internalName,
                    products: newProducts
                  }

                  return true
                }}
              />
            {/each}
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Cart -->
  <div 
    class="
      {mobileCartOpen ? "max-md:translate-y-0" : "max-md:translate-y-full"}
      {desktopCartOpen ? "md:flex" : "md:hidden"}
      fixed max-md:top-0 max-md:left-0 max-md:z-[14] max-md:size-full max-md:pb-[88px]
      md:relative
      w-[290px] lg:w-[330px] bg-[#121620] p-4 max-md:flex flex-col transition-transform duration-300 md:duration-0
    "
  >
    <div class="flex items-center">
      <ShoppingCart class="size-6 mr-1.5" />
      <p class="text-lg font-semibold">Cart</p>
      <Button icon size="xsmall" variant="text" color="white" wrapperClass="md:hidden ml-auto" onClick={() => mobileCartOpen = false}>
        <Close class="size-[22px]" strokeWidth={2} />
      </Button>
    </div>
    <div class="w-full h-[3px] bg-[#1D2535] mt-4 rounded-full"></div>

    <div class="pointer-events-none absolute top-[79px] left-0 right-1.5 bg-gradient-to-b from-[#121620] to-transparent z-10 transition-[opacity,height] {cartIsAtTop ? "opacity-0 h-0" : "opacity-100 h-12"}"></div>
    <div class="pointer-events-none absolute bottom-[318px] md:bottom-[246px] left-0 right-1.5 bg-gradient-to-b from-transparent to-[#121620] z-10 transition-[opacity,height] {cartIsAtBottom ? "opacity-0 h-0" : "opacity-100 h-12"}"></div>

    <div class="relative flex-1 py-4 overflow-hidden">
      {#if cartProducts?.length == 0}
        <div class="absolute flex flex-col items-center justify-center w-full gap-1 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" in:fly={{ y: 20 }} out:blur={{ duration: 200 }}>
          <div class="relative">
            <Basket class="text-white size-12" />
            <p class="absolute top-0 right-0 size-5 text-sm rounded-full bg-[#3BA4F0] font-semibold flex items-center justify-center">0</p>
          </div>
          <p class="mt-2 text-xl font-bold leading-none text-center">Your cart is empty</p>
          <p class="text-center text-[15px] font-medium text-[#809BB5] leading-none mt-0.5">Start browsing for items now!</p>
        </div>
      {/if}

      <div class="relative flex flex-col h-full space-y-3 overflow-y-auto no-scrollbar" on:scroll={(e) => {
        cartIsAtTop = e.target.scrollTop === 0, cartIsAtBottom = Math.abs(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight) < 1
      }}>
        {#each cartProducts as { variantId, title, image, amount, price, comparePrice } (variantId) }
          <CartItem
            {title} {image} {amount} {price} {comparePrice}
            onUpdate={(value) => {
              const itemIndex = $cart.products.findIndex(item => item.variantId == variantId)
              if(itemIndex < 0) return
  
              if($cart.products[itemIndex].amount + value <= 0) {
                $cart = { 
                  ...$cart,
                  products: $cart.products.filter((_, index) => index !== itemIndex)
                }
                return
              }
  
              $cart.products[itemIndex].amount += value
            }}
          />
        {/each}
      </div>
    </div>

    <div class="mt-auto flex flex-col p-2.5 bg-[#141925] border-2 border-[#1D2535] rounded-lg">
      {#if cartPrice < 100}
        <p class="font-semibold">Spend <span class="text-[#3BA4F0]">{formatCurrency(100 * $currencyRateStore, $currencyStore)}</span>, Get <span class="text-[#3BA4F0]">{formatCurrency(10 * $currencyRateStore, $currencyStore)}</span> Off!</p>
      {:else}
        <div class="flex items-center gap-1.5">
          <Check class="size-[18px] p-[3px] bg-[#3BA4F0] rounded-full" strokeWidth="4" />
          <p class="font-semibold">Cuppon applied successfully!</p>
        </div>
      {/if}
      <div class="flex items-center gap-2 mt-2">
        <p class="text-sm text-[#3BA4F0] font-semibold">$0</p>
        <div class="flex-1 h-2.5 bg-[#1D2535] rounded-xl">
          <div class="bg-gradient-to-r from-[#3BA4F0] to-[#1B92E9] rounded-full h-2.5 origin-left animate-scale-x transition-[width]" style="width: {Math.min(cartPrice / 100 * 100, 100)}%"></div>
        </div>
        <p class="text-sm text-[#3BA4F0] font-semibold">$100</p>
      </div>
    </div>

    <div class="flex justify-between mt-3 text-lg font-semibold">
      <p>Total Price</p>
      <p>{formatCurrency(cartPrice * $currencyRateStore, $currencyStore)}</p>
    </div>

    <form
      action="?/buy"
      method="POST"
      use:enhance={() => {
        submittingCheckout = true
      }}
    >
      <input type="hidden" aria-hidden="true" value={JSON.stringify($cart.products)} name="cart" />
      <Button type="submit" color="accent" variant="gradient" class="w-full mt-3 text-base" disabled={$cart?.products?.length == 0} loading={submittingCheckout}>
        Checkout
      </Button>
    </form>

    <div class="flex justify-center gap-2 mt-3">
      {#each [ Mastercard, Maestro, Paypal, Visa ] as icon}
        <div class="bg-white rounded-lg w-[54px] h-[32px] flex items-center justify-center">
          <svelte:component this={icon} class="size-10" />
        </div>
      {/each}
    </div>
  </div>
</div>

<Modal bind:open={permanentFruitPresent}>
  <h1 class="text-xl font-semibold">Oops! Cart Update Needed</h1>
  <p class="mt-6 font-semibold">
    <span class="text-[#3BA4F0]">Physical Fruits</span> can't be combined with other items.
    <br/>
    Please remove all <span class="text-[#3BA4F0]">Physical Fruits</span> or clear your cart to add this item.
  </p>
  <Button 
    variant="gradient" color="accent" class="w-full" wrapperClass="mt-6"
    onClick={() => {
      $cart = {
        game: data.game.internalName,
        products: []
      }
      permanentFruitPresent = false
    }}
  >
    Remove Other Items
    <ArrowRight class="size-4 ml-1.5" />
  </Button>
</Modal>

<Modal bind:open={multipleGamesOpen}>
  <h1 class="text-xl font-semibold">Oops! Cart Update Needed</h1>
  <p class="mt-6 font-semibold">
    Your cart currently contains items from <span class="text-[#3BA4F0]">{games[$cart.game].name}</span>. <br/>
    To add items from <span class="text-[#3BA4F0]">{data.game.name},</span> please remove any items from other games.
  </p>
  <Button 
    variant="gradient" color="accent" class="w-full" wrapperClass="mt-6"
    onClick={() => {
      $cart = {
        game: data.game.internalName,
        products: []
      }
      multipleGamesOpen = false
    }}
  >
    Remove Other Items
    <ArrowRight class="size-4 ml-1.5" />
  </Button>
</Modal>

<Modal bind:open={askBeforeBuyModal} contentClass="min-[870px]:max-w-[740px]">
  <div class="flex gap-6">
    <div 
      class="bg-[#1D2535] rounded-xl p-[18px] w-[250px] flex items-center justify-center shrink-0 relative overflow-hidden"
      style="background: {rarityColors[games?.[data.game.internalName]?.rarities?.find(r => r.name === askBeforeBuyModal.rarity)?.color || "gray"].gradient}"
    >
      <CirlceIlustration class="absolute bottom-[-308px] right-[-308px] rotate-90 size-[524px]" color={rarityColors[games?.[data.game.internalName]?.rarities?.find(r => r.name === askBeforeBuyModal.rarity)?.color || "gray"].solid} />
      <div class="relative pointer-events-none select-none size-full">
        <img use:lazyLoad={{ src: askBeforeBuyModal.image, opacity: 0.2 }} alt="Item thumbnail" class="size-full object-contain object-center absolute top-0 left-0 blur-xl z-0 opacity-35 transition-[opacity,transform] duration-200" />
        <img use:lazyLoad={{ src: askBeforeBuyModal.image }} alt="Item thumbnail" class="relative z-10 object-contain object-center transition-opacity opacity-0 size-full" />
      </div>
    </div>
    <div class="flex flex-col gap-1 py-2">
      <h1 class="text-3xl font-semibold leading-none">{askBeforeBuyModal.title}</h1>
      <p class="text-sm text-[#809BB5] font-semibold leading-none">{askBeforeBuyModal.category}</p>
      <div class="flex max-sm:flex-col sm:items-center gap-1 !leading-none">
        <p class="text-[17px] text-left font-extrabold text-white">{formatCurrency(askBeforeBuyModal.price * $currencyRateStore, $currencyStore)}</p>
        {#if askBeforeBuyModal.comparePrice}
          <p class="text-sm font-semibold text-[#C42F30] text-left line-through">{formatCurrency(askBeforeBuyModal.comparePrice * $currencyRateStore, $currencyStore)}</p>
        {/if}
      </div>
      <div class="text-[#809BB5] font-semibold leading-none whitespace-pre-line [word-wrap:break-word] mt-3">{@html askBeforeBuyModal.description}</div>
      <Button
        variant="gradient" color="accent" class="w-[180px] mt-6"
        onClick={() => {
          let newProducts = $cart?.products || []
          const itemIndex = newProducts?.findIndex(product => product.variantId == askBeforeBuyModal.variantId)
  
          if(itemIndex >= 0) {
            newProducts[itemIndex].amount++
          } else {
            newProducts.push({
              variantId: askBeforeBuyModal.variantId,
              amount: 1
            })
          }

          $cart = {
            game: data.game.internalName,
            products: newProducts
          }

          askBeforeBuyModal = false
          desktopCartOpen = true
        }}
      >
        Add to Cart
      </Button>
    </div>
  </div>
</Modal>
