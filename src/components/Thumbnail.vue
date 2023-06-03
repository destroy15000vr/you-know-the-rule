<!-- @format -->

<template>
  <q-card
    class="bg-background flex flex-center q-ma-md"
    :style="`width: ${size}px; height: ${size}px; cursor: pointer`"
  >
    <q-img
      :src="url"
      :placeholder-src="thumbnail.src"
      @click="onClick"
      alt="Image not working"
      fit="contain"
      style="max-width: 100%; max-height: 100%"
      :img-style="{ maxWidth: '100%', maxHeight: '100%' }"
      loading="lazy"
    />
  </q-card>
</template>

<script setup lang="ts">
  interface ThumbnailProps {
    thumbnail: HTMLImageElement
    pageUrl: string
    index: number
    confirm: boolean
    loading: boolean
    remember: boolean
    size: number
  }

  const props = defineProps<ThumbnailProps>()
  const emit = defineEmits([
    "update:loading",
    "update:confirm",
    "update:remember",
    "displayPage"
  ])

  let url = ref(props.thumbnail.src)

  watch(
    () => props.thumbnail,
    newVal => {
      if (newVal) url.value = newVal.src
    }
  )

  onBeforeMount(() => {
    //console.log(props.img)
  })

  async function onClick(e: any) {
    emit("update:loading", true)

    let url = ((await fetchBetterRes(props.pageUrl)) as HTMLImageElement).src

    if (url.includes(".mp4")) {
      const webview = new WebviewWindow(`${props.index}`, {
        url,
        title: "YKTR"
      })

      webview.onFocusChanged(async (e: any) => {
        if (e.event === "tauri://blur") await webview.close()
      })
      emit("update:loading", false)
    } else {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img

        let coeff =
          height > window.innerHeight ? window.innerHeight / height : 1

        console.log({ width, height })
        const webview = new WebviewWindow(`${props.index}`, {
          url,
          height: height * coeff,
          width: width * coeff,
          decorations: false
        })

        webview.onFocusChanged(async (e: any) => {
          if (e.event === "tauri://blur") await webview.close()
        })
        emit("update:loading", false)
      }
      let count = 0
      img.onerror = async err => {
        console.log({ err: Object.freeze(err) })
        let newUrl = url
          .replace("https://rule34.xxx", "https://wimg.rule34.xxx")
          .replace("samples", "images")
          .replace("sample_", "")
          .replace(".jpg", ".jpeg")
          .replace(/\?.+/g, "")

        if (count === 1) {
          let shouldDisplay = JSON.parse(
            await readTextFile("~remember", {
              dir: BaseDirectory.AppLocalData
            }).catch((_: any) => "null")
          )

          if (props.remember === false && shouldDisplay === null) {
            console.log("No response stored, asking user for confirmation")
            emit("update:confirm", true)
          } else {
            if (shouldDisplay) emit("displayPage")
            else {
              Notify.create({
                icon: "sym_o_info",
                message:
                  "Rule34 won't let me open this image and you decided to do nothing in this case. Close and reopen the application if you want to change this behavior."
              })
              emit("update:loading", false)
            }
          }
          return
        }

        setTimeout(() => {
          img.src = newUrl
        }, 500)

        count++
      }

      setTimeout(() => {
        img.src = url
      }, 500)
    }
  }
</script>

<script lang="ts">
  // prettier-ignore
  import { ref, Ref, computed, ComputedRef, watch, defineProps, defineEmits, defineComponent, onBeforeMount } from "vue"
  import { getSrc, getImageIds } from "@ts/image"
  import { fetchBetterRes } from "@ts/fetch"
  import { WebviewWindow } from "@tauri-apps/api/window"
  import { fetch, ResponseType } from "@tauri-apps/api/http"
  import { BaseDirectory, readTextFile } from "@tauri-apps/api/fs"
  import { exists } from "fs"
  import { Notify } from "quasar"

  defineComponent({
    name: "Thumbnail"
  })
</script>
