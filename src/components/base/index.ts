export const baseCom = {
  install: (Vue) => {
    Vue.component('Modal', () => import('@/components/base/Modal.vue'))
    Vue.component('Scroll', () => import('@/components/base/Scroll.vue'))
    // eslint-disable-next-line vue/no-reserved-component-names
    Vue.component('Button', () => import('@/components/base/Button.vue'))
    Vue.component('ButtonGroup', () => import('@/components/base/ButtonGroup.vue'))
    Vue.component('ToggleButton', () => import('@/components/base/ToggleButton.vue'))
    Vue.component('CopyButton', () => import('@/components/base/CopyButton.vue'))
    Vue.component('FileExportButton', () => import('@/components/base/FileExportButton.vue'))
  },
}
