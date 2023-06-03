/** @format */

import { ImageIds } from "./model"

export function getSrc(el: Element) {
  return el.querySelector("img")?.src as string
}

export function getImageIds(el: Element): ImageIds {
  let src = getSrc(el)
  let url = new URL(src)

  let paths = url.pathname.split("/").filter(v => !!v)

  let short = paths[1]
  let long = paths[2].split("_").pop()?.split(".")[0] as string

  return {
    long,
    short
  }
}
