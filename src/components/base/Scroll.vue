<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useStore } from '~/store'
import { colors } from '~/constants'

const props = defineProps({
  scrollingX: {
    type: Boolean,
    default: true,
  },
})

const { gray } = colors
const store = useStore()
const { state } = storeToRefs(store)
const options = computed(() => {
  return {
    dark: {
      bar: {
        background: gray['800'],
      },
      scrollPanel: {
        scrollingX: props.scrollingX,
      },
    },
    light: {
      bar: {
        background: gray['250'],
      },
      scrollPanel: {
        scrollingX: props.scrollingX,
      },
    },
  }
})
</script>

<template>
  <vue-scroll
    v-if="state.settings.colorTheme === 'dark'"
    key="dark"
    :ops="options.dark"
  >
    <slot />
  </vue-scroll>
  <vue-scroll v-else key="light" :ops="options.light">
    <slot />
  </vue-scroll>
</template>
