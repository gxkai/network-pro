import { defineStore } from 'pinia'
export const useStore = defineStore('store', () => {
  const state = reactive({
    lastState: {
      clearedAt: null,
      activeView: 'ALL',
      variablesOpened: true,
    },
    settings: {
      colorMode: 'Auto',
      colorTheme: 'dark',
      sortOption: 'oldest',
      origin: '',
      token: '',
    },
    typeColors: {
      GQL: 'pink-500', // bg-pink-500 text-pink-500 group-hover:bg-pink-500
      QUERY: 'green-500', // bg-green-500 text-green-500 group-hover:bg-green-500
      MUTATION: 'purple-500', // bg-purple-500 text-purple-500 group-hover:bg-purple-500
      GET: 'blue-500', // bg-blue-500 text-blue-500 group-hover:bg-blue-500
      POST: 'indigo-500', // bg-indigo-500 text-indigo-500 group-hover:bg-indigo-500
      PUT: 'indigo-500', // bg-indigo-500 text-indigo-500 group-hover:bg-indigo-500
      PATCH: 'indigo-500', // bg-indigo-500 text-indigo-500 group-hover:bg-indigo-500
      DELETE: 'rose-500', // bg-rose-500 text-rose-500 group-hover:bg-rose-500
    },
  })
  return {
    state,
    setSettings(settings) {
      state.settings = {
        ...state.settings,
        ...settings,
      }

      if (settings.colorMode) {
        state.settings.colorTheme
            = settings.colorMode === 'Auto'
            ? browser.devtools.panels.themeName === 'dark'
              ? 'dark'
              : 'light'
            : settings.colorMode.toLowerCase()
      }
    },
    setLastState(lastState) {
      state.lastState = {
        ...state.lastState,
        ...lastState,
      }
    },
  }
}, {
  persist: true,
})
