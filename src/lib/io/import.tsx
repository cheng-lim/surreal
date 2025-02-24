import { open } from "@tauri-apps/plugin-dialog";
import { BaseDirectory, readFile, writeFile } from "@tauri-apps/plugin-fs";
import { v4 as uuidv4 } from "uuid";
import { compress, saveCompressed } from "@/lib/conversion/compression";
import { generateImageUrls } from "@/lib/image/image";
import { toast } from "@/hooks/use-toast";

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
    toast({
      title: "Image Select Error",
      description: "You should at least selet 1 image.",
    });
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

    // Read image
    let image: Uint8Array<ArrayBufferLike> | undefined = undefined;
    try {
      image = await readFile(filePath);
    } catch (e) {
      toast({
        title: "Image Read Error",
        description: `${e}`,
      });
    }
    if (!image) {
      toast({
        title: "Image Read Error",
        description: "Unable to read image",
      });
      continue;
    }

    let base64Avif: string | undefined = undefined;
    // Convert image format to AVIF
    try {
      base64Avif = await compress(image);
    } catch (e) {
      toast({
        title: "Compression Error",
        description: `${e}`,
      });
    }
    if (!base64Avif) {
      toast({
        title: "Compression Error",
        description: "Unable to compress image",
      });
      continue;
    }

    // Convert base64 to uint 8 array
    let avifBytes: Uint8Array<ArrayBuffer> | undefined = undefined;
    try {
      avifBytes = base64ToUint8Array(base64Avif);
    } catch (e) {
      toast({
        title: "Conversion Error",
        description: `${e}`,
      });
      continue;
    }
    if (!avifBytes) {
      toast({
        title: "Conversion Error",
        description: "Unable to convert image",
      });
      continue;
    }

    const imageId = uuidv4();

    // write file
    try {
      await writeFile(`images/${imageId}.avif`, avifBytes, {
        baseDir: BaseDirectory.AppData,
      });
    } catch (e) {
      toast({
        title: "Image Write Error",
        description: `${e}`,
      });
      continue;
    }

    // save file
    try {
      await saveCompressed(imageId);
    } catch (e) {
      toast({
        title: "Image Save Error",
        description: `${e}`,
      });
      continue;
    }

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
