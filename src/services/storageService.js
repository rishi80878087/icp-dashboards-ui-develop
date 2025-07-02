// The class assumes the presence of a `formatKey` function which is not defined within the class.
// This function should take a `key` as an argument and return a formatted string key.
// Make sure to define this function externally to avoid errors.
function formatKey(name) {
  return `${window.location.host}_${name}`
}

class Storage {
  // Stores a value in `localStorage` under the specified key.
  // If `value` is not provided or if the method is called server-side (where `window` is `undefined`), nothing will be stored.
  static set(key, value) {
    if (typeof window === 'undefined') return
    if (!value) return
    return localStorage?.setItem(formatKey(key), JSON.stringify(value))
  }

  // Retrieves a value from `localStorage` by key.
  // If the key does not exist or if the method is called server-side, it will return `undefined`.
  static get(key) {
    if (typeof window === 'undefined') return
    if (!key) return
    const item = localStorage?.getItem(formatKey(key))
    if (!item) return
    return JSON.parse(item)
  }

  // Removes an item from `localStorage` by key.
  // If the key is not provided or if the method is called server-side, nothing will be removed.
  static remove(key) {
    if (typeof window === 'undefined') return
    if (!key) return
    return localStorage?.removeItem(formatKey(key))
  }

  // Clears all entries from `localStorage`.
  // If called server-side, nothing will be cleared.
  static removeAll() {
    if (typeof window === 'undefined') return
    return localStorage?.clear()
  }

  //sessionStoraage
  // Stores a value in `sessionStorage` under the specified key.
  // If `value` is not provided or if the method is called server-side, nothing will be stored.
  static sset(key, value) {
    if (typeof window === 'undefined') return
    if (!value) return
    return sessionStorage?.setItem(formatKey(key), JSON.stringify(value))
  }

  // Retrieves a value from `sessionStorage` by key.
  // If the key does not exist or if the method is called server-side, it will return `undefined`.
  static sget(key) {
    if (typeof window === 'undefined') return
    if (!key) return
    const item = sessionStorage?.getItem(formatKey(key))
    if (!item) return
    return JSON.parse(item)
  }

  // Removes an item from `sessionStorage` by key.
  // If the key is not provided or if the method is called server-side, nothing will be removed.
  static sremove(key) {
    if (typeof window === 'undefined') return
    if (!key) return
    return sessionStorage?.removeItem(formatKey(key))
  }

  // Clears all entries from `sessionStorage`.
  // If called server-side, nothing will be cleared.
  static sremoveAll() {
    if (typeof window === 'undefined') return
    return sessionStorage?.clear()
  }
}

export default Storage
  