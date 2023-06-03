/** @format */

export interface ImageIds {
  long: string
  short: string
}

export interface FetchResult {
  images: HTMLImageElement[]
  betterResSrc: string[]
  lastPageId?: number
}
