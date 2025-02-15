import { save } from "@tauri-apps/plugin-dialog";
import { BaseDirectory, readFile, writeFile } from "@tauri-apps/plugin-fs";
import decompress from "../conversion/decompression";

export enum ImageFormat {
  PNG,
  AVIF,
}

export async function exportImage(format: ImageFormat, url: string) {
  const path = await selectDir(format);
  const imageId = url.split("/").pop();
  if (!path || !imageId) return;

  const data = await readFile(`images/${imageId}.avif`, {
    baseDir: BaseDirectory.AppData,
  });

  switch (format) {
    case ImageFormat.PNG:
      return saveAsPNG(path, data);
    case ImageFormat.AVIF:
      return saveAsAVIF(path, data);
  }
}

async function saveAsAVIF(path: string, data: Uint8Array<ArrayBufferLike>) {
  await writeFile(path, data);
}

async function saveAsPNG(path: string, data: Uint8Array<ArrayBufferLike>) {
  const blob = new Blob([data], { type: "image/avif" });
  const arrayBuffer = await blob.arrayBuffer();
  const pngBuffer = await decompress(new Uint8Array(arrayBuffer));

  await writeFile(path, new Uint8Array(pngBuffer));
}

async function selectDir(format: ImageFormat): Promise<string | null> {
  const extension = format === ImageFormat.PNG ? "png" : "avif";
  const path = await save({
    defaultPath: `untitled.${extension}`,
    filters: [
      {
        name: extension,
        extensions: [extension],
      },
    ],
  });
  return path;
}
