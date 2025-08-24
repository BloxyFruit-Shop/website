<script>
  import {
    Basket,
    RoundedArrowRight,
    Youtube,
    PhosphorFlame,
    Trustpilot
  } from '$icons';
  import Button from '$components/Button.svelte';
  import WholeItem from '$components/WholeItem.svelte';
  import Marquee from '$components/Marquee.svelte';
  import HoverCard from '$components/HoverCard.svelte';
  import translations from '$lib/utils/translations';
  import { languageStore } from '$lib/utils/stores';
  import Faq from '$elements/faq.svelte';

  const ourGames = [
    {
      title: 'Blox Fruits',
      name: 'blox-fruits',
      description: 'Get powerful swords, fruits, and more to level up fast!',
      logo: '/assets/games/blox-fruits-logo.webp',
      image: '/assets/games/bloxfruits.webp',
      gradient: '58, 43, 35',
      ready: true
    },
    {
      title: 'Grow a Garden',
      name: 'grow-a-garden',
      description:
        'Get rare seeds, powerful gear, pets, and more to grow your dream garden!',
      logo: '/assets/games/grow-a-garden-logo.webp',
      image: '/assets/games/grow-a-garden.webp',
      gradient: '36, 55, 42',
      ready: true
    },
    {
      title: 'Steal a Brainrot',
      name: 'steal-brainrot',
      description:
        'Get epic gear, steal Brainrots and troll your way to the top!',
      logo: '/assets/games/steal-brainrot-logo.webp',
      image: '/assets/games/steal-brainrot.webp',
      gradient: '37, 40, 60',
      ready: true
    },
    {
      title: 'Blue Lock: Rivals',
      name: 'blue-lock',
      description: 'Get the best styles and passes to dominate the field!',
      logo: '/assets/games/blue-lock-logo.webp',
      image: '/assets/games/blue-lock.webp',
      gradient: '37, 40, 60',
      ready: true
    },
    {
      title: 'Rivals',
      name: 'rivals',
      description: "Grab awesome gear and show everyone who's boss!",
      logo: '/assets/games/rivals-logo.webp',
      image: '/assets/games/rivals.webp',
      gradient: '58, 35, 52',
      ready: true
    },
    {
      title: 'Anime Vanguards',
      name: 'anime-vanguards',
      description: 'Get top gear to become the strongest hero in the game!',
      logo: '/assets/games/anime-vanguards-logo.webp',
      image: '/assets/games/animevanguards.webp',
      gradient: '58, 56, 35',
      ready: true
    },
    {
      title: 'King Legacy',
      name: 'king-legacy',
      description:
        'Collect rare fruits, embark on epic adventures. Become the best!',
      logo: '/assets/games/king-legacy-logo.webp',
      image: '/assets/games/king-legacy.webp',
      gradient: '36, 35, 58',
      ready: true
    },
    {
      title: 'Pets Go!',
      name: 'pets-go',
      description:
        'Get the best items and collect more pets and gems than ever!',
      logo: '/assets/games/pets-go-logo.webp',
      image: '/assets/games/pets-go.webp',
      gradient: '41, 58, 35',
      ready: true
    },
    {
      title: 'Murder Mystery 2',
      name: 'murder-mystery-2',
      description: 'Find cool weapons and gear to help you win every round!',
      logo: '/assets/games/murder-mystery-2-logo.webp',
      image: '/assets/games/murder-mystery-2.webp',
      gradient: '58, 35, 35',
      ready: true
    }
  ];

  const youtubers = [
    {
      name: 'GatoGod',
      tag: '@gatogod',
      link: 'https://www.youtube.com/@GatoGod',
      icon: '/assets/youtubers/GatoGod.jpg',
      subs: '562k'
    },
    {
      name: 'Gnoren Dog',
      tag: '@GnorenDog',
      link: 'https://www.youtube.com/@GnorenDog',
      icon: '/assets/youtubers/GnorenDog.jpg',
      subs: '204k'
    },
    {
      name: 'LegoBlox',
      tag: '@LegoBIox',
      link: 'https://www.youtube.com/@LegoBlox',
      icon: '/assets/youtubers/LegoBlox.jpg',
      subs: '268k'
    },
    {
      name: 'Zeer YT',
      tag: '@ZeerTheGoat',
      link: 'https://www.youtube.com/@ZeerTheGoat',
      icon: '/assets/youtubers/ZeerTheGoat.jpg',
      subs: '711k'
    },
    {
      name: 'NataBlox',
      tag: '@NataBlox',
      link: 'https://www.youtube.com/@NataBlox',
      icon: '/assets/youtubers/NataBlox.jpg',
      subs: '512k'
    }
  ];

  export let data;
</script>

<svelte:head>
  <title
    >BloxyFruit - The Most Trusted, Affordable Roblox Items Store with Fast
    Delivery!</title
  >
  <meta
    property="og:title"
    content="BloxyFruit - The Most Trusted, Affordable Roblox Items Store with Fast Delivery!"
  />
  <meta
    property="twitter:title"
    content="BloxyFruit - The Most Trusted, Affordable Roblox Items Store with Fast Delivery!"
  />
  <meta
    name="description"
    content="Shop the best deals on Roblox items at BloxyFruit! Buy Blox Fruits, Grow a Garden seeds and gear, Blue Lock styles and passes, Anime Vanguards, Rivals, Murder Mystery 2, Pets Go, Steal a Brainrot, and more. Fast delivery, trusted service, and unbeatable prices for your favorite Roblox games!"
  />
  <meta
    property="og:description"
    content="Shop the best deals on Roblox items at BloxyFruit! Buy Blox Fruits, Grow a Garden seeds and gear, Blue Lock styles and passes, Anime Vanguards, Rivals, Murder Mystery 2, Pets Go, Steal a Brainrot, and more. Fast delivery, trusted service, and unbeatable prices for your favorite Roblox games!"
  />
  <meta
    property="twitter:description"
    content="Shop the best deals on Roblox items at BloxyFruit! Buy Blox Fruits, Grow a Garden seeds and gear, Blue Lock styles and passes, Anime Vanguards, Rivals, Murder Mystery 2, Pets Go, Steal a Brainrot, and more. Fast delivery, trusted service, and unbeatable prices for your favorite Roblox games!"
  />

  <meta property="og:image:width" content="1400" />
  <meta property="og:image:height" content="430" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:author" content="@xTheAlex14" />
  <meta property="twitter:image" content="/assets/banner.webp" />
  <link rel="canonical" href="https://bloxyfruit.com/" />
  <meta
    name="keywords"
    content="blox fruits, cheap blox fruits, blox fruits items, buy blox fruits, fast blox fruits delivery, grow a garden, grow a garden roblox, buy grow a garden, grow a garden seeds, grow a garden gear, cheap grow a garden, blue lock, blue lock rivals, blue lock roblox, buy blue lock, blue lock styles, blue lock passes, anime defenders, anime defenders items, cheap anime defenders, buy anime defenders, the strongest battlegrounds, battlegrounds gamepasses, cheap gamepasses, Roblox items, buy Roblox items, fast delivery Roblox, online Roblox shop, game items, cheap game items, Roblox gamepasses, buy gamepasses, murder mystery 2, anime vanguards, adopt me, knives, guns, units, blue lock styles, buy styles, flows, pets go, pets go roblox, buy pets go, pets go items, rivals, buy rivals, rivals roblox, steal a brainrot, buy steal a brainrot, steal brainrots, troll gear, roblox store, roblox shop, roblox items store, roblox best prices, roblox fast delivery"
  />
</svelte:head>

<div class="flex flex-col items-center pt-[80px]">
  <div
    class="absolute top-[1500px] left-[-250px] size-[250px] bg-[#3BA4F0]/50 blur-[250px]"
  ></div>
  <div
    class="absolute top-[2600px] left-[-300px] size-[250px] bg-[#3BA4F0]/40 blur-[200px]"
  ></div>

  <div class="max-w-[1400px] w-full flex justify-center flex-col px-4 sm:px-6">
    <div
      class="w-full max-md:py-10 md:min-h-[calc(clamp(750px,100dvh,1080px)-80px)] flex items-center justify-between @container"
    >
      <div
        class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/landing-background.webp)] bg-no-repeat bg-cover bg-center z-[-1]"
      ></div>
      <div
        class="h-full absolute top-0 left-0 right-[var(--scrollbar-width,0px)] bg-[linear-gradient(to_bottom,#0c0e16e0,#0c0e16),url(/assets/background-glow.webp)] opacity-[0.05] bg-no-repeat bg-cover bg-center z-[-1]"
      ></div>
      <div class="">
        <div class="flex gap-3 mb-5 sm:items-center max-sm:flex-col">
          <a
            href="https://trustpilot.com/review/bloxyfruit.com"
            target="_blank"
          >
            <Trustpilot class="w-[200px] md:w-[230px]" />
          </a>

          <svg
            width="2"
            height="22"
            class="max-sm:hidden"
            viewBox="0 0 2 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1.77344L0.999999 20.7734"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>

          <p class="text-sm font-medium md:text-base">
            {translations[$languageStore].review}
          </p>
        </div>

        <h1 class="text-4xl font-bold leading-tight md:text-5xl">
          {translations[$languageStore].heroTitle1}<br />
          <span class="text-accent-500"
            >{translations[$languageStore].heroTitle2}</span
          >
          with<br />
          {translations[$languageStore].heroTitle3}
        </h1>
        <p
          class="text-[#809BB5] my-5 xl:text-lg font-medium max-w-[550px] xl:max-w-[650px]"
        >
          {translations[$languageStore].heroDescription}
        </p>
        <Button
          color="accent"
          variant="gradient"
          class="text-base w-max"
          to="/store/blox-fruits"
        >
          <Basket class="size-[18px] mr-1.5" />
          {translations[$languageStore].startBuying}
        </Button>
      </div>
      <div
        class="bg-[#3BA4F0]/5 rounded-[40px] max-xl:w-[425px] max-[1650px]:w-[504px] w-[561px] max-xl:h-[552px] max-[1650px]:h-[655px] h-[728px] relative max-md:hidden max-xl:mr-[55px] max-[1650px]:mr-[70px] mr-0"
      >
        <!-- <div class="max-xl:size-[200px] max-[1650px]:size-[250px] size-[328px] bg-[#3BA4F0]/55 blur-[100px] absolute max-xl:right-[-80px] max-[1650px]:right-[-120px] right-[-150px] top-1/2 -translate-y-1/2 z-[-1]"></div> -->
        <img
          src="/assets/pattern.webp"
          class="h-full max-w-none left-[-100px] absolute top-[40px] select-none pointer-events-none"
        />

        <div
          class="size-[240px] xl:size-[328px] bg-[#3BA4F0]/55 blur-[100px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1]"
        ></div>

        <img
          src="/assets/blox-fruits-ilustration.webp"
          class="max-w-none max-xl:w-[390px] max-[1650px]:w-[400px] w-[430px] h-full absolute left-1/2 -translate-x-1/2 object-contain select-none pointer-events-none"
        />
        <!-- <img src="/assets/murder-myster-2-ilustration.webp" class="max-w-none w-[800px] h-[720px] absolute left-[-20px] object-contain select-none pointer-events-none" /> -->

        <div class="max-xl:scale-[0.7] max-[1650px]:scale-[0.9] scale-100">
          <div
            class="w-[200px] rounded-lg backdrop-blur-lg absolute top-[210px] -rotate-12 left-[-120px] animate-float [--duration:2.5s] [--rotation:-12deg] [--adjusted-rotation:-10deg] scale-[0.65] lg:scale-100"
          >
            <WholeItem
              title={data.products[0].title}
              image={data.products[0].image}
              category={data.products[0].category}
              rarity={data.products[0].rarity}
              price={data.products[0].price}
              comparePrice={data.products[0].comparePrice}
              game="blox-fruits"
              class="size-full"
              to={`/store/blox-fruits`}
            />
          </div>
        </div>

        <div class="max-xl:scale-[0.7] max-[1650px]:scale-[0.9] scale-100">
          <div
            class="w-[200px] rounded-lg backdrop-blur-lg absolute top-[300px] rotate-12 right-[-120px] animate-float [--duration:3s] [--rotation:12deg] [--adjusted-rotation:10deg]"
          >
            <WholeItem
              title={data.products[1].title}
              image={data.products[1].image}
              category={data.products[1].category}
              rarity={data.products[1].rarity}
              price={data.products[1].price}
              comparePrice={data.products[1].comparePrice}
              game="blox-fruits"
              class="size-full"
              to={`/store/rivals`}
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Our Games -->
  <div class="max-w-[1400px] w-full flex justify-center flex-col px-4 sm:px-6">
    <h2 class="font-extrabold text-[32px] leading-none">
      {translations[$languageStore].ourGamesTitle}
    </h2>
    <p
      class="text-[#809BB5] text-lg font-medium max-w-[650px] my-4 leading-none"
    >
      {translations[$languageStore].ourGamesDescription}
    </p>

    <div
      class="flex flex-col sm:grid sm:grid-cols-[repeat(auto-fit,minmax(385px,1fr))] gap-4"
    >
      {#each ourGames as game}
        <div
          class="flex gap-4 p-4 rounded-lg"
          style="background: linear-gradient(254.73deg, rgba(25, 29, 45, 0.4) 0.18%, #191D2D 85.87%), linear-gradient(0deg, rgba({game.gradient}, 0.8), rgba({game.gradient}, 0.8)), url({game.image}), #191D2D; background-repeat: no-repeat; background-size: cover; background-position: center;"
        >
          <div class="p-2 rounded-lg bg-white/25">
            <div class="relative size-32">
              <img
                src={game.logo}
                class="absolute top-0 left-0 rounded-lg pointer-events-none select-none size-full blur-xl"
              />
              <img
                src={game.logo}
                class="relative z-10 rounded-lg pointer-events-none select-none size-full"
              />
            </div>
          </div>
          <div class="flex flex-col justify-center gap-1">
            <p class="text-xl font-extrabold">{game.title}</p>
            <p class="text-[15px] font-medium">{game.description}</p>
            <Button
              class="text-white bg-white/25 w-max"
              to="/store/{game.name}"
            >
              {#if game.ready}
                {translations[$languageStore].viewItems}
                <RoundedArrowRight class="size-[18px] ml-1.5" />
              {:else}
                {translations[$languageStore].comingSoon}
              {/if}
            </Button>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Trusted by Top Roblox Creators -->
  <div
    class="bg-[#3BA4F0]/4 w-full flex flex-col items-center mt-16 md:mt-24 pt-12 overflow-hidden px-4 sm:px-6"
  >
    <div class="max-w-[1400px] w-full flex justify-center flex-col">
      <h2 class="font-extrabold text-[32px] leading-none">
        {translations[$languageStore].trustedCreatorsTitle}
        <span class="text-[#3BA4F0]"
          >{translations[$languageStore].trustedCreatorsTitle2}</span
        >
      </h2>
      <p
        class="text-[#809BB5] text-lg font-medium max-w-[1000px] my-4 leading-none"
      >
        {translations[$languageStore].trustedCreatorsDescription}
      </p>
    </div>

    <div
      class="relative w-full [mask-image:radial-gradient(circle,rgba(0,0,0,1)_40%,rgba(0,0,0,0)_100%)]"
    >
      <Marquee class="[--duration:15s] pt-8 pb-12" pauseOnHover>
        {#each youtubers as youtuber}
          <a
            href={youtuber.link}
            class="rounded-xl w-max p-[15px] relative flex items-center gap-4 group/card transition-shadow hover:shadow-[0_10px_25px_0_rgba(59,164,240,0.08)]"
          >
            <div
              class="absolute left-0 top-0 right-0 bottom-0 rounded-xl bg-[linear-gradient(95deg,rgba(29,49,73,0.5)_0%,rgba(29,49,73,0.145)_50%,rgba(29,49,73,0.5)_100%)] after:content-empty after:rounded-xl after:opacity-0 after:group-hover/card:opacity-100 after:top-0 after:right-0 after:left-0 after:bottom-0 after:absolute after:transition-opacity after:bg-[linear-gradient(95deg,#1D3149_0%,rgba(29,49,73,0.55)_50%,#1D3149_100%)]"
            ></div>

            <div class="size-14 border-4 border-[#3BA4F0]/10 rounded-full z-10">
              <img
                src={youtuber.icon}
                alt="Youtuber Icon"
                class="rounded-full size-full"
              />
            </div>
            <div class="flex flex-col justify-center gap-1.5 z-10">
              <div class="flex items-center gap-1.5">
                <p class="text-lg font-medium leading-none">{youtuber.name}</p>
                <Youtube class="size-6 text-[#FE0000]" />
                <p
                  class="bg-[#772DFF]/20 text-[#9256FF] rounded-full py-0.5 px-2 font-semibold text-sm"
                >
                  Bloxfruits
                </p>
              </div>

              <p class="font-medium text-[#809BB5] leading-none">
                {youtuber.tag} • {youtuber.subs} subscribers
              </p>
            </div>
          </a>
        {/each}
      </Marquee>
    </div>
  </div>

  <!-- Our Best Sellers -->
  <div
    class="max-w-[1400px] w-full flex justify-center flex-col py-16 md:py-24 px-4 sm:px-6"
  >
    <div class="flex flex-col items-center max-w-[660px] mx-auto">
      <div class="flex items-center gap-1.5">
        <PhosphorFlame class="size-8 text-[#3BA4F0]" />
        <h2 class="font-extrabold text-[32px] leading-none">
          Our <span class="text-[#3BA4F0]">Best Sellers</span>
        </h2>
        <PhosphorFlame class="size-8 text-[#3BA4F0]" />
      </div>
      <p
        class="text-[#809BB5] text-lg font-medium my-4 leading-none text-center"
      >
        {translations[$languageStore].bestSellersDescription}
      </p>
    </div>

    <div class="flex flex-col gap-6 mt-4">
      {#each ourGames.filter((game) => game.ready && data.productsCount[game.name] && data.productsCount[game.name] > 0) as game, i}
        <div
          class="flex max-sm:flex-col {i % 2 == 1
            ? 'md:flex-row-reverse'
            : ''} gap-6"
        >
          <div
            class="shrink-0 p-5 min-w-[260px] rounded-xl flex flex-col justify-between overflow-hidden relative"
            style="background: linear-gradient(254.73deg, rgba(16, 18, 29, 0.8) 0.18%, #10121D 85.87%), linear-gradient(0deg, rgba({game.gradient}, 0.8), rgba({game.gradient}, 0.8)), url({game.image}), #10121D; background-repeat: no-repeat; background-size: cover; background-position: center;"
          >
            <div class="relative w-full md:w-64 h-36">
              <img
                src={game.logo}
                class="absolute top-0 left-0 rounded-lg opacity-50 pointer-events-none select-none size-full blur-xl"
              />
              <img
                src={game.logo}
                class="relative z-10 object-cover rounded-lg pointer-events-none select-none size-full"
              />
            </div>
            <div class="px-2">
              <p
                class="font-bold text-xl leading-none mt-3 {i % 2 == 1
                  ? 'text-right'
                  : 'text-left'}"
              >
                {game.title}
              </p>
              <p
                class="font-semibold text-[#809BB5] leading-none mt-0.5 {i %
                  2 ==
                1
                  ? 'text-right'
                  : 'text-left'}"
              >
                {data.productsCount[game.name]} items
              </p>
              <Button
                to="/store/{game.name}"
                variant="contained"
                color="gray"
                class="w-full bg-[#1D2535]/45 backdrop-blur-md"
                wrapperClass="mt-2.5"
              >
                {#if i % 2 == 1}
                  <RoundedArrowRight class="size-4 mr-1.5 -scale-x-100" />
                {/if}
                {translations[$languageStore].viewAll}
                {#if i % 2 == 0}
                  <RoundedArrowRight class="size-4 ml-1.5" />
                {/if}
              </Button>
            </div>
          </div>
          <div class="flex-1 overflow-x-auto">
            <div class="grid grid-cols-5 gap-4 flex-1 min-w-[1000px]">
              {#each (data.games?.[game.name]?.products || []).slice(0, 5) as { title, image, price, comparePrice, variantId, inStock, category, description, askBeforeBuy, rarity }}
                <WholeItem
                  {title}
                  {image}
                  {category}
                  {rarity}
                  game={game.name}
                  {price}
                  {comparePrice}
                  itemSize={136}
                  to={`/store/${game.name}`}
                />
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div
    class="max-w-[1400px] w-full flex justify-center flex-col pb-16 md:pb-24 px-4 sm:px-6"
  >
    <h2 class="font-extrabold text-[32px] leading-none text-center">
      {translations[$languageStore].whyChooseTitle}
      <span class="text-[#3BA4F0]">BloxyFruit?</span>
    </h2>
    <p
      class="text-[#809BB5] text-lg font-medium max-w-[750px] my-4 mx-auto leading-none text-center"
    >
      {translations[$languageStore].whyChooseDescription}
    </p>

    <div
      class="grid grid-cols-1 mt-8 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12"
    >
      {#each translations[$languageStore].whyUs as reason, i}
        <div
          class="rounded-xl p-6 relative {i == 2 ? 'max-md:sm:col-span-2' : ''}"
          style="background: linear-gradient(125.74deg, rgba(22, 26, 41, 0.65) 0%, rgba(22, 26, 41, 0.5525) 50%, rgba(22, 26, 41, 0.65) 100%)"
        >
          <div
            class="absolute top-0 left-0 overflow-hidden size-full rounded-xl"
          >
            <img
              src="/assets/circle-pattern.webp"
              class="size-[340px] top-[-200px] left-[-200px] mix-blend-overlay select-none pointer-events-none absolute"
            />
            <img
              src="/assets/circle-pattern.webp"
              class="size-[340px] bottom-[-200px] right-[-200px] mix-blend-overlay select-none pointer-events-none absolute"
            />
          </div>

          <HoverCard
            class="absolute top-0 left-0 overflow-hidden size-full rounded-xl"
            gradientColor="#3ba4f030"
            gradientSize="190"
          ></HoverCard>

          <div
            class="select-none pointer-events-none absolute left-6 -top-5 size-20 rounded-xl flex items-center justify-center ring ring-offset-0 ring-[#3BA4F0]/5"
            style="background: linear-gradient(180deg, rgba(22, 26, 41, 0) 0%, rgba(59, 164, 240, 0.15) 100%), linear-gradient(134.39deg, rgba(22, 26, 41, 0.55) 0%, rgba(22, 26, 41, 0.3685) 50%, rgba(22, 26, 41, 0.55) 100%)"
          >
            <img src={reason.icon} class="size-5/6" />
          </div>
          <p class="text-xl font-bold mt-14">{reason.title}</p>
          <p class="font-medium">{reason.description}</p>
        </div>
      {/each}
    </div>
  </div>

  <div
    class="bg-[#3BA4F0]/4 w-full flex flex-col items-center py-12 overflow-hidden"
  >
    <div
      class="max-w-[1400px] w-full flex items-center justify-center flex-col px-4 sm:px-6"
    >
      <h2 class="font-extrabold text-[32px] leading-none text-center">
        {translations[$languageStore].faqTitle}
        <span class="text-[#3BA4F0]"
          >{translations[$languageStore].faqTitle2}</span
        >
      </h2>
      <p
        class="text-[#809BB5] text-lg font-medium max-w-[840px] my-4 leading-none text-center"
      >
        {translations[$languageStore].faqDescription}
      </p>

      <Faq />
    </div>
  </div>
</div>
