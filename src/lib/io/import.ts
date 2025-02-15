import { open } from "@tauri-apps/plugin-dialog";
import { BaseDirectory, readFile, writeFile } from "@tauri-apps/plugin-fs";
import { v4 as uuidv4 } from "uuid";
import { compress, saveCompressed } from "@/lib/conversion/compression";
import { generateImageUrls } from "@/lib/image/image";

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

interface ImportProps {
  imageUrls: string[];
  onImageAdd: (value: string[]) => void;
  storageUrls: string[];
  onStorageAdd: (value: string[]) => void;
  totalImageSize: number;
  totalImageCount: number;
  onImageSizeAdd: (value: number) => void;
  onImageCountAdd: (value: number) => void;
  setIsAdding: (value: boolean) => void;
  setCurrentFile: (value: number) => void;
  setTotalFiles: (value: number) => void;
}

export async function importImages({
  imageUrls,
  onImageAdd,
  storageUrls,
  onStorageAdd,
  totalImageSize,
  totalImageCount,
  onImageSizeAdd,
  onImageCountAdd,
  setIsAdding,
  setCurrentFile,
  setTotalFiles,
}: ImportProps) {
  // select images
  const filePaths: string[] | null = await open({
    multiple: true,
    directory: false,
    filters: [
      {
        name: "Image",
        extensions: ["png", "jpeg", "jpg", "webp", "tiff", "gif"],
      },
    ],
  });

  if (!Array.isArray(filePaths) || filePaths === null) {
    return;
  }

  setIsAdding(true);
  setTotalFiles(filePaths.length);

  let avifBytesSize = 0;
  const urls: string[] = [];
  const imageIds: string[] = [];

  // compress images
  for (const i in filePaths) {
    const currentIndex: number = Number(i) + 1;
    setCurrentFile(currentIndex);
    const filePath = filePaths[i];
    const image: Uint8Array<ArrayBufferLike> = await readFile(filePath);
    const base64Avif: string = await compress(image);
    const avifBytes = base64ToUint8Array(base64Avif);
    const imageId = uuidv4();
    await writeFile(`images/${imageId}.avif`, avifBytes, {
      baseDir: BaseDirectory.AppData,
    });
    await saveCompressed(imageId);
    imageIds.push(imageId);

    // update image urls

    const url = await generateImageUrls(imageId);
    urls.push(url);
    avifBytesSize += avifBytes.length;
  }

  onStorageAdd([...imageIds, ...storageUrls]);
  onImageAdd([...urls, ...imageUrls]);
  onImageCountAdd(totalImageCount + filePaths.length);
  onImageSizeAdd(totalImageSize + avifBytesSize);

  setIsAdding(false);
}
