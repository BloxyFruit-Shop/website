import { onMount } from 'svelte'
import { writable } from 'svelte/store'

const localstorage = (key, initialValue) => {
  const store = writable(initialValue)

  onMount(() => {
    const storedValue = localStorage.getItem(key)
    if (storedValue !== null) {
      store.set(JSON.parse(storedValue))
    }

    const unsubscribe = store.subscribe(value => {
      if (value === undefined || value === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(value))
      }
    })

    return () => unsubscribe()
  })

  return store
}

export default localstorage