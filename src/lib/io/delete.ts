import { invoke } from "@tauri-apps/api/core";
import { BaseDirectory, readFile, remove } from "@tauri-apps/plugin-fs";

interface DeleteProps {
  imageUrls: string[];
  storageUrls: string[];
  indexToDelete: number | null;
  setImageUrls: (value: string[]) => void;
  setStorageUrls: (value: string[]) => void;
  setWantToDelete: (value: boolean) => void;
  setIndexToDelete: (value: number | null) => void;
  totalImageCount: number;
  setTotalImageCount: (value: number) => void;
  totalImageSize: number;
  setTotalImageSize: (value: number) => void;
}

export default async function deleteImage({
  imageUrls,
  storageUrls,
  indexToDelete,
  setImageUrls,
  setStorageUrls,
  setWantToDelete,
  setIndexToDelete,
  totalImageCount,
  setTotalImageCount,
  totalImageSize,
  setTotalImageSize,
}: DeleteProps) {
  const i = indexToDelete;

  if (i === null || i === undefined) return;

  const imageId = storageUrls[i];

  const data = await readFile(`images/${imageId}.avif`, {
    baseDir: BaseDirectory.AppData,
  });
  const size = data.length;
  await remove(`images/${imageId}.avif`, {
    baseDir: BaseDirectory.AppData,
  });

  await invoke("delete_image", { imageId: imageId });

  setImageUrls(imageUrls.filter((_, index) => index !== i));
  setStorageUrls(storageUrls.filter((_, index) => index !== i));

  setTotalImageCount(totalImageCount - 1);
  setTotalImageSize(totalImageSize - size);

  setWantToDelete(false);
  setIndexToDelete(null);
}
