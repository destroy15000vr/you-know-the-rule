<!-- @format -->

<template>
  <q-page class="flex flex-center bg-background">
    <UserIdDialog
      v-model:value="askUserIdDialog"
      v-model:user-id="userId"
      @fetch-favorites="startExecFetch = true"
    />
    <div ref="wrapper" class="flex wrap" id="scrollTarget">
      <Thumbnail
        v-for="(img, index) in favorites.displayed"
        :key="index"
        :thumbnail="img.thumbnail"
        :page-url="img.pageUrl"
        :index="index"
        :confirm="confirm"
        v-model:remember="remember"
        v-model:loading="loading"
        @display-page="displayPage(index, img.pageUrl)"
        @update:confirm="onUpdateConfirm(index, img.pageUrl, $event)"
        :size="size"
      />
    </div>
    <q-dialog v-model="confirm" persistent>
      <q-card class="bg-background-overlay" dark>
        <q-card-section class="row flex-center column">
          <q-avatar color="primary" text-color="white" size="100px">
            <img src="aqua_crying.webp" alt="Crying" />
          </q-avatar>
          <div class="q-mt-md">Rule 34 didn't let me fetch the image...</div>
          <div>Do you want to open a page with their site instead?</div>
        </q-card-section>
        <q-card-actions align="left">
          <q-checkbox
            v-model="remember"
            label="Remember my choice for this session"
            color="secondary"
            dark
            class="text-text"
          />
        </q-card-actions>
        <q-card-actions align="right">
          <q-btn
            flat
            label="No"
            color="link"
            v-close-popup
            @click="refuseRemember"
          />
          <q-btn
            flat
            label="Sure"
            color="link"
            v-close-popup
            @click="displayPage(cached.index, cached.url)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="loading" persistent>
      <q-spinner
        class="bg-transparent"
        color="text"
        size="3rem"
        :thickness="5"
      />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
  /** CONSTANTS */
  const MAX_IMAGE_COUNT = 50

  /** INSTANCE */
  interface Props {
    tags: string[]
    size: number
    randomize: boolean
    shouldExecFetch: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits(["update:randomize"])
  const instance = getCurrentInstance() as ComponentInternalInstance

  /** BEFORE MOUNT */
  onBeforeMount(async () => {
    remember.value = JSON.parse(await readFile("remember").catch(_ => "false"))

    let fileExists = await idFileExists()
    if (!fileExists) askUserIdDialog.value = true
    else {
      let fileContent = await readFile("id")
      userId.value = fileContent as string
      await execFetchFavorites(
        userId.value,
        favorites,
        betterResSrc,
        props.tags
      )
    }
    window.addEventListener("scroll", onScroll)
  })

  /** BEFORE UNMOUNT */
  onBeforeUnmount(() => {
    window.removeEventListener("scroll", onScroll)
  })

  /** FETCH */
  const startExecFetch = useModel<boolean>(instance, "shouldExecFetch")
  const betterResSrc: string[] = reactive([])
  const favorites: Favorites = reactive({
    fetched: [],
    filtered: [],
    displayed: [],
    count: 0
  })

  watch(startExecFetch, async shouldStart => {
    if (shouldStart)
      await execFetchFavorites(
        userId.value,
        favorites,
        betterResSrc,
        props.tags
      )
  })

  /** TAGS */
  watch(
    () => props.tags,
    async (newTags, oldTags) => {
      await scroll()

      let refFavorites =
        oldTags.length && newTags.length > oldTags.length
          ? [...favorites.filtered]
          : [...favorites.fetched]

      empty(favorites, ["displayed", "filtered"])

      if (!newTags.length) {
        addTo(favorites, "filtered", ...favorites.fetched)
      } else {
        for (let image of refFavorites) {
          addToFilteredFavorites(image, newTags)
        }
      }

      let i = 0
      while (i < MAX_IMAGE_COUNT && i < favorites.filtered.length) {
        addTo(favorites, "displayed", favorites.filtered[i])

        i++
      }
    }
  )

  const wrapper: Ref<HTMLElement | null> = ref(null)
  const confirm = ref(false)
  const loading = ref(false)
  const remember = ref<boolean>(false)
  const cached = ref({
    index: 0,
    url: ""
  })

  const userId = ref("")
  const askUserIdDialog = ref(false)

  watch(
    () => props.randomize,
    async newVal => {
      if (!newVal) return

      window.removeEventListener("scroll", onScroll)
      await scroll()

      randomize(favorites, MAX_IMAGE_COUNT)

      emit("update:randomize", false)
      window.addEventListener("scroll", onScroll)
    }
  )

  watch(
    () => favorites.fetched,
    newVal => {
      favorites.count = newVal.length
    }
  )

  function addToFilteredFavorites(image: Images, tags?: string[]) {
    let imageTags = image.thumbnail.title.split(" ")
    tags = tags || props.tags

    if (
      tags.every(tag =>
        tag.startsWith("-")
          ? !imageTags.includes(tag.replace("-", ""))
          : imageTags.includes(tag)
      )
    ) {
      addTo(favorites, "filtered", image)
    }
  }

  async function displayPage(index: number, url: string) {
    const webview = new WebviewWindow(`${index}`, {
      url,
      title: "You Know The Rule"
    })

    webview.onFocusChanged(async (e: any) => {
      if (e.event === "tauri://blur") await webview.close()
    })
    loading.value = false
    if (remember.value === true) {
      await writeFile("remember", "true")
    }
  }

  function onUpdateConfirm(index: number, url: string, $event: boolean) {
    cached.value = { index, url }

    confirm.value = $event
  }

  async function refuseRemember() {
    if (remember.value) await writeFile("remember", "false")

    loading.value = false
  }

  /** SCROLL */
  let cooldown = false
  function onScroll() {
    if (cooldown === true) return
    let el = wrapper.value as HTMLElement
    if (el.getBoundingClientRect().bottom < window.innerHeight + 200) {
      cooldown = true

      let length = favorites.displayed.length
      for (let i = length; i < length + MAX_IMAGE_COUNT; i++) {
        if (i < favorites.filtered.length) {
          addTo(favorites, "displayed", favorites.filtered[i])
        } else break
      }

      setTimeout(() => {
        cooldown = false
      }, 1000)
    }
  }

  function scroll() {
    window.removeEventListener("scroll", onScroll)

    window.scrollTo({
      behavior: "smooth",
      top: 0
    })

    return new Promise((resolve, reject) => {
      let isScrolling: NodeJS.Timeout = setTimeout(() => {
        reject()
      }, 2000)

      const handler = () => {
        if (window.scrollY === 0) {
          clearTimeout(isScrolling)
          window.removeEventListener("scroll", handler)
          window.addEventListener("scroll", onScroll)
          resolve(null)
        }
      }

      if (window.scrollY === 0) {
        clearTimeout(isScrolling)
        window.addEventListener("scroll", onScroll)
        resolve(null)
      } else {
        window.addEventListener("scroll", handler)
      }
    })
  }
</script>

<script lang="ts">
  import {
    ComponentInternalInstance,
    computed,
    ComputedRef,
    defineComponent,
    getCurrentInstance,
    onBeforeMount,
    onBeforeUnmount,
    reactive,
    Ref,
    ref,
    watch
  } from "vue"
  import { readFile, writeFile, idFileExists } from "@ts/fs"
  import { fetchBetterRes, fetchPage } from "@ts/fetch"
  import { getImageIds } from "@ts/image"
  import UserIdDialog from "src/components/userIdDialog.vue"
  import Thumbnail from "src/components/Thumbnail.vue"
  import { randomize, sleep, useModel } from "@ts/utils"
  import { FetchResult } from "@ts/model"
  import { SessionStorage } from "quasar"
  import { WebviewWindow } from "@tauri-apps/api/window"
  import { emit } from "process"
  import { BaseDirectory, readTextFile } from "@tauri-apps/api/fs"
  import { Favorites, Images } from "@ts/interfaces"
  import { execFetchFavorites } from "@ts/fetch"
  import { addTo, empty } from "@ts/favorites"
</script>
