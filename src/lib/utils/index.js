import { cubicOut } from "svelte/easing"
import numeral from "numeral"

export function alpha(color, opacity) {
  if (color.length > 7)
      color = color.substring(0, color.length - 2)

  const _opacity = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)
  let opacityHex = _opacity.toString(16).toUpperCase()

  if (opacityHex.length == 1)
      opacityHex = "0" + opacityHex

  return color + opacityHex
}

export const flyAndScale = (
  node,
  params = { y: -8, x: 0, start: 0.95, duration: 150 }
) => {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;
 
  const scaleConversion = (valueA, scaleA, scaleB) => {
    const [minA, maxA] = scaleA
    const [minB, maxB] = scaleB
 
    const percentage = (valueA - minA) / (maxA - minA)
    const valueB = percentage * (maxB - minB) + minB
 
    return valueB
  }
 
  const styleToString = (style) => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str
      return str + key + ":" + style[key] + ";"
    }, "")
  }
 
  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);
 
      return styleToString({
        transform:
          transform +
          "translate3d(" +
          x +
          "px, " +
          y +
          "px, 0) scale(" +
          scale +
          ")",
        opacity: t,
      });
    },
    easing: cubicOut,
  }
}

export function bgBlur(props) {
  const color = props.color != null ? props.color : '#000000'
  const blur = props.blur != null ? props.blur : 6
  const opacity = props.opacity != null ? props.opacity : 0.8
  const imgUrl = props.opacity != null && props.imgUrl

  if (imgUrl) {
    return {
      position: 'relative',
      backgroundImage: `url(${imgUrl})`,
      '&:before': {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9,
        content: '""',
        width: '100%',
        height: '100%',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: alpha(color, opacity),
      },
    };
  }
  
  return `backdrop-filter: blur(${blur}px); -webkit-backdrop-filter: blur(${blur}px); background-color: ${alpha(color, opacity)}`
}

export const languages = {
  EN: { name: "English" },
  ES: { name: "Español" },
  FR: { name: "Français" },
}

export const currencies = {
  USD: { name: "US Dollar", symbol: "$", placement: "before" },
  EUR: { name: "Euro", symbol: "€", placement: "before" },
  JPY: { name: "Japanese Yen", symbol: "¥", placement: "before" },
  GBP: { name: "British Pound", symbol: "£", placement: "before" },
  AUD: { name: "Australian Dollar", symbol: "A$", placement: "before" },
  CAD: { name: "Canadian Dollar", symbol: "CA$", placement: "before" },
  CHF: { name: "Swiss Franc", symbol: "CHF", placement: "before" },
  CNY: { name: "Chinese Yuan", symbol: "CN¥", placement: "before" },
  SEK: { name: "Swedish Krona", symbol: "kr", placement: "after" },
  NZD: { name: "New Zealand Dollar", symbol: "NZ$", placement: "before" },
  MXN: { name: "Mexican Peso", symbol: "MX$", placement: "before" },
  SGD: { name: "Singapore Dollar", symbol: "S$", placement: "before" },
  HKD: { name: "Hong Kong Dollar", symbol: "HK$", placement: "before" },
  NOK: { name: "Norwegian Krone", symbol: "kr", placement: "after" },
  KRW: { name: "South Korean Won", symbol: "₩", placement: "before" },
  TRY: { name: "Turkish Lira", symbol: "₺", placement: "before" },
  RUB: { name: "Russian Ruble", symbol: "₽", placement: "after" },
  INR: { name: "Indian Rupee", symbol: "₹", placement: "before" },
  BRL: { name: "Brazilian Real", symbol: "R$", placement: "before" },
  ZAR: { name: "South African Rand", symbol: "R", placement: "before" },
  SAR: { name: "Saudi Riyal", symbol: "ر.س", placement: "before" },
  AED: { name: "UAE Dirham", symbol: "د.إ", placement: "before" },
  THB: { name: "Thai Baht", symbol: "฿", placement: "before" },
  MYR: { name: "Malaysian Ringgit", symbol: "RM", placement: "before" },
  IDR: { name: "Indonesian Rupiah", symbol: "Rp", placement: "before" },
  PHP: { name: "Philippine Peso", symbol: "₱", placement: "before" },
  ILS: { name: "Israeli New Shekel", symbol: "₪", placement: "before" },
  PLN: { name: "Polish Zloty", symbol: "zł", placement: "after" },
  ARS: { name: "Argentine Peso", symbol: "$", placement: "before" },
  CLP: { name: "Chilean Peso", symbol: "$", placement: "before" },
  COP: { name: "Colombian Peso", symbol: "$", placement: "before" },
  EGP: { name: "Egyptian Pound", symbol: "£", placement: "before" },
  PKR: { name: "Pakistani Rupee", symbol: "₨", placement: "before" },
  VND: { name: "Vietnamese Dong", symbol: "₫", placement: "after" },
  BDT: { name: "Bangladeshi Taka", symbol: "৳", placement: "before" },
  PEN: { name: "Peruvian Sol", symbol: "S/", placement: "before" },
  NGN: { name: "Nigerian Naira", symbol: "₦", placement: "before" },
  GHS: { name: "Ghanaian Cedi", symbol: "₵", placement: "before" },
  KES: { name: "Kenyan Shilling", symbol: "KSh", placement: "before" },
  HUF: { name: "Hungarian Forint", symbol: "Ft", placement: "after" },
  RON: { name: "Romanian Leu", symbol: "lei", placement: "after" }
}

export const formatNumber = (value) => {
  return value >= 1000
    ? numeral(value).format("0,0.0")
    : numeral(value).format("0,0.00")
}

export const formatCurrency = (value, currencyCode) => {
  const currencyInfo = currencies[currencyCode]
  const { symbol, placement } = currencyInfo

  const formattedValue = formatNumber(value)

  return placement === "before"
    ? `${symbol}${formattedValue}`
    : `${formattedValue} ${symbol}`
}

export const lazyLoad = (image, options = {}) => {
  const { src, opacity = "1" } = typeof options === 'object' ? options : { src: options }
  
  const loaded = () => {
    image.style.opacity = opacity
    image.parentNode.classList.remove("animate-pulse")
  }

  const update = (newSrc) => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        image.src = newSrc;
        if (image.complete) {
          loaded()
        } else {
          image.addEventListener('load', loaded)
        }
      }
    }, {
      root: null,
      rootMargin: "0px",
      threshold: 0
    })
    observer.observe(image)
  }
  
  if (src) update(src)

  return {
    destroy() {
      image.removeEventListener('load', loaded)
    },
    update(newOptions) {
      const { src: newSrc, opacity: newOpacity = "0" } = typeof newOptions === 'object' ? newOptions : { src: newOptions }
      if (newOpacity) image.style.opacity = newOpacity
      if (newSrc) update(newSrc)
    }
  }
}

export const categorizeProducts = (products, order) => {
  const categorizedProducts = {}, bestSellers = []
  
  // Create categories
  for (const category of order) {
    categorizedProducts[category] = []
  }
  
  // Categorize items & clean up the category tag
  for (const product of products) {
    const modifiedProduct = { ...product }

    // Categorize the product
    const category = modifiedProduct.category
    if (!category) continue

    if (!categorizedProducts[category]) {
      categorizedProducts[category] = []
    }
    categorizedProducts[category].push(modifiedProduct)
  }
  
  // Sort each category by popularity
  for (const category of Object.keys(categorizedProducts)) {
    categorizedProducts[category].sort((a, b) => b.popularity - a.popularity)
  }

  // Best sellers, it gets (topPerCategory) from each category
  const topPerCategory = 2
  const bestSellerCandidates = []
  
  for (const category of Object.keys(categorizedProducts)) {
    const topItems = categorizedProducts[category]
      .slice(0, topPerCategory)
      .map(item => ({ ...item, category }))
      
    bestSellerCandidates.push(...topItems)
  }
  
  bestSellers.push(...bestSellerCandidates
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10)
  )
  
  categorizedProducts["Best Sellers"] = bestSellers
  return categorizedProducts
}

export const filterAndSortCategories = (query, categories, minPrice, maxPrice, rarities, sortBy) => {
  const enabledRarities = rarities
    .filter(rarity => rarity.enabled)
    .map(rarity => rarity.name)

  const filteredCategories = {}

  for (const [categoryName, items] of Object.entries(categories)) {
    const filteredItems = items.filter(item => {
      const isWithinPriceRange = item.price >= minPrice && item.price <= maxPrice
      const isRarityEnabled = enabledRarities.includes(item.rarity)
      const isWithinQuery = item.title.toLowerCase().includes(query.toLowerCase())

      return isWithinPriceRange && isRarityEnabled && isWithinQuery
    })

    if (filteredItems.length > 0) {
      if (sortBy === "ascending") {

        filteredItems.sort((a, b) => b.price - a.price) // High - Low
      } else if (sortBy === "descending") {
        filteredItems.sort((a, b) => a.price - b.price) // Low - High
      } else if (sortBy === "popularity") {
        filteredItems.sort((a, b) => b.popularity - a.popularity) // Popularity
      }

      filteredCategories[categoryName] = filteredItems
    }
  }

  return filteredCategories
}