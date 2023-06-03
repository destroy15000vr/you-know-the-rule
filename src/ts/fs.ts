/** @format */

import {
  exists,
  readTextFile,
  writeTextFile,
  BaseDirectory
} from "@tauri-apps/api/fs"

export async function idFileExists() {
  try {
    return await exists("uid.txt", { dir: BaseDirectory.AppLocalData })
  } catch (e) {
    console.log("Error when checking if the ID file exists :", e)
  }
}

type FileType = "id" | "remember"

export async function readFile(type: FileType) {
  let file = type === "id" ? "uid.txt" : "~remember"
  return await readTextFile(file, { dir: BaseDirectory.AppLocalData })
}

export async function writeFile(type: FileType, content: string) {
  let file = type === "id" ? "uid.txt" : "~remember"

  await writeTextFile(file, content as string, {
    dir: BaseDirectory.AppLocalData
  })
}
