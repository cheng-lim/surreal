import { invoke } from "@tauri-apps/api/core";

export async function compress(
  imageData: Uint8Array<ArrayBufferLike>
): Promise<string> {
  const blob: string = await invoke("compress", { image: imageData });
  return blob;
}

export async function saveCompressed(imageId: string) {
  await invoke("save_compressed", { imageId: imageId });
}
