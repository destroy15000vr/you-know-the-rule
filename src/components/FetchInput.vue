<!-- @format -->

<template>
  <q-select
    ref="select"
    :model-value="localTags"
    :options="options"
    label="Tag"
    label-color="link-soft"
    color="link-soft"
    input-class="link-soft input-select"
    outlined
    :dense="!main"
    dark
    use-input
    hide-selected
    multiple
    hide-dropdown-icon
    @keyup="HandleInput"
    :loading="fetchingTags"
    @add="addNewTag"
    @blur="clearOptions"
  >
    <template #after v-if="main">
      <q-btn
        class="text-link-soft"
        icon="sym_o_casino"
        fab
        flat
        @click="emit('randomize')"
        title="Randomize"
      />
    </template>

    <template #after v-if="removable">
      <q-btn
        class="text-link-soft"
        icon="sym_o_close"
        fab
        flat
        @click="emit('remove')"
        title="Randomize"
      />
    </template>
  </q-select>
</template>

<script setup lang="ts">
  interface FetchInputProps {
    type: FetchInputType
    modelValue: Tag[]
    removable?: boolean
    main?: boolean
    group: number
  }

  const props = defineProps<FetchInputProps>()
  const emit = defineEmits([
    "remove",
    "update:modelValue",
    "addToTags",
    "randomize"
  ])
  const instance = getCurrentInstance() as ComponentInternalInstance

  const tagsObject = useModel<Tag[]>(instance)

  const localTags = reactive<FetchedTag[]>([])

  const select = ref<QSelect | null>(null)
  const fetchingTags = ref(false)
  const options = ref<FetchedTag[]>([])

  let debounce: NodeJS.Timeout

  function HandleInput(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key.startsWith("Arrow")) return
    let val = (e.target as HTMLInputElement).value.trim()

    if (e.key === " ") {
      if (!localTags.map(v => v.label).includes(val)) emit("addToTags", val)
      select.value?.updateInputValue("")
    }

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

  function clearOptions() {
    if (options.value.length) options.value = []
  }

  function addNewTag(newTag: any) {
    let res = {
      group: props.group,
      tag: newTag
    }

    emit("update:modelValue", [...props.modelValue, res])

    /* if (!tags.value.includes(newTag.value.value)) {
      let tag = iWantToSee.value ? newTag.value.value : "-" + newTag.value.value

      tags.value = [...tags.value, tag]
    }
    select.value?.updateInputValue("") */
  }
</script>

<script lang="ts">
  // prettier-ignore
  import { ref, Ref, computed, ComputedRef, watch, defineProps, defineEmits, defineComponent, getCurrentInstance, ComponentInternalInstance, reactive } from "vue"
  import { FetchedTag, Tag, FetchInputType } from "@ts/interfaces"
  import { QSelect } from "quasar"
  import { fetchTags } from "@ts/fetch"
  import { useModel } from "@ts/utils"

  defineComponent({
    name: "FetchInput"
  })
</script>
