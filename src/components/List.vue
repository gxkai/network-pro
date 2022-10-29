<script lang="ts" setup>
// @ts-expect-error
import fuzzysearch from 'fuzzysearch'

import { storeToRefs } from 'pinia'
import BanIcon from '@/assets/ban-icon.svg'
import { useStore } from '~/store'

const props = defineProps({
  modelValue: {
    type: [Number, String],
  },
  entries: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue', 'clear'])
const ACTIVE_METHODS = {
  GQL: ['GQL'],
  XHR: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}
const data = reactive({
  keyword: '',
  activeView: 'ALL',
  viewButtons: [
    {
      title: 'ALL',
      name: 'ALL',
      label: 'All requests',
    },
    {
      title: 'GQL',
      name: 'GQL',
      label: 'GraphQL',
    },
    {
      title: 'XHR',
      name: 'XHR',
      label: 'XHR and Fetch',
    },
  ],
})
const store = useStore()
const { state } = storeToRefs(store)
const { setSettings, setLastState } = store

data.activeView = state.value.lastState.activeView
const filteredEntries = computed(() => {
  return props.entries
    .filter(entry => entry)
  // @ts-expect-error
    .filter(({ type, request }) => {
      if (type === 'GQL') {
        return request.operations.some(name =>
          fuzzysearch(
            data.keyword.toLowerCase(),
                  `${request.name}: ${name}`.toLowerCase(),
          ),
        )
      }
      else {
        return fuzzysearch(
          data.keyword.toLowerCase(),
          request.name.toLowerCase(),
        )
      }
    })
    .filter(
      // @ts-expect-error
      ({ type }) =>
        data.activeView === 'ALL'
              || ACTIVE_METHODS[data.activeView].includes(type),
    )
    .sort((a, b) =>
    // @ts-expect-error
      state.value.settings.sortOption === 'newest' ? b.id - a.id : a.id - b.id,
    )
})
const methods = {
  getColor(entry) {
    return state.value.typeColors[entry.type === 'GQL' ? entry.request.operationType.toUpperCase() : entry.type]
  },
  changeView() {
    const hasTarget = filteredEntries.value.find(
      // @ts-expect-error
      item => item.id === props.modelValue,
    )

    setLastState({
      activeView: data.activeView,
    })

    if (!hasTarget) {
      emit(
        'update:modelValue',
        // @ts-expect-error
        filteredEntries.value.length ? filteredEntries.value?.[0]?.id : null,
      )
    }
  },
  clear() {
    emit('clear')
  },
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center flex-shrink-0 h-10 px-3">
      <input
        v-model="data.keyword"
        type="text"
        class="py-1 px-2 text-xs rounded-sm dark:text-white dark:bg-gray-900 border-gray-250 dark:border-gray-750 w-full placeholder-gray-600"
        placeholder="Filter"
      >
    </div>
    <div
      v-if="!entries.length"
      class="flex flex-grow justify-center items-center p-4 h-full text-center text-gray-600"
    >
      Waiting for requests...
    </div>
    <div
      v-else-if="!filteredEntries.length"
      class="flex flex-grow justify-center items-center p-4 h-full text-center text-gray-600"
    >
      <span>No results found {{ data.keyword ? `for "${data.keyword}"` : '' }}</span>
    </div>
    <Scroll v-else :scrolling-x="false">
      <ul class="block flex-grow pt-1">
        <li
          v-for="entry in filteredEntries"
          :key="entry.id"
          v-tooltip.bottom="{ content: entry.request.url }"
          class="relative group flex items-center px-3 py-2 cursor-pointer hover:text-gray-800 dark:hover:text-white truncate"
          :class="[
            modelValue === entry.id
              ? 'text-gray-850 bg-gray-150 dark:text-white dark:bg-gray-800'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-150 dark:hover:bg-gray-800 dark:hover:text-gray-300',
            {
              'text-red-500 dark:text-red-400 hover:text-red-500 dark:hover:text-red-400':
                entry.response.isError,
            },
          ]"
          @click="emit('update:modelValue', entry.id)"
        >
          <span class="font-semibold ml-2">
            {{ entry.type === 'GQL' && !entry.request.name ? entry.request.operations.join(', ') : entry.request.name?.split('/')?.at(-1) || '/' }}
          </span>
          <!--          <span class="font-normal opacity-50">{{ entry.request.queryString }}</span> -->
        </li>
      </ul>
    </Scroll>
    <div
      class="flex justify-between items-center flex-shrink-0 h-10 px-3 border-t border-gray-200 dark:border-gray-750"
    >
      <ButtonGroup
        v-model="data.activeView"
        :items="data.viewButtons"
        active-bg-class="bg-gray-500 dark:bg-gray-700"
        class="flex-shrink-0"
        @input="methods.changeView"
      />
      <button
        v-if="filteredEntries.length"
        class="flex h-10 w-10 justify-center items-center -mr-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-400 focus:outline-none"
        @click="methods.clear"
      >
        <BanIcon v-tooltip="'Clear'" class="h-5 w-5 focus:outline-none" />
      </button>
    </div>
  </div>
</template>
