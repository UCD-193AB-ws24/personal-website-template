/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSearchParams } from 'next/navigation';

import SkeletonLoader from '@components/SkeletonLoader';

import type { ComponentItem, Position, Size } from '@customTypes/componentTypes';
import { handleDragStop, handleResizeStop } from '@utils/dragResizeUtils';
import { auth, storage } from '@lib/firebase/firebaseApp';

interface ImageComponentProps {
  id?: string;
  initialPos?: Position;
  initialSize?: Size;
  components?: ComponentItem[];
  content?: string;
  updateComponent?: (
    id: string,
    newPos: Position,
    newSize: Size,
    content?: string,
  ) => void;
  isActive?: boolean;
  onMouseDown?: () => void;
  setIsDragging?: (dragging: boolean) => void;
  isPreview?: boolean;
}

export default function ImageComponent({
  id = "",
  initialPos = { x: -1, y: -1 },
  initialSize = { width: 200, height: 150 },
  components = [],
  content = "",
  updateComponent = () => { },
  isActive = false,
  onMouseDown = () => { },
  setIsDragging = () => { },
  isPreview = false
}: ImageComponentProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [imageSrc, setImageSrc] = useState(content || "");
  const [loading, setLoading] = useState(!!content);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const draftNumber = useSearchParams().get("draftNumber");

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const resizeImage = (imageSrc: string, baseWidth: number = 300): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const newWidth = baseWidth;
        const newHeight = newWidth / aspectRatio;
        resolve({ width: newWidth, height: newHeight });
      };
    });
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const userId = auth.currentUser?.uid;
    const draftId = `${userId}-${draftNumber}`

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const filePath = `users/${userId}/drafts/${draftId}/${id}-${file.name}`
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const localPreview = URL.createObjectURL(file);
      setPreviewSrc(localPreview);
      setLoading(false);

      // Cleanup previous preview when component re-renders
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
      }

      let sizeSet = false;
      const size = await resizeImage(localPreview);
      setSize(size);
      sizeSet = true;

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed:", error);
          setLoading(false);
          setPreviewSrc(null);
        },
        async () => {
          // Get the download URL once uploaded
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageSrc(downloadURL);
          setPreviewSrc(null);

          if (!sizeSet) {
            const { width, height } = await resizeImage(downloadURL);
            setSize({ width, height });
          }
          updateComponent(id, position, size, downloadURL);
        }
      );
    }
  };

  return isPreview ? (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      className="overflow-hidden"
    >
      {loading && <SkeletonLoader width={size.width} height={size.height} />}
      {previewSrc ? (
        <img src={previewSrc} alt="Uploading Preview" className="w-full h-full object-cover" />
      ) : imageSrc ? (
        <img src={imageSrc} alt="Uploaded" className="w-full h-full object-cover" onLoad={() => setLoading(false)} onError={() => setLoading(false)} style={{ display: loading ? "none" : "block" }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          No Image
        </div>
      )}
    </div>
  ) : (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStart={(e) => {
        setIsDragging(true);
        e.preventDefault();
      }}
      onDragStop={(e, d) => {
        setIsDragging(false);
        handleDragStop(
          id,
          size,
          components,
          updateComponent,
          setPosition,
        )(e, d);
      }}
      onResizeStart={() => setIsDragging(true)}
      onResizeStop={(e, d, ref, delta, newPosition) => {
        setIsDragging(false);
        handleResizeStop(id, components, updateComponent, setSize, setPosition)(
          e,
          d,
          ref,
          delta,
          newPosition,
        );
      }}
      lockAspectRatio={true}
      minWidth={100}
      minHeight={100}
      bounds="parent"
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: "auto" }}
    >
      <div
        className={`w-full h-full border-2 transition-all duration-150 ease-in-out ${isActive ? 'border-blue-500 bg-gray-100 shadow-md' : 'border-transparent hover:border-gray-300'
          }`}
      >
        {loading && <SkeletonLoader width={size.width} height={size.height} />}

        {previewSrc ? (
          <img src={previewSrc} alt="Uploading Preview" className="w-full h-full object-cover" />
        ) : imageSrc ? (
          <img src={imageSrc} alt="Uploaded" className="w-full h-full object-cover" onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            style={{ display: loading ? "none" : "block" }} />
        ) : (
          <label className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-200">
            Click to Upload an Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    </Rnd>
  );
}
