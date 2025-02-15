import { invoke } from "@tauri-apps/api/core";
import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs";

export async function getImageUrls(): Promise<string[]> {
  const urls: string[] = await invoke("get_image_urls");
  return urls;
}

export async function generateImageUrls(imageId: string): Promise<string> {
  const fileData = await readFile(`images/${imageId}.avif`, {
    baseDir: BaseDirectory.AppData,
  });
  const blob = new Blob([fileData], { type: "image/avif" });
  const url = URL.createObjectURL(blob);
  return url;
}
