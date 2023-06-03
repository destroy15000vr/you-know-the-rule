/** @format */

import { ComponentInternalInstance, WritableComputedRef, computed } from "vue"
import { Favorites } from "./interfaces"
import { addTo, empty } from "./favorites"

export function sleep(ms: number = 200) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function useModel<T>(
  instance: ComponentInternalInstance,
  variable: string = "modelValue"
): WritableComputedRef<T> {
  return computed({
    get() {
      return instance.props[variable] as T
    },
    set(newVal) {
      instance.emit(`update:${variable}`, newVal)
    }
  })
}

export function randomize(favorites: Favorites, MAX_IMAGE_COUNT: number) {
  for (let i = favorites.filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[favorites.filtered[i], favorites.filtered[j]] = [
      favorites.filtered[j],
      favorites.filtered[i]
    ]
  }

  empty(favorites, "displayed")

  for (let i = length; i < length + MAX_IMAGE_COUNT; i++) {
    if (i < favorites.filtered.length) {
      addTo(favorites, "displayed", favorites.filtered[i])
    } else break
  }
}
