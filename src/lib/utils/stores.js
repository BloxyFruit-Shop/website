import { writable } from 'svelte/store'
import Cookies from 'js-cookie'

const createLanguageStore = () => {
  const initValue = Cookies.get("lang") || "EN"

  const { subscribe, set, update } = writable(initValue)

  return {
    subscribe,
    set: (value) => {
      Cookies.set('lang', value)
      set(value)
    },
    update
  }
}

const createCurrencyStore = () => {
  const initValue = Cookies.get("curr") || "USD"

  const { subscribe, set, update } = writable(initValue)

  return {
    subscribe,
    set: (value) => {
      Cookies.set('curr', value)
      set(value)
    },
    update
  }
}
 
export const languageStore = createLanguageStore()
export const currencyStore = createCurrencyStore()
export const currencyRateStore = writable(1)