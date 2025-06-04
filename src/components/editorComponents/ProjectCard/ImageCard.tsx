/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { Rnd } from "react-rnd";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { isHeic, heicTo } from "heic-to/csp";

import { toastError } from "@components/toasts/ErrorToast";

// import { auth, storage } from "@lib/firebase/firebaseApp";
import { getFirebaseAuth, getFirebaseStorage } from "@lib/firebase/firebaseApp";
const auth = getFirebaseAuth();
const storage = getFirebaseStorage();

import { GRID_SIZE, MAX_FILE_SIZE } from "@utils/constants";

interface ImageCardProps {
  cardId: number;
  imageUrl?: string;
  previewSrc?: string;
  draftNumber: string | null;
  onImageUpload: (cardId: number, url: string) => void;
  setPreviewSrc: (cardId: number, url: string | null) => void;
  isActive: boolean;
  widthPercent?: number;
  positionPercent?: { x: number; y: number };
  onLayoutChange: (
    cardId: number,
    layout: {
      widthPercent: number;
      positionPercent: { x: number; y: number };
    },
  ) => void;
}

export default function ImageCard({
  cardId,
  imageUrl,
  previewSrc,
  draftNumber,
  onImageUpload,
  setPreviewSrc,
  isActive = false,
  widthPercent: initialWidthPercent = 50,
  positionPercent: initialPositionPercent = { x: 0, y: 0 },
  onLayoutChange = () => {},
}: ImageCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parentSize, setParentSize] = useState({ width: 1, height: 1 });
  const [isHeicConverting, setIsHeicConverting] = useState(false);

  useLayoutEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (parent) {
      const { width, height } = parent.getBoundingClientRect();
      setParentSize({ width, height });
    }
  }, []);

  const [widthPercent, setWidthPercent] = useState(initialWidthPercent);
  const [positionPercent, setPositionPercent] = useState(
    initialPositionPercent,
  );

  const positionPx = {
    x: (positionPercent.x / 100) * parentSize.width,
    y: (positionPercent.y / 100) * parentSize.height,
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toastError(
        "Image size exceeds the 5MB limit. Please upload a smaller image.",
      );
      return;
    }

    if (await isHeic(file)) {
      try {
        setIsHeicConverting(true);
        const converted = await heicTo({
          blob: file,
          type: "image/png",
          quality: 0.9,
        });

        file = new File([converted], file.name.replace(/\.heic$/i, ".png"), {
          type: "image/png",
        });
      } catch {
        toastError("Failed to convert HEIC image.");
        setIsHeicConverting(false);
        return;
      } finally {
        setIsHeicConverting(false);
      }
    }

    const userId = auth.currentUser?.uid;
    const filePath = `users/${userId}/drafts/${draftNumber}/${cardId}-${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const localPreview = URL.createObjectURL(file);
    setPreviewSrc(cardId, localPreview);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("Upload failed:", error);
        setPreviewSrc(cardId, null);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onImageUpload(cardId, downloadURL);
        URL.revokeObjectURL(localPreview);
        setPreviewSrc(cardId, null);
      },
    );
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {imageUrl || previewSrc ? (
        <Rnd
          bounds="parent"
          size={{ width: `${widthPercent}%`, height: "auto" }}
          position={positionPx}
          onDragStop={(_, d) => {
            const newPos = {
              x: (d.x / parentSize.width) * 100,
              y: (d.y / parentSize.height) * 100,
            };
            setPositionPercent(newPos);
            onLayoutChange(cardId, {
              widthPercent,
              positionPercent: newPos,
            });
          }}
          onResizeStop={(_, __, ref, ____, newPosition) => {
            const newWidth = Number(ref.style.width.replace("%", ""));
            const newPos = {
              x: (newPosition.x / parentSize.width) * 100,
              y: (newPosition.y / parentSize.height) * 100,
            };
            setWidthPercent(newWidth);
            setPositionPercent(newPos);
            onLayoutChange(cardId, {
              widthPercent: newWidth,
              positionPercent: newPos,
            });
          }}
          dragGrid={[GRID_SIZE, GRID_SIZE]}
          resizeGrid={[GRID_SIZE, GRID_SIZE]}
          lockAspectRatio={true}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          disableDragging={!isActive}
          enableResizing={isActive}
          minWidth={"10%"}
        >
          <div className="w-full h-full flex items-center justify-center bg-gray-200 cursor-pointer">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={imageUrl}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </Rnd>
      ) : (
        <label className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-200">
          {isHeicConverting ? (
            <div>
              <svg
                aria-hidden="true"
                className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-400"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <>
              Click to Upload an Image
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </>
          )}
        </label>
      )}
    </div>
  );
}
