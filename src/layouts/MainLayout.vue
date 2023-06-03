<!-- @format -->

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-background-alt text-link-soft">
      <q-toolbar class="q-pa-md justify-between">
        <div class="row flex-center q-px-md" style="min-width: 100%">
          <div class="col">
            <q-toolbar-title
              class="text-weight-bolder"
              style="maxwidth: fit-content"
            >
              You Know The Rule
            </q-toolbar-title>
          </div>
          <div class="col">
            <q-chip
              v-for="(tag, index) in tags"
              :key="index"
              class=""
              :label="tag"
              removable
              @remove="removeTag(tag)"
              color="primary"
            />
          </div>
          <div class="col">
            <q-select
              ref="select"
              :model-value="tags"
              :options="options"
              :hint="`${iWantToSee ? 'Show' : 'Hide'} images with this tag`"
              label="Tag"
              label-color="link-soft"
              color="link-soft"
              input-class="link-soft input-select"
              outlined
              dark
              use-input
              hide-selected
              multiple
              hide-dropdown-icon
              @keyup="HandleInput"
              @clear="clearTags"
              :loading="fetchingTags"
              @add="addNewTag"
              @blur="clearOptions"
            >
              <template #append>
                <q-toggle v-model="iWantToSee" color="link-soft" />
              </template>
              <template #after>
                <q-btn
                  class="text-link-soft"
                  icon="sym_o_casino"
                  fab
                  flat
                  @click="randomize = true"
                  title="Randomize"
                />
              </template>
            </q-select>
          </div>
          <div class="col"></div>
          <div class="col text-right" style="max-width: 400px">
            <q-btn
              class="q-ml-md"
              icon="settings"
              fab
              flat
              @click="settings = true"
            />
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <Settings v-model:open="settings" v-model:thumb-size="slider" />

    <q-page-container>
      <router-view
        :tags="tags"
        :size="10 * slider"
        v-model:randomize="randomize"
        v-model:should-exec-fetch="shouldExecFetch"
      />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
  /** CONSTANTS */
  const MAX_IMAGE_COUNT = 50
  const open = ref(true)

  onBeforeMount(async () => {
    /** APP LOCAL DATA */
    const appLocalDataExists = await exists("", {
      dir: BaseDirectory.AppLocalData
    }).catch(e => console.log(e))

    if (!appLocalDataExists)
      createDir("", {
        dir: BaseDirectory.AppLocalData
      }).catch(e => console.log(e))

    /** USER ID */
    const userIdExists = await idFileExists()
    if (!userIdExists) {
      askUserIdDialog.value = true
    } else {
    }

    /** FETCH OPTIONS */
    fetchTags("").then(res => (options.value = res))
  })

  /** USER ID */
  const askUserIdDialog = ref(false)
  const userId = ref("")

  /** FETCH */
  const shouldExecFetch = ref(false)

  /** OPTIONS */
  const options = ref<FetchedTag[]>([])

  function clearOptions() {
    if (options.value.length) options.value = []
  }

  /** TAGS */
  const tags: Ref<string[]> = ref([])
  const fetchingTags = ref(false)

  function addNewTag(newTag: any) {
    if (!tags.value.includes(newTag.value.value)) {
      let tag = iWantToSee.value ? newTag.value.value : "-" + newTag.value.value

      tags.value = [...tags.value, tag]
    }
    select.value?.updateInputValue("")
  }
  function clearTags() {
    tags.value = []
    if (options.value.length) options.value = []
  }
  function removeTag(tag: string) {
    tags.value = tags.value.filter(t => t !== tag)
  }

  /** INPUT */
  const select: Ref<any> = ref(null)
  const iWantToSee = ref(true)
  const randomize = ref(false)

  let debounce: NodeJS.Timeout
  let lastLetter = ""

  function HandleInput(e: KeyboardEvent) {
    if (e.key === "Backspace") {
      if ((e.target as HTMLInputElement).value === "" && lastLetter === "") {
        tags.value = tags.value.slice(0, tags.value.length - 1)
      }
    }
    if (e.key === "-" && lastLetter === "") {
      iWantToSee.value = !iWantToSee.value
      select.value.updateInputValue("")
    }
    if (e.key === "Enter" || e.key.startsWith("Arrow")) return
    let val = (e.target as HTMLInputElement).value.trim()

    if (/* e.key === "Enter" ||  */ e.key === " ") {
      if (!tags.value.includes(val)) tags.value = [...tags.value, val]
      select.value?.updateInputValue("")
    }

    lastLetter = (e.target as HTMLInputElement).value

    clearTimeout(debounce)
    debounce = setTimeout(async () => {
      let newVal = (e.target as HTMLInputElement).value.trim()
      if (newVal) {
        select.value?.showPopup()
        fetchingTags.value = true
        options.value = await fetchTags(newVal)
        fetchingTags.value = false
      } else {
        options.value = []
      }
    }, 500)
  }

  /** SLIDER */
  const slider = ref(25)

  /** SETTINGS */
  const settings = ref(false)
</script>

<script lang="ts">
  import { onBeforeMount, reactive, Ref, ref, watch } from "vue"
  import { BaseDirectory, createDir, exists } from "@tauri-apps/api/fs"
  import { RouterView } from "vue-router"
  import { fetchTags } from "@ts/fetch"
  import Settings from "src/components/Settings.vue"
  import UserIdDialog from "src/components/userIdDialog.vue"
  import AdvancedTags from "src/components/AdvancedTags.vue"
  import { idFileExists } from "@ts/fs"
  import { Favorites, FetchedTag, Tag } from "@ts/interfaces"
</script>
