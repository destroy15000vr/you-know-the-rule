/** @format */

import { Favorites, Images } from "./interfaces"

type FavoriteType = "displayed" | "fetched" | "filtered"

export function addToFilteredFavorites(
  favorites: Favorites,
  image: Images,
  tags: string[]
) {
  let imageTags = image.thumbnail.title.split(" ")

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

export function empty(
  favorites: Favorites,
  types?: FavoriteType | FavoriteType[]
) {
  if (!types || types.includes("displayed")) favorites.displayed.splice(0)

  if (!types || types.includes("fetched")) favorites.fetched.splice(0)

  if (!types || types.includes("filtered")) favorites.filtered.splice(0)
}

export function addTo(
  favorites: Favorites,
  types?: FavoriteType | FavoriteType[],
  ...contents: Images[]
) {
  if (!types || types.includes("displayed"))
    favorites.displayed.push(...contents)

  if (!types || types.includes("fetched")) favorites.fetched.push(...contents)

  if (!types || types.includes("filtered")) favorites.filtered.push(...contents)
}
