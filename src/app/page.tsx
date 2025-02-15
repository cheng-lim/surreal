"use client";

import Image from "next/image";
import Navigator from "@/components/navigator/navigator";
import ActionBar, { ActionType } from "@/components/action_bar/action_bar";
import { useEffect, useState, useRef } from "react";
import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs";
import { Loader2 } from "lucide-react";
import { generateImageUrls, getImageUrls } from "@/lib/image/image";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { exportImage, ImageFormat } from "@/lib/io/export";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import deleteImage from "@/lib/io/delete";
import Version from "@/components/version/version";
import { Toaster } from "@/components/ui/toaster";
import { Terminal } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { initFirebase } from "@/lib/firebase/firebase";

// LazyImage component with lazy loading and fade-in on load.
// Once the image is loaded, it remains displayed regardless of viewport.
interface LazyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  style?: React.CSSProperties;
  className?: string;
  draggable?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fill,
  style,
  className,
  draggable,
}) => {
  const [isInView, setIsInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "100px" } // Begin loading when 100px near the viewport.
    );
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className='w-full h-full relative'>
      {isInView || loaded ? (
        <>
          {!loaded && (
            // Show the ShadCN skeleton until the image fully loads
            <Skeleton className='w-[99%] h-[99%] rounded-xl' />
          )}
          <Image
            src={src}
            alt={alt}
            fill={fill}
            style={{
              ...style,
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
            }}
            className={className}
            draggable={draggable}
            onLoad={() => setLoaded(true)}
            loading='lazy'
          />
        </>
      ) : (
        // Skeleton placeholder before the image enters the viewport
        <Skeleton className='w-full h-full' />
      )}
    </div>
  );
};

export default function Home() {
  const [gridLayout, setGridLayout] = useState<"3x3" | "4x4" | "5x5">("5x5");
  const [isReadingImages, setIsReadingImages] = useState<boolean>(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [storageUrls, setStorageUrls] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [totalImageCount, setTotalImageCount] = useState<number>(0);
  const [totalImageSize, setTotalImageSize] = useState<number>(0);
  const [wantToDelete, setWantToDelete] = useState<boolean>(false);
  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState({
    width: 0,
    height: 0,
  });

  // States for zoom and pan in the modal
  const [zoomScale, setZoomScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // A helper to clamp a value between a min and max.
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  // Load images and compute total file size.
  useEffect(() => {
    const urls: string[] = [];
    let totalFileSize = 0;
    async function loadImages() {
      const loadedImageUrls = await getImageUrls();
      try {
        for (const loadedImageUrl of loadedImageUrls) {
          // Read file data to determine its size.
          const fileData = await readFile(`images/${loadedImageUrl}.avif`, {
            baseDir: BaseDirectory.AppData,
          });
          if (fileData instanceof Uint8Array) {
            totalFileSize += fileData.length;
          } else if (typeof fileData === "string") {
            totalFileSize += new TextEncoder().encode(fileData).length;
          }
          // Generate a Blob URL for the image.
          const url = await generateImageUrls(loadedImageUrl);
          urls.push(url);
        }
        setTotalImageCount(loadedImageUrls.length);
        setTotalImageSize(totalFileSize);
        setImageUrls(urls);
        setStorageUrls(loadedImageUrls);
      } catch (error) {
        console.error("Error reading images:", error);
      } finally {
        setIsReadingImages(false);
      }
    }
    loadImages();

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    setNaturalDimensions({ width: 0, height: 0 });
  }, [selectedImage]);

  // Listen for key events when an image is selected.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === "Escape") {
        setSelectedImage(null);
        setZoomScale(1);
        setOffset({ x: 0, y: 0 });
      } else if (e.key === "ArrowLeft") {
        const currentIndex = imageUrls.indexOf(selectedImage);
        if (currentIndex > 0) {
          setSelectedImage(imageUrls[currentIndex - 1]);
          setZoomScale(1);
          setOffset({ x: 0, y: 0 });
        }
      } else if (e.key === "ArrowRight") {
        const currentIndex = imageUrls.indexOf(selectedImage);
        if (currentIndex < imageUrls.length - 1) {
          setSelectedImage(imageUrls[currentIndex + 1]);
          setZoomScale(1);
          setOffset({ x: 0, y: 0 });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, imageUrls]);

  // Initialize Firebase
  useEffect(() => {
    initFirebase();
  }, []);

  // onWheel handler for pinch zoom and panning in the modal.
  const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    e.preventDefault();
    const containerWidth = window.innerWidth - 20;
    const containerHeight = window.innerHeight - 20;

    if (e.ctrlKey) {
      const zoomSpeed = 1.3;
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      let newScale = zoomScale + delta * zoomSpeed;
      newScale = Math.min(Math.max(newScale, 1), 3);
      const maxOffsetX = (containerWidth * (newScale - 1)) / 2;
      const maxOffsetY = (containerHeight * (newScale - 1)) / 2;
      setZoomScale(newScale);
      setOffset((prev) => ({
        x: clamp(prev.x, -maxOffsetX, maxOffsetX),
        y: clamp(prev.y, -maxOffsetY, maxOffsetY),
      }));
    } else {
      const panSpeed = 2.2;
      const newX = offset.x - e.deltaX * panSpeed;
      const newY = offset.y - e.deltaY * panSpeed;
      const maxOffsetX = (containerWidth * (zoomScale - 1)) / 4;
      const maxOffsetY = (containerHeight * (zoomScale - 1)) / 1.5;
      setOffset({
        x: clamp(newX, -maxOffsetX, maxOffsetX),
        y: clamp(newY, -maxOffsetY, maxOffsetY),
      });
    }
  };

  if (isReadingImages) {
    return (
      <div className='flex items-center justify-center w-[100vw] h-[100vh]'>
        <Loader2 className='animate-spin' />
      </div>
    );
  }

  const imageContainerClass =
    gridLayout === "3x3"
      ? "w-[33.3vw] h-[33.3vw]"
      : gridLayout === "4x4"
      ? "w-[25vw] h-[25vw]"
      : "w-[20vw] h-[20vw]";

  return (
    <div
      className='w-[100vw] h-[100vh] overflow-x-hidden select-none relative'
      style={{ WebkitUserSelect: "none" }}
      draggable={false}
    >
      <AlertDialog open={wantToDelete}>
        <AlertDialogContent
          tabIndex={0}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              await deleteImage({
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
              });
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The image will be permanently
              deleted from your device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWantToDelete(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteImage({
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
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Navigator
        imageUrls={imageUrls}
        onImageAdd={setImageUrls}
        storageUrls={storageUrls}
        onStorageAdd={setStorageUrls}
        totalImageSize={totalImageSize}
        totalImageCount={totalImageCount}
        onImageSizeAdd={setTotalImageSize}
        onImageCountAdd={setTotalImageCount}
      />
      <ActionBar
        actionType={ActionType.Grid}
        grid={gridLayout}
        onGridChange={setGridLayout}
      />
      <Version />
      <div className='flex flex-wrap'>
        {imageUrls.length === 0 ? (
          <div className='flex justify-center items-center h-[100vh] mx-auto'>
            <Alert className='shadow-lg p-[30px]'>
              <Terminal className='h-4 w-4' />
              <AlertTitle>
                <Label className='font-bold'>
                  You don&apos;t have any images.
                </Label>
              </AlertTitle>
              <AlertDescription>
                You can add images using the add button at the bottom left!
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <></>
        )}
        {imageUrls.map((url, index) => (
          <ContextMenu key={index}>
            <ContextMenuTrigger>
              <div
                className={`${imageContainerClass} relative overflow-hidden transition-opacity duration-200 hover:opacity-80`}
                onClick={() => {
                  setSelectedImage(url);
                  setZoomScale(1);
                  setOffset({ x: 0, y: 0 });
                }}
              >
                <LazyImage
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  style={{ objectFit: "cover", WebkitUserSelect: "none" }}
                  draggable={false}
                  className='select-none'
                />
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={async () =>
                  exportImage(ImageFormat.PNG, storageUrls[index])
                }
              >
                Export as PNG
              </ContextMenuItem>
              <ContextMenuItem
                onClick={async () =>
                  exportImage(ImageFormat.AVIF, storageUrls[index])
                }
              >
                Export as AVIF
              </ContextMenuItem>
              <ContextMenuItem disabled> </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  setWantToDelete(true);
                  setIndexToDelete(index);
                }}
              >
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      {/* Modal overlay for the selected image */}
      {selectedImage && (
        <div
          className='fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-sm'
          onClick={() => {
            setSelectedImage(null);
            setZoomScale(1);
            setOffset({ x: 0, y: 0 });
          }}
          onWheel={handleWheel}
        >
          <Image
            src={selectedImage}
            onLoadingComplete={({ naturalWidth, naturalHeight }) => {
              setNaturalDimensions({
                width: naturalWidth,
                height: naturalHeight,
              });
            }}
            // Render the image at its natural dimensions
            width={naturalDimensions.width || 0}
            height={naturalDimensions.height || 0}
            alt='Full-size view'
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (zoomScale === 1) {
                setZoomScale(3);
                setOffset({ x: 0, y: 0 });
              } else {
                setZoomScale(1);
                setOffset({ x: 0, y: 0 });
              }
            }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              maxWidth: "calc(100vw - 20px)",
              maxHeight: "calc(100vh - 20px)",
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoomScale})`,
              WebkitUserSelect: "none",
            }}
            className='object-contain select-none'
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}
      <Toaster />
    </div>
  );
}
