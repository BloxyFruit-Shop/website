<script>
  import "../app.css"
  import "svelte-ripple-action/ripple.css"
  import { Toasts } from "$lib/svoast"
  import { currencyStore, currencyRateStore } from "$lib/utils/stores"

  export let data
  $: $currencyRateStore = data.rate
</script>

<svelte:head>
  <meta name="theme-color" content="#3BA4F0" />
  <meta name="og:site_name" content="BloxyFruit.com" />
  <meta property="twitter:site" content="BloxyFruit.com" />
  <meta name="og:type" content="website" />
</svelte:head>

<Toasts position="bottom-right" />

<slot />