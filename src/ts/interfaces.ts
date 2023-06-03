/** @format */

export interface Images {
  thumbnail: HTMLImageElement
  pageUrl: string
}

export interface Favorites {
  count: number
  displayed: Images[]
  fetched: Images[]
  filtered: Images[]
}

export type FetchInputType = "and" | "or" | "not"

export interface FetchedTag {
  label: string
  value: string
}

export interface Tag {
  tag: FetchedTag
  group: number
}
