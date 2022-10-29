<script lang="ts" setup>
import FileSaver from 'file-saver'
import dayjs from 'dayjs'
import Button from '@/components/base/Button.vue'

import FileExportIcon from '@/assets/file-export.svg'
import { isPromise } from '@/utils'
const props = defineProps({
  value: {
    required: true,
  },
  name: {
    required: true,
  },
})
const exported = ref(false)
const content = computed(() => {
  return exported.value ? 'Exported!' : 'Export'
})
async function onExport() {
  const fileContent = isPromise(props.value) ? await props.value : props.value
  const blob = new Blob([fileContent as BlobPart], { type: 'text/plain;charset=utf-8' })
  FileSaver.saveAs(blob, `${dayjs().format('YYYYMMDDHHmmss')}_${props.name}.txt`)
}
</script>

<template>
  <Button v-tooltip.bottom="{ content }" @click.stop="onExport">
    <FileExportIcon class="h-4 w-4" />
  </Button>
</template>
