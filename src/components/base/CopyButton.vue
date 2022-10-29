<script lang="ts" setup>
import useClipboard from 'vue-clipboard3'
import Button from '@/components/base/Button.vue'

import CopyIcon from '@/assets/copy.svg'
import { isPromise, notyf } from '@/utils'
const props = defineProps({
  value: {
    required: true,
  },
})
const { toClipboard: copy } = useClipboard()

async function onCopy() {
  await copy((isPromise(props.value) ? await props.value : props.value) as string)
  notyf.success('Copied')
}
</script>

<template>
  <Button v-tooltip.bottom="{ content: () => value }" @click.stop="onCopy">
    <CopyIcon class="h-4 w-4" />
  </Button>
</template>
