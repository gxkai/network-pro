<script lang="ts" setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['close'])
const data = reactive({
  showModal: false,
  showBackdrop: false,
  showContent: false,
  backdropLeaving: false,
  cardLeaving: false,
  isInside: false,
})
const { showModal, backdropLeaving, cardLeaving, showBackdrop, showContent, isInside } = toRefs(data)
const leaving = computed(() => {
  return data.backdropLeaving || data.cardLeaving
})
function show() {
  data.showModal = true
  data.showBackdrop = true
  data.showContent = true
}
function close(isInside = true) {
  data.isInside = isInside
  data.showBackdrop = false
  data.showContent = false
}
onMounted(() => {
  const onEscape = (e) => {
    if (props.open && e.keyCode === 27)
      close()
  }
  document.addEventListener('keydown', onEscape)
  onUnmounted(() => {
    document.removeEventListener('keydown', onEscape)
  })
})
watch(() => props.open, (newValue) => {
  if (newValue)
    show()
  else
    close(false)
}, {
  immediate: true,
})
watch(leaving, (newValue) => {
  if (newValue === false)
    data.showModal = false
  else
    data.isInside && emit('close')
}, {})
</script>

<template>
  <portal to="modals">
    <div
      v-if="showModal"
      class="fixed px-4 pb-4 inset-0 flex items-center justify-center z-50"
    >
      <transition
        enter-active-class="transition duration-200 ease-in-out"
        leave-active-class="transition duration-200 ease-in-out"
        enter-class="opacity-0"
        leave-to-class="opacity-0"
        appear
        @before-leave="backdropLeaving = true"
        @after-leave="backdropLeaving = false"
      >
        <div v-if="showBackdrop">
          <div class="fixed inset-0 bg-black opacity-25" @click="close()" />
        </div>
      </transition>
      <transition
        enter-active-class="transition duration-200 ease-in-out"
        leave-active-class="transition duration-200 ease-in-out"
        enter-class="opacity-0 transform scale-75"
        leave-to-class="opacity-0 transform scale-75"
        appear
        @before-leave="cardLeaving = true"
        @after-leave="cardLeaving = false"
      >
        <template v-if="showContent">
          <slot />
        </template>
      </transition>
    </div>
  </portal>
</template>
