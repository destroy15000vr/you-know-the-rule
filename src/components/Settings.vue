<!-- @format -->

<template>
  <q-dialog v-model="dialog">
    <q-card class="bg-background-alt text-link-soft" style="min-width: 400px">
      <q-card-section class="text-h6"> Resize the thumbnails </q-card-section>
      <q-card-section>
        <div class="col text-right" style="max-width: 400px">
          <q-item>
            <q-item-section avatar>
              <q-icon color="text-link" name="sym_o_photo_size_select_small" />
            </q-item-section>
            <q-item-section>
              <q-slider
                v-model="slider"
                :min="10"
                :max="30"
                :step="5"
                color="text-link"
                :label="true"
                markers
                :marker-labels="markers"
                snap
                :label-value="`${10 * slider}px`"
              />
            </q-item-section>
            <q-item-section avatar>
              <q-icon color="text-link" name="sym_o_photo_size_select_large" />
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
      <q-card-section class="text-h6"> Change your ID </q-card-section>
      <q-card-section class="text-h6">
        <q-input
          v-model="rule34Id.new"
          type="text"
          label="Your rule34 ID"
          color="link-soft"
          outlined
          dark
          :rules="[
            val => !isNaN(val) || 'The ID should be a number',
            val => !!val || 'The ID can\'t be empty'
          ]"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn
          flat
          label="Save"
          color="primary"
          v-close-popup
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  interface SettingsProps {
    open: boolean
    thumbSize: number
  }

  const props = defineProps<SettingsProps>()
  const emit = defineEmits(["update:open", "update:thumbSize"])
  const instance = getCurrentInstance() as ComponentInternalInstance

  const dialog = useModel<boolean>(instance, "open")
  const slider = useModel<number>(instance, "thumbSize")

  const rule34Id = reactive({
    cached: "",
    new: ""
  })

  const inputIsValid = ref(true)

  onBeforeMount(async () => {
    let id = (await readFile("id")) as string

    rule34Id.cached = id
    rule34Id.new = id
  })

  const markers = (val: number) => `${10 * val}px`

  async function onSave() {
    if (rule34Id.cached === rule34Id.new) return

    await writeFile("id", rule34Id.new)
  }
</script>

<script lang="ts">
  // prettier-ignore
  import { readFile, writeFile } from "@ts/fs"
  import { useModel } from "@ts/utils"
  import {
    ref,
    Ref,
    computed,
    ComputedRef,
    watch,
    defineProps,
    defineEmits,
    defineComponent,
    onBeforeMount,
    onMounted,
    unref,
    getCurrentInstance,
    ComponentInternalInstance,
    reactive
  } from "vue"
</script>
