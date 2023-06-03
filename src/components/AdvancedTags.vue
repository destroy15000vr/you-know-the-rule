<!-- @format -->

<template>
  <q-dialog v-model="confirm" persistent>
    <q-card class="bg-background-alt text-link-soft" dark>
      <q-card-section class="text-h6"> I want to see </q-card-section>
      <q-card-section
        class="row items-center"
        v-for="(input, index) in inputs"
        :key="index"
      >
        <FetchInput
          v-model="inputs[index]"
          :group="index"
          @remove="inputs.splice(index, 1)"
          type="and"
        />
      </q-card-section>
      <q-card-section class="row items-center">
        <q-btn
          color="primary"
          icon="check"
          label="OK"
          @click="inputs.push([])"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Turn on Wifi" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  interface AdvancedTagsProps {
    open: boolean
  }

  const props = defineProps<AdvancedTagsProps>()
  const emit = defineEmits([])
  const instance = getCurrentInstance() as ComponentInternalInstance

  const confirm = useModel<boolean>(instance, "open")

  const inputs: Tag[][] = reactive([[]])
  watch(inputs, newVal => console.log({ newVal }))
</script>

<script lang="ts">
  // prettier-ignore
  import FetchInput from "src/components/FetchInput.vue"
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
    getCurrentInstance,
    ComponentInternalInstance,
    reactive,
    onBeforeMount
  } from "vue"
  import { Tag } from "@ts/interfaces"

  defineComponent({
    name: "AdvancedTags"
  })
</script>
