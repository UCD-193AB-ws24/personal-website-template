/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { Rnd } from "react-rnd";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { auth, storage } from "@lib/firebase/firebaseApp";
import { GRID_SIZE } from "@utils/constants";

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
  onLayoutChange: (cardId: number, layout: {
    widthPercent: number;
    positionPercent: { x: number; y: number };
  }) => void;
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
  onLayoutChange = () => { },
}: ImageCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parentSize, setParentSize] = useState({ width: 1, height: 1 });

  useLayoutEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (parent) {
      const { width, height } = parent.getBoundingClientRect();
      setParentSize({ width, height });
    }
  }, []);


  const [widthPercent, setWidthPercent] = useState(initialWidthPercent);
  const [positionPercent, setPositionPercent] = useState(initialPositionPercent);

  const positionPx = {
    x: (positionPercent.x / 100) * parentSize.width,
    y: (positionPercent.y / 100) * parentSize.height,
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      }
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
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          Click to Upload Image
        </label>
      )}
    </div>
  );
}
