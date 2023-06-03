<!-- @format -->

<template>
  <q-dialog :model-value="value" persistent>
    <q-card class="q-pa-md bg-background text-link">
      <q-card-section class="text-h4"> Are you new here? </q-card-section>
      <q-card-section class="text-subtitle1">
        This application allows you to search amongst your favorite images from
        Rule34 and display the results in different ways.<br />
        To make this possible, the application needs your user ID.<br />
        To find it, you first have to log in your account on rule34.xxx, go to
        "My Account" and then "My profile". You'll be able to find your ID in
        the URL bar, after "&id=".
      </q-card-section>
      <q-card-section>
        <q-input
          ref="inputComponent"
          :model-value="input"
          @update:model-value="validateInput"
          type="text"
          label="Paste your user ID here"
          label-color="link-soft"
          color="link-soft"
          input-class="text-link"
          debounce="500"
          :rules="[
            val => !isNaN(val) || 'The ID should be a number',
            val => !!val || 'The ID can\'t be empty'
          ]"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          :disable="!inputIsValid"
          flat
          label="Save"
          v-close-popup
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  interface DialogProps {
    value: boolean
    userId: string
  }

  const props = defineProps<DialogProps>()
  const emit = defineEmits(["update:user-id", "fetch-favorites"])

  const inputComponent: Ref<any> = ref(null)
  const input = ref("")
  const inputIsValid = ref(false)
  const inputError: Ref<string | undefined> = ref(undefined)

  function validateInput(val: null | string | number) {
    input.value = val as string
    if (!inputComponent.value.validate(val)) return

    if (val === "") {
      inputIsValid.value = false
      return
    } else {
      inputError.value = undefined
      inputIsValid.value = true
    }
  }

  function save() {
    emit("update:user-id", input.value)
    emit("fetch-favorites")
    writeFile("id", input.value)
  }
</script>

<script lang="ts">
  import { defineComponent, ref, Ref, defineEmits, defineProps } from "vue"
  import { fetchPage } from "@ts/fetch"
  import { writeFile } from "@ts/fs"

  export default defineComponent({
    name: "UserIdDialog"
  })
</script>
