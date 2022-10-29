<script lang="ts" setup>
import SparklesIcon from '@/assets/sparkles.svg'
import DesktopIcon from '@/assets/desktop.svg'
import SunIcon from '@/assets/sun.svg'
import MoonIcon from '@/assets/moon.svg'
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  settings: {
    type: Object,
    default: () => ({
      colorMode: 'Auto',
    }),
  },
  entry: {
    type: Object,
  },
})
const emit = defineEmits(['update:open', 'update:settings'])
const data = reactive({
  sortOptions: [
    {
      title: 'Newest first',
      name: 'newest',
    },
    {
      title: 'Oldest first',
      name: 'oldest',
    },
  ],
  colorModes: [
    {
      icon: h(SparklesIcon),
      title: 'Auto',
      name: 'Auto',
    },
    {
      icon: h(SunIcon),
      title: 'Light',
      name: 'Light',
    },
    {
      icon: h(MoonIcon),
      title: 'Dark',
      name: 'Dark',
    },
  ],
  currentSortOption: 'newest',
  currentColorMode: 'Auto',
  origin: '',
  token: '',
})
data.currentColorMode = props.settings.colorMode
data.currentSortOption = props.settings.sortOption
data.origin = props.settings.origin
const methods = {
  changeColorMode(value) {
    data.currentColorMode = value
    methods.updateSettings('colorMode', value)
  },
  changeSortOption(value) {
    data.currentSortOption = value
    methods.updateSettings('sortOption', value)
  },
  changeOrigin(value) {
    data.origin = value
    methods.updateSettings('origin', value)
  },
  changeToken(value) {
    data.token = value
    methods.updateSettings('token', value)
  },
  updateSettings(name, value) {
    emit('update:settings', {
      ...props.settings,
      [name]: value,
    })
  },
}
</script>

<template>
  <Modal :open="open" @close="emit('update:open', !open)">
    <div
      class="w-full max-w-sm mx-auto rounded p-6 z-50 space-y-4 shadow-lg bg-white dark:bg-gray-850"
    >
      <div>
        <h2 class="text-sm text-gray-600 dark:text-gray-400">
          Theme
        </h2>
        <ButtonGroup
          v-slot="{ item }"
          v-model="data.currentColorMode"
          :items="data.colorModes"
          size="large"
          active-bg-class="bg-indigo-700"
          class="flex flex-shrink-0 w-full mt-2"
          @update:modelValue="methods.changeColorMode"
        >
          <component :is="item.icon" class="w-3 h-3" />
          <span class="ml-1">{{ item.title }}</span>
        </ButtonGroup>
      </div>
      <div>
        <h2 class="text-sm text-gray-600 dark:text-gray-400">
          Sorting
        </h2>
        <ButtonGroup
          v-slot="{ item }"
          v-model="data.currentSortOption"
          :items="data.sortOptions"
          size="large"
          active-bg-class="bg-gray-500 dark:bg-gray-700"
          class="flex flex-shrink-0 w-full mt-2"
          @input="methods.changeSortOption"
        >
          <span class="ml-1">{{ item.title }}</span>
        </ButtonGroup>
      </div>
      <template v-if="entry.type !== 'GQL'">
        <div>
          <h2 class="text-sm text-gray-600 dark:text-gray-400">
            origin
          </h2>
          <input v-model="data.origin" type="url" class="w-full mt-2" @input="e => methods.changeOrigin(e.target.value)">
        </div>
        <div>
          <h2 class="text-sm text-gray-600 dark:text-gray-400">
            Token
          </h2>
          <input v-model="data.token" type="text" class="w-full mt-2" @input="e => methods.changeToken(e.target.value)">
        </div>
      </template>
    </div>
  </Modal>
</template>

<style>
</style>
