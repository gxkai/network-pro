<script lang="ts" setup>
import { stringify } from 'lossless-json'
import Headers from '@/components/Headers.vue'
import Code from '@/components/Code.vue'
import TopBar from '@/components/TopBar.vue'
import ErrorImg from '@/assets/error.svg'
import CodeImg from '@/assets/code.svg'
const props = defineProps({
  entry: {
    type: Object,
  },
})
const data = reactive({
  data: '',
  activeView: 'data',
  parseError: null,
})
const viewButtons = computed(() => {
  return [
    {
      title: 'DATA',
      name: 'data',
    },
    {
      title: 'HEADERS',
      name: 'headers',
    },
  ]
})
watch(() => props.entry, async () => {
  if (!props.entry)
    return

  data.parseError = null

  try {
    const { data: _data, errors } = await props.entry.response.getResponse()
    data.data = stringify({
      url: props.entry?.request?.url,
      result: errors || _data,
    }, undefined, 2) ?? ''
  }
  catch (e: any) {
    data.parseError = e.message
  }
}, {
  immediate: true,
})
const codeRef = ref<any>()
const toggleSearch = () => {
  codeRef.value.toggleSearch()
}
</script>

<template>
  <div class="response-block w-full flex flex-col group">
    <TopBar
      v-model="data.activeView"
      :items="viewButtons"
      :color="entry.response.isError ? 'red-500' : 'green-400'"
      :copy-value="data.activeView === 'data' ? data.data : JSON.stringify(entry.response.headers, null, 2)"
      :show-search="data.activeView === 'data'"
      @toggleSearch="toggleSearch"
    >
      <template #left>
        <div class="flex overflow-auto flex-shrink-0">
          <div
            v-if="entry.response.status"
            class="text-xs text-gray-550 dark:text-gray-500 ml-3"
          >
            {{ entry.response.status }} {{ entry.response.statusMessage }}
          </div>
          <div class="text-xs text-gray-550 dark:text-gray-500 ml-3">
            {{ entry.time.toFixed(2) }} ms
          </div>
        </div>
      </template>
      <template #right>
        <div
          v-if="entry.type !== 'GQL'"
          class="whitespace-nowrap overflow-auto hide-scrollbar ml-2 text-gray-500 dark:text-gray-600"
        >
          {{ entry.response.mimeType }}
        </div>
      </template>
    </TopBar>
    <div class="relative flex-grow overflow-hidden">
      <template v-if="data.activeView === 'data'">
        <div
          v-if="entry.response.networkError"
          class="flex flex-grow justify-center items-center h-full"
        >
          <div class="flex flex-col items-center">
            <ErrorImg class="h-40" />
            <span
              class="inline-block mt-4 text-gray-800 dark:text-gray-500"
            >{{ entry.response.networkError }}</span>
          </div>
        </div>
        <div v-else-if="data.parseError" class="flex flex-grow justify-center items-center h-full">
          <div class="flex flex-col items-center">
            <CodeImg class="h-40" />
            <span
              class="inline-block mt-4 text-gray-800 dark:text-gray-500"
            >{{ entry.response.mimeType }}</span>
            <span class="inline-block text-gray-500 dark:text-gray-700">{{ data.parseError }}</span>
          </div>
        </div>
        <template v-else>
          <Code ref="codeRef" :value="data.data" class="ml-1" />
        </template>
      </template>
      <Headers v-else-if="data.activeView === 'headers'" :items="entry.response.headers" />
    </div>
  </div>
</template>
