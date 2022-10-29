<script lang="ts" setup>
import prettier from 'prettier/standalone.js'
import gqlParser from 'prettier/parser-graphql.js'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useRequest } from 'vue-request'
import request from 'graphql-request'
import Headers from '@/components/Headers.vue'
import TopBar from '@/components/TopBar.vue'
// import Params from '@/components/Params.vue'
// import Code from '@/components/Code.vue'
import { useStore } from '~/store'
import { LJ } from '~/utils'
const props = defineProps({
  entry: {
    type: Object,
  },
})
const store = useStore()
const { state } = storeToRefs(store)
const headers = computed(() => {
  if (state.value.settings.token) {
    return {
      Authorization: state.value.settings.token,
    }
  }
  return {}
})
const config = computed(() => {
  if (state.value.settings.origin) {
    return {
      url: `${state.value.settings.origin}${props.entry?.request?.name}`,
    }
  }
  return {
    url: `${props.entry?.request?.origin}${props.entry?.request?.name}`,
  }
})
const codeRef = ref<any>()
const { loading, runAsync } = useRequest(() => props.entry?.type === 'GQL'
  ? request({
    url: props.entry?.request?.url,
    document: props.entry?.request?.query,
    variables: props.entry?.request?.variables,
    requestHeaders: props.entry?.request?.headers?.map(_ => ({
      [_.name]: _.value,
    }))?.reduce((pre, cur) => {
      return {
        ...pre,
        ...cur,
      }
    }, {}),
  })
  : axios({
    headers: {
      Authorization: props.entry?.request?.headers?.map(_ => ({
        [_.name]: _.value,
      }))?.reduce((pre, cur) => {
        return {
          ...pre,
          ...cur,
        }
      }, {}).Authorization,
      ...headers.value,
    },
    method: props.entry?.type,
    data: props.entry?.request?.body,
    params: props.entry?.request?.query,
    ...config.value,
  }), { manual: true })
const methods = {
  async getFileContent(entry) {
    // const params = entry.request.params
    // const body = entry.request.body
    // const variables = this.entry.request.variables
    const { data, errors } = await entry.response.getResponse()
    return JSON.stringify({
      request: entry.request,
      response: {
        ...entry.response,
        data,
        errors,
      },
    }, null, 2)
  },
  refresh() {
    codeRef.value.refresh()
  },
  reSend() {
    runAsync()
  },
}
const { reSend } = methods
const data = reactive({
  activeView: 'query',
  showPrettified: true,
  cmOptions: {
    mode: 'graphql',
  },
})
const parsedQuery = computed(() => {
  // @ts-expect-error
  const { type, request } = props.entry

  if (type === 'GQL') {
    return data.showPrettified
      ? prettier.format(request.query, { semi: false, parser: 'graphql', plugins: [gqlParser] })
      : request.query.replace(/\n$/, '')
  }

  return Object.entries(request.query).map(([name, value]) => ({
    name,
    value,
  }))
})
const viewButtons = computed(() => {
  return [
    {
      title: props.entry?.type,
      name: 'query',
    },
    {
      title: 'HEADERS',
      name: 'headers',
    },
  ]
})
</script>

<template>
  <div class="query-block flex flex-col">
    <TopBar
      v-model="data.activeView"
      :items="viewButtons"
      :color="state.typeColors[entry.type]"
      :copy-value="data.activeView === 'query' ? (entry.type === 'GQL' ? parsedQuery : entry.request.url) : JSON.stringify(entry.request.headers, null, 2)"
      :file-export-value="methods.getFileContent(entry)"
      :file-export-name="entry.request.url"
      :show-search="data.activeView === 'query' && entry.type === 'GQL'"
      @toggleSearch="codeRef?.toggleSearch()"
    >
      <template #left>
        <!--        <div -->
        <!--          v-if="entry" -->
        <!--          class="whitespace-nowrap overflow-auto hide-scrollbar ml-2 text-gray-550 dark:text-gray-500" -->
        <!--        > -->
        <!--          {{ entry.request.url }} -->
        <!--        </div> -->
      </template>
      <template #right>
        <Button v-if="entry?.type !== 'GQL'" @click="reSend">
          {{ loading ? 'ReSending' : 'ReSend' }}
        </Button>
      </template>
    </TopBar>
    <div v-if="entry" class="relative flex-grow overflow-hidden">
      <template v-if="data.activeView === 'query'">
        <Code
          v-if="entry.type === 'GQL'"
          ref="codeRef"
          :value="parsedQuery"
          :options="data.cmOptions"
          class="h-full ml-1"
        />
        <Scroll v-else>
          <!--          <div class="p-3"> -->
          <!--            <ul class="space-y-3"> -->
          <!--              <li class="flex flex-col font-semibold"> -->
          <!--                <div class="text-gray-600"> -->
          <!--                  Origin -->
          <!--                </div> -->
          <!--                <div -->
          <!--                  class="mt-1 px-2 py-1.5 rounded bg-gray-100 dark:bg-gray-850 text-gray-700 dark:text-gray-200" -->
          <!--                > -->
          <!--                  {{ entry.request.origin }} -->
          <!--                </div> -->
          <!--              </li> -->
          <!--              <li class="flex flex-col font-semibold"> -->
          <!--                <div class="text-gray-600"> -->
          <!--                  Path -->
          <!--                </div> -->
          <!--                <div -->
          <!--                  class="mt-1 px-2 py-1.5 rounded bg-gray-100 dark:bg-gray-850 text-attribute dark:text-attribute-light" -->
          <!--                > -->
          <!--                  {{ entry.request.pathname }} -->
          <!--                </div> -->
          <!--              </li> -->
          <!--              <li v-if="parsedQuery.length" class="flex flex-col font-semibold"> -->
          <!--                <div class="text-gray-600"> -->
          <!--                  Query Parameters -->
          <!--                </div> -->
          <!--                <Params :items="parsedQuery" class="mt-1" /> -->
          <!--              </li> -->
          <!--            </ul> -->
          <!--          </div> -->
        </Scroll>
        <ToggleButton
          v-if="entry.type === 'GQL'"
          v-model="data.showPrettified"
          v-tooltip.top="'Prettify'"
          class="absolute bottom-2 right-3 p-1 z-10"
        />
      </template>
      <Headers v-else-if="data.activeView === 'headers'" :items="entry.request.headers" />
    </div>
  </div>
</template>
