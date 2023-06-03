/** @format */

import { fetch, ResponseType } from "@tauri-apps/api/http"
import { FetchResult } from "./model"
import { sleep } from "./utils"
import { Favorites, FetchedTag } from "./interfaces"
import { addTo, addToFilteredFavorites, empty } from "./favorites"
import { Ref } from "vue"

export async function fetchPage(
  userId: string,
  pageId: number = 0
): Promise<FetchResult | undefined> {
  try {
    let res = await fetch<string>(
      `https://rule34.xxx/index.php?page=favorites&s=view&id=${userId}&pid=${pageId}`,
      {
        method: "GET",
        responseType: ResponseType.Text
      }
    )

    let parser = new DOMParser()
    let doc = parser.parseFromString(res.data, "text/html")

    let lastPageId

    if (pageId === 0) {
      let lastPageAttr = doc
        .getElementsByName("lastpage")[0]
        .getAttribute("onclick")
      let countStart = (lastPageAttr?.indexOf("pid") as number) + 4
      let countEnd = (lastPageAttr?.indexOf(";") as number) - 1
      lastPageId = Number(
        lastPageAttr?.substring(countStart, countEnd) as string
      )
    }

    let images: HTMLImageElement[] = [],
      betterResSrc: string[] = []
    Array.from(
      doc.querySelectorAll(".thumb") as NodeListOf<HTMLSpanElement>
    ).forEach(span => {
      images.push(span.querySelector("img") as HTMLImageElement)
      betterResSrc.push(
        `https://rule34.xxx/${span.querySelector("a")?.getAttribute("href")}`
      )
    })

    return {
      images,
      betterResSrc,
      lastPageId
    }
  } catch (e) {
    console.log(
      `Failed to fetch https://rule34.xxx/index.php?page=favorites&s=view&id=${userId}&pid=${pageId}`
    )
    console.log(e)
  }
}

export async function fetchBetterRes(src: string) {
  try {
    let res = await fetch<string>(src, {
      method: "GET",
      responseType: ResponseType.Text
    })

    let parser = new DOMParser()
    let doc = parser.parseFromString(res.data, "text/html")

    let image =
      (doc.getElementById("image") as HTMLImageElement) ||
      doc.querySelector("source")

    return image
  } catch (e) {
    console.log("Failed to fetch better res at", src)
    console.log(e)
  }
}

export async function fetchTags(tag: string): Promise<FetchedTag[]> {
  let res = await fetch<string>(
    `https://rule34.xxx/autocomplete.php?q=${tag}`,
    {
      method: "GET",
      responseType: ResponseType.Text,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0"
      }
    }
  )

  return JSON.parse(res.data)
}

const MAX_IMAGE_COUNT = 50

export async function execFetchFavorites(
  userId: string,
  favorites: Favorites,
  betterResSrc: string[],
  tags: string[]
) {
  empty(favorites)

  let fetchRes = await fetchPage(userId)
  if (fetchRes) {
    fetchRes.images.forEach((img, i) => {
      let image = {
        thumbnail: img,
        pageUrl: (fetchRes as FetchResult).betterResSrc[i]
      }

      addTo(favorites, "fetched", image)

      addToFilteredFavorites(favorites, image, tags)
    })
    betterResSrc.push(...fetchRes.betterResSrc)

    favorites.count = favorites.fetched.length

    let count = MAX_IMAGE_COUNT

    ;(async () => {
      while (count <= ((fetchRes as FetchResult).lastPageId as number)) {
        await sleep(250)
        let otherFetchRes = await fetchPage(userId, count)
        if (otherFetchRes) {
          otherFetchRes.images.forEach((img, i) => {
            let image = {
              thumbnail: img,
              pageUrl: (otherFetchRes as FetchResult).betterResSrc[i]
            }

            addTo(favorites, "fetched", image)
            addToFilteredFavorites(favorites, image, tags)
          })
          betterResSrc.push(...otherFetchRes.betterResSrc)
        }

        count += MAX_IMAGE_COUNT
      }
    })()

    for (let i = 0; i < MAX_IMAGE_COUNT; i++) {
      if (i < favorites.fetched.length)
        addTo(favorites, "displayed", favorites.fetched[i])
      else break
    }
  }
}
