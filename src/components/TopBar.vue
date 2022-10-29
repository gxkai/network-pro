<script lang="ts" setup>
import SearchIcon from '@/assets/search.svg'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'data',
  },
  color: {
    type: String,
    default: 'green-400',
  },
  items: {
    type: Array,
    default: () => [
      {
        title: 'DATA',
        name: 'data',
      },
      {
        title: 'HEADERS',
        name: 'headers',
      },
    ],
  },
  copyValue: {
    type: String,
    default: '',
  },
  fileExportValue: {},
  fileExportName: {
    type: String,
    default: '',
  },
  showSearch: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex justify-between h-10 items-center px-3 overflow-hidden flex-shrink-0">
    <div class="flex items-center flex-grow overflow-hidden">
      <ButtonGroup
        :model-value="modelValue"
        :items="items"
        :active-bg-class="`bg-${color}`"
        class="flex-shrink-0"
        @update:modelValue="emit('update:modelValue', $event)"
      />
      <slot name="left" />
    </div>
    <div class="flex items-center overflow-hidden space-x-1 flex-shrink-0">
      <slot name="right" />
      <Button v-if="showSearch" v-tooltip.bottom="'Find'" @click="emit('toggleSearch')">
        <SearchIcon class="h-4 w-4" />
      </Button>
      <CopyButton :value="copyValue" class="flex-shrink-0" />
      <FileExportButton :value="fileExportValue" :name="fileExportName" />
    </div>
  </div>
</template>
