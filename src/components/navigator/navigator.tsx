"use client";
import { MdAddBox } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { importImages } from "@/lib/io/import";

interface NavigatorProps {
  imageUrls: string[];
  onImageAdd: (value: string[]) => void;
  storageUrls: string[];
  onStorageAdd: (value: string[]) => void;
  totalImageSize: number;
  totalImageCount: number;
  onImageSizeAdd: (value: number) => void;
  onImageCountAdd: (value: number) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function Navigator({
  imageUrls,
  onImageAdd,
  storageUrls,
  onStorageAdd,
  totalImageSize,
  totalImageCount,
  onImageSizeAdd,
  onImageCountAdd,
}: NavigatorProps) {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);

  return (
    <>
      <div className='fixed bottom-0 left-0 mb-[20px] ml-[30px] flex items-center justify-center w-[40px] h-[40px] bg-[rgba(228,228,228,0.7)] z-10 rounded-md shadow-lg backdrop-blur-sm'>
        <ToggleGroup
          type='single'
          defaultValue='import'
          onValueChange={() =>
            importImages({
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
            })
          }
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <ToggleGroupItem
                  value='import'
                  asChild
                  className='focus:outline-none focus:ring-0'
                >
                  <MdAddBox />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add images</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </ToggleGroup>
      </div>
      <div
        className='fixed bottom-0 left-[50px] mb-[20px] ml-[30px] flex items-center justify-center w-max h-[40px] bg-[rgba(228,228,228,0.7)] z-10 rounded-md shadow-lg backdrop-blur-sm px-[20px]'
        style={{ WebkitUserSelect: "none", cursor: "default" }}
      >
        {isAdding ? (
          <div className='flex items-center justify-center space-x-3'>
            <Loader2 className='animate-spin' />
            <div>{`Processing ${currentFile} / ${totalFiles} files`}</div>
          </div>
        ) : (
          `${formatBytes(
            totalImageSize
          )} | ${totalImageCount.toLocaleString()} images`
        )}
      </div>
    </>
  );
}
