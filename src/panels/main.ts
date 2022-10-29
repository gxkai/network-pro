import PortalVue from 'portal-vue'
import 'codemirror-graphql/mode'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/scroll/simplescrollbars.js'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/selection/active-line.js'
import { GlobalCmComponent } from 'codemirror-editor-vue3'
// // import VueHotkey from 'v-hotkey'
import vuescroll from 'vuescroll'
import VTooltip from 'floating-vue'
import 'floating-vue/dist/style.css'
import Vue3Mq from 'vue3-mq-lite'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/scroll/simplescrollbars.css'
import 'codemirror/addon/fold/foldgutter.css'
import '@/assets/tooltip.css'
import '@/assets/tailwind.css'
import '@/assets/custom-dracula.css'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

import { createApp } from 'vue'
import App from './Panel.vue'
import '../styles'
import { baseCom } from '~/components/base'
const pinia = createPinia()
pinia.use(createPersistedState())

const app = createApp(App)
app.use(pinia)
app.use(VTooltip, {
  themes: {
    tooltip: {
      placement: 'bottom',
      delay: {
        show: 300,
        hide: 100,
      },
    },
  },
})
app.use(PortalVue)
// @ts-expect-error
app.use(vuescroll, {
  ops: {
    bar: {
      keepShow: true,
    },
    rail: {
      gutterOfSide: 0,
    },
  },
})
app.use(baseCom)
app.use(GlobalCmComponent, {
  options: {
    mode: {
      name: 'javascript',
      json: true,
    },
    theme: 'dracula',
    tabSize: 4,
    foldGutter: true,
    styleActiveLine: true,
    lineNumbers: true,
    readOnly: true,
    scrollbarStyle: 'overlay',
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    dialogOptions: {
      closeOnEnter: false,
    },
    foldOptions: {
      widget() {
        const widget = document.createElement('div')
        widget.classList.add(
          'inline-block',
          'px-2',
          'mx-1',
          'align-middle',
          'bg-indigo-600',
          'hover:bg-indigo-700',
          'shadow',
          'rounded',
          'text-white',
          'cursor-pointer',
        )
        widget.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
          <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>`
        return widget
      },
    },
  },
})
app.use(Vue3Mq, {
  md: 768,
  lg: Infinity,
})
app.mount('#app')
