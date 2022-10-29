<script lang="ts" setup>
import Params from '@/components/Params.vue'
import ChevronUp from '@/assets/chevron-up.svg'
import ChevronDown from '@/assets/chevron-down.svg'
import { LJ } from '~/utils'
// 2.5rem
const props = defineProps({
  entry: {
    type: Object,
  },
})
const emit = defineEmits(['toggled'])
const HEIGHT_COLLAPSED = 2.5 * 16
const data = reactive({
  show: false,
  toggled: false,
  resizeObserver: null as any,
})
const root = ref<HTMLElement | null>(null)
const methods = {
  toggle() {
    data.show = !data.show
    emit('toggled', data.show)
  },
  observeHeight() {
    data.resizeObserver = new ResizeObserver(([entry]) => {
      data.show = entry.contentRect.height !== HEIGHT_COLLAPSED
    })
    data.resizeObserver.observe(root.value)
  },
}
const params = computed(() => {
  return props.entry?.request.params
})
const body = computed(() => {
  return LJ.stringify(props.entry?.request.body, undefined, 2)
})
const variables = computed(() => {
  return LJ.stringify(props.entry?.request.variables, undefined, 2)
})
onMounted(() => {
  methods.observeHeight()
})
const { toggle, observeHeight } = methods
const { show, resizeObserver, toggled } = toRefs(data)
</script>

<template>
  <div ref="root" class="variables-block flex flex-col">
    <div
      class="flex justify-between flex-shrink-0 h-10 items-center px-3 group cursor-pointer border-t border-gray-200 dark:border-gray-750"
      @click="toggle"
    >
      <div
        class="flex items-center flex-shrink-0 text-gray-550 dark:text-gray-600 group-hover:text-gray-800 dark:group-hover:text-gray-400"
      >
        <span class="font-bold uppercase">
          {{ entry.type === 'GQL' ? 'Variables' : 'Body' }}
        </span>
        <ChevronDown v-if="show" class="h-5" />
        <ChevronUp v-else class="h-5" />
      </div>
      <div class="flex items-center overflow-hidden space-x-1">
        <div
          v-if="entry.type !== 'GQL'"
          class="whitespace-nowrap overflow-auto hide-scrollbar ml-2 text-gray-500 dark:text-gray-600"
        >
          {{ entry.request.mimeType }}
        </div>
        <CopyButton :value="params || variables || body" />
      </div>
    </div>
    <div v-if="entry" class="relative flex-grow overflow-hidden">
      <Scroll v-if="params">
        <Params :items="params" class="px-3 pb-3" />
      </Scroll>
      <codemirror v-else :value="variables || body" :options="{}" class="ml-1 h-full" />
    </div>
  </div>
</template>
