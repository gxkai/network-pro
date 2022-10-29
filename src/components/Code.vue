<script lang="ts" setup>
import { CodeMirror } from 'codemirror-editor-vue3'
import ChevronUpIcon from '@/assets/chevron-up.svg'
import ChevronDownIcon from '@/assets/chevron-down.svg'
import CloseIcon from '@/assets/close.svg'
const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})
const data = reactive({
  searchOpened: false,
  keyword: '',
  lastKeyword: '',
  cursor: null as any,
  searchCount: 0,
  searchCurrent: 0,
})
const keywordRef = ref<HTMLElement>()
const cmEditorRef = ref<any>()
const methods = {
  toggleSearch() {
    data.searchOpened ? methods.closeSearch() : methods.openSearch()
  },
  openSearch() {
    data.searchOpened = true
    nextTick(() => keywordRef.value?.focus?.())
  },
  closeSearch() {
    const { cminstance: codemirror } = cmEditorRef.value

    data.searchOpened = false
    if (codemirror && data.searchCount) {
      methods.clearMarks()
      codemirror.setCursor(data.cursor.to())
      codemirror.focus()
    }
    data.lastKeyword = ''
    data.cursor = null
  },
  clearMarks() {
    const { cminstance: codemirror } = cmEditorRef.value
    codemirror.doc.getAllMarks().forEach(marker => marker.clear())
    data.searchCurrent = 0
    data.searchCount = 0
  },
  search(rev = false) {
    const { cminstance: codemirror } = cmEditorRef.value
    const caseFold = typeof data.keyword == 'string' && data.keyword === data.keyword.toLowerCase()

    if (data.keyword === data.lastKeyword && data.cursor) {
      if (!data.cursor.find(rev)) {
        data.cursor = codemirror.getSearchCursor(data.keyword, rev ? CodeMirror.Pos(codemirror.lastLine()) : CodeMirror.Pos(codemirror.firstLine()), { caseFold })
        if (!data.cursor.find(rev))
          return
      }

      data.searchCurrent = (rev
        ? (data.searchCurrent === 1 ? data.searchCount : data.searchCurrent - 1)
        : (data.searchCurrent === data.searchCount ? 1 : data.searchCurrent + 1))

      codemirror.setSelection(data.cursor.from(), data.cursor.to())
      codemirror.setCursor(data.cursor.to())
      codemirror.scrollIntoView({ from: data.cursor.from(), to: data.cursor.to() }, 20)
    }
    else {
      data.cursor = codemirror.getSearchCursor(data.keyword, CodeMirror.Pos(codemirror.firstLine()), { caseFold })

      methods.clearMarks()

      if (data.keyword !== data.lastKeyword && data.cursor) {
        while (data.cursor.findNext()) {
          data.searchCount++
          codemirror.markText(data.cursor.from(), data.cursor.to(), {
            className: 'search-highlight',
          })
        }
      }

      data.lastKeyword = data.keyword
      methods.search()
    }
  },
  onCtrlF(cb: () => any = () => null) {
    const body = document.querySelector('body')
    if (!body)
      return

    const getIsCommandKeyPressed = (event) => {
      return event.code === 'MetaLeft' || event.code === 'ControlLeft'
    }

    let isCommandKeyPressed = false
    const handleKeyDown = (event) => {
      if (getIsCommandKeyPressed(event)) {
        isCommandKeyPressed = true
      }
      else if (event.code === 'KeyF' && isCommandKeyPressed) {
        event.preventDefault()
        event.stopPropagation()
        cb()
      }
    }
    const handleKeyUp = (event) => {
      if (getIsCommandKeyPressed(event))
        isCommandKeyPressed = false
    }
    body.addEventListener('keydown', handleKeyDown)
    body.addEventListener('keyup', handleKeyUp)

    return () => {
      body.removeEventListener('keydown', handleKeyDown)
      body.removeEventListener('keyup', handleKeyUp)
    }
  },
  onEscape(cb: () => any = () => null) {
    const body = document.querySelector('body')
    if (!body)
      return

    const handleKeyUp = (event) => {
      if (event.code === 'Escape')
        cb()
    }
    body.addEventListener('keyup', handleKeyUp)

    return () => {
      body.removeEventListener('keyup', handleKeyUp)
    }
  },
  refresh() {
    cmEditorRef.value?.refresh()
  },
  checkFocused() {
    const { cminstance: codemirror } = cmEditorRef.value
    return codemirror.hasFocus() || keywordRef.value === document.activeElement
  },
}
onMounted(() => {
  const destroyOnCtrlF = methods.onCtrlF(() => {
    if (methods.checkFocused())
      methods.toggleSearch()
  })

  const destroyOnEscape = methods.onEscape(() => {
    if (methods.checkFocused())
      methods.closeSearch()
  })

  onBeforeUnmount(() => {
    destroyOnCtrlF?.()
    destroyOnEscape?.()
  })
})
defineExpose({
  toggleSearch: methods.toggleSearch,
})
</script>

<template>
  <div class="relative h-full">
    <transition
      enter-active-class="transition duration-200 ease-in-out"
      leave-active-class="transition duration-200 ease-in-out"
      enter-class="opacity-0 transform scale-75"
      leave-to-class="opacity-0 transform scale-75"
      appear
    >
      <div v-show="data.searchOpened" class="absolute flex items-center right-3 w-48 sm:w-64 bg-gray-100 dark:bg-gray-800 rounded-sm shadow-md z-20 pr-2">
        <input
          ref="keywordRef"
          v-model="data.keyword"
          type="text"
          class="block px-3 py-2 text-xs w-full dark:text-white border-0 border-transparent bg-transparent focus:ring-0 sm:text-sm"
          placeholder="Search"
          @keyup.enter="methods.search(false)"
        >
        <div class="flex items-center space-x-0.5">
          <span class="px-1 text-gray-500 font-semibold">
            {{ data.searchCount ? data.searchCurrent : 0 }}/{{ data.searchCount }}
          </span>
          <Button @click="methods.search(true)">
            <ChevronUpIcon class="h-4 w-4" />
          </Button>
          <Button @click="methods.search(false)">
            <ChevronDownIcon class="h-4 w-4" />
          </Button>
          <Button tabindex="0" @click="methods.closeSearch" @keyup.esc="methods.closeSearch">
            <CloseIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </transition>
    <codemirror ref="cmEditorRef" :value="value" :options="options" class="h-full" :class="{ 'search-opened': data.searchOpened }" />
  </div>
</template>
