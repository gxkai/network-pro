<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { storeToRefs } from 'pinia'
import { isGraphQL, isHTTP, parseGQLEntry, parseHTTPEntry } from '@/utils'

import List from '@/components/List.vue'
import Query from '@/components/Query.vue'
import Variables from '@/components/Variables.vue'
import Response from '@/components/Response.vue'
import Settings from '@/components/Settings.vue'

import Logo from '@/assets/logo-small.svg'
import Ghost from '@/assets/ghost.svg'
import CogIcon from '@/assets/cog.svg'
import { useStore } from '@/store'
import { QUERY_SIZE } from '~/constants'
const data = reactive({
  entries: [] as any[],
  activeId: null,
  settingsOpened: false,
  querySize: QUERY_SIZE,
})
const store = useStore()
const { state } = storeToRefs(store)
const { setSettings, setLastState } = store
const active = computed(() => {
  return data.entries.find(item => item && item.id === data.activeId)
})
const showVariables = computed(() => {
  return active.value?.type !== 'GET'
})
const queryRef = ref<any>()
const methods = {
  async addEntry(req) {
    if (isGraphQL(req)) {
      const entries = await parseGQLEntry(req)
      entries?.forEach(entry => methods.pushEntry(entry))
    }
    else if (isHTTP(req)) {
      const entry = await parseHTTPEntry(req)
      methods.pushEntry(entry)
    }
    if (!data.activeId && data.entries.length)
      data.activeId = data.entries[0]?.id
  },
  pushEntry(entry) {
    if (
      !entry
      || (entry
          && state.value.lastState.clearedAt
          && state.value.lastState.clearedAt > entry.timestamp)
    )
      return
    data.entries.push(entry)
  },
  resized([, item]) {
    if (item)
      data.querySize = 100 - item.size
  },
  async toggleVariables(show) {
    data.querySize = show ? QUERY_SIZE : 100
    setLastState({
      variablesOpened: show,
    })
    await nextTick()
    queryRef.value?.refresh()
  },
  changeSettings(settings) {
    setSettings(settings)
    methods.changeColorMode()
  },
  changeColorMode() {
    if (state.value.settings.colorTheme === 'dark')
      document.documentElement.classList.add('dark')
    else
      document.documentElement.classList.remove('dark')
  },
  clear() {
    data.entries = []
    data.activeId = null
    setLastState({
      clearedAt: Date.now(),
    })
  },
}

methods.changeSettings(state.value.settings)
data.querySize = state.value.lastState.variablesOpened ? QUERY_SIZE : 100
// @ts-expect-error
browser.devtools.network.getHAR((harLog) => {
  harLog.entries.filter(_ => isHTTP(_) || isGraphQL(_)).forEach((_) => {
    methods.addEntry(_)
  })
},
)
browser.devtools.network.onRequestFinished.addListener((e) => {
  methods.addEntry(e)
})
const mq = ($mq) => {
  return (obj: { md: any; lg: any }) => {
    if ($mq.md)
      return obj.md
    if ($mq.lg)
      return obj.lg
  }
}
</script>

<template>
  <div class="flex flex-col md:flex-row h-screen bg-white dark:bg-gray-900">
    <Splitpanes
      class="flex flex-row flex-grow w-full overflow-hidden"
      :push-other-panes="false"
    >
      <Pane
        min-size="18"
        :size="mq($mq)({ md: 18, lg: 18 })"
        class="bg-gray-50 dark:bg-gray-850 border-r border-gray-200 dark:border-gray-750 overflow-hidden"
      >
        <List v-model="data.activeId" :entries="data.entries" @clear="methods.clear" />
      </Pane>
      <Pane :size="mq($mq)({ md: 82, lg: 82 })" min-size="50">
        <div
          v-if="!active"
          class="flex justify-center items-center row-span-6 md:row-span-6 col-span-8 md:col-span-10 h-full"
        >
          <Ghost class="h-40" />
        </div>
        <Splitpanes
          v-else
          :horizontal="mq($mq)({ md: true, lg: false })"
          class="flex flex-col md:flex-row"
          :push-other-panes="false"
        >
          <Pane
            min-size="18"
            :size="mq($mq)({ md: 50, lg: 50 })"
            class="bg-white dark:bg-gray-900 overflow-hidden"
          >
            <Splitpanes
              horizontal
              class="flex flex-col overflow-hidden border-b md:border-none border-gray-200 dark:border-gray-750"
              :push-other-panes="false"
              @resized="methods.resized"
            >
              <Pane :size="data.querySize" style="min-height: 2.5rem">
                <Query
                  ref="queryRef"
                  :entry="active"
                  class="flex-grow overflow-hidden h-full"
                />
              </Pane>
              <Pane
                v-if="showVariables"
                :size="100 - data.querySize"
                style="min-height: 2.5rem"
              >
                <Variables
                  :entry="active"
                  class="overflow-hidden h-full"
                  @toggled="methods.toggleVariables"
                />
              </Pane>
            </Splitpanes>
          </Pane>
          <Pane class="bg-white dark:bg-gray-900 overflow-hidden">
            <Response
              :entry="active"
              class="md:border-l border-gray-200 dark:border-gray-750 overflow-hidden h-full"
            />
          </Pane>
        </Splitpanes>
      </Pane>
    </Splitpanes>
    <div
      class="flex md:flex-col justify-between h-10 md:h-auto md:w-10 bg-gray-50 dark:bg-gray-850 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-750"
    >
      <div class="flex h-10 w-10 justify-center items-center">
        <!--        <Logo class="h-5 w-5" /> -->
      </div>
      <button
        class="flex h-10 w-10 justify-center items-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-400 focus:outline-none"
        @click="data.settingsOpened = true"
      >
        <CogIcon v-tooltip="'Settings'" class="h-5 w-5 focus:outline-none" />
      </button>
    </div>
    <Settings
      v-model:open="data.settingsOpened"
      :settings="state.settings"
      :entry="active"
      @update:settings="methods.changeSettings"
    />
    <portal-target name="modals" />
  </div>
</template>
