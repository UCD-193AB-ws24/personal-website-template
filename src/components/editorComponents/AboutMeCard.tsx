/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSearchParams } from "next/navigation";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";
import SkeletonLoader from "@components/editorComponents/SkeletonLoader";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE } from "@utils/constants";
import { auth, storage } from "@lib/firebase/firebaseApp";

interface AboutMeCardContent {
  image: string;
  bio: string;
  contact: string;
}

interface AboutMeCardProps {
  id?: string;
  initialPos?: Position;
  initialSize?: Size;
  components?: ComponentItem[];
  content?: any;
  updateComponent?: (
    id: string,
    newPos: Position,
    newSize: Size,
    content?: any
  ) => void;
  isActive?: boolean;
  onMouseDown?: () => void;
  setIsDragging?: (dragging: boolean) => void;
  isPreview?: boolean;
}

export default function AboutMeCard({
  id = "",
  initialPos = { x: -1, y: -1 },
  initialSize = { width: 250, height: 250 },
  components = [],
  content = "",
  updateComponent = () => {},
  isActive = true,
  onMouseDown: onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
}: AboutMeCardProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [curContent, setCurContent] = useState({
    image: "No Image",
    bio: "Enter Bio here",
    contact: "email@email.com | (123)-456-7890",
  });

  const [loading, setLoading] = useState(!!content);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const draftNumber = useSearchParams().get("draftNumber");

  useEffect(() => {
    try {
      const jsonContent = JSON.parse(content);
      setCurContent(jsonContent);
    } catch (error) {
      console.error("Error logging out:", error);
      setCurContent({
        image: "No Image",
        bio: "Enter Bio here",
        contact: "email@email.com | (123)-456-7890",
      });
    }
  }, [content]);

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const resizeImage = (
    imageSrc: string,
    baseWidth: number = 300
  ): Promise<{ width: number; height: number }> => {
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

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const filePath = `users/${userId}/drafts/${draftNumber}/${id}-${file.name}`;

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
          setPreviewSrc(null);

          if (!sizeSet) {
            const { width, height } = await resizeImage(downloadURL);
            setSize({ width, height });
          }

          setCurContent((prevContent: AboutMeCardContent) => ({
            ...prevContent,
            image: downloadURL,
          }));

          updateComponent(
            id,
            position,
            size,
            JSON.stringify({
              ...curContent,
              image: downloadURL,
            })
          );
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
        padding: `${GRID_SIZE}px`,
      }}
      className="flex w-full h-full justify-between whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg"
    >
      {loading && <SkeletonLoader width={size.width} height={size.height} />}

      <div className="flex flex-col align-center">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt="Uploading Preview"
            className="w-full h-full"
            draggable="false"
          />
        ) : curContent.image != "No Image" ? (
          <img
            draggable="false"
            src={curContent.image}
            alt="Uploaded"
            className="w-full h-full"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            style={{ display: loading ? "none" : "block" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            No Image
          </div>
        )}
      </div>

      <div className="flex flex-col justify-around">
        <p
          draggable="false"
          className="overflow-hidden min-w-[300px] max-w-[300px] max-h-[60px] text-black cursor-text p-0 m-0 leading-none rounded-sm"
        >
          {curContent.bio}
        </p>

        <p
          draggable="false"
          className="overflow-hidden min-w-[300px] max-w-[300px] max-h-[60px] text-black cursor-text p-0 m-0 leading-none rounded-sm"
        >
          {curContent.contact}
        </p>
      </div>
    </div>
  ) : (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStart={() => {
        setIsDragging(true);
      }}
      onDragStop={(e, d) => {
        setIsDragging(false);
        handleDragStop(
          id,
          size,
          components,
          updateComponent,
          setPosition
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
          newPosition
        );
      }}
      minHeight={215}
      minWidth={630}
      bounds="parent"
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: "auto" }}
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
    >
      <ActiveOutlineContainer isActive={isActive}>
        <div
          className="flex w-full h-full justify-between whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg"
          style={{ padding: `${GRID_SIZE}px` }}
        >
          {loading && (
            <SkeletonLoader width={size.width} height={size.height} />
          )}

          <div className="flex flex-col align-center">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt="Uploading Preview"
                className="w-full h-full"
                draggable="false"
              />
            ) : curContent.image != "No Image" ? (
              <img
                draggable="false"
                src={curContent.image}
                alt="Uploaded"
                className="w-full h-full"
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                style={{ display: loading ? "none" : "block" }}
              />
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

          <div className="flex flex-col justify-around">
            <p
              contentEditable
              suppressContentEditableWarning
              draggable="false"
              className="overflow-hidden min-w-[300px] max-w-[300px] max-h-[120px] text-black cursor-text p-0 m-0 leading-none outline outline-gray-300 rounded-sm"
              style={{
                outline: `${!isActive ? "none" : ""}`,
              }}
              onBlur={(e) => {
                setCurContent((prevContent: AboutMeCardContent) => ({
                  ...prevContent,
                  bio: e.target.innerText,
                }));
                updateComponent(
                  id,
                  position,
                  size,
                  JSON.stringify({
                    ...curContent,
                    bio: e.target.innerText,
                  })
                );
              }}
            >
              {curContent.bio}
            </p>

            <p
              contentEditable
              suppressContentEditableWarning
              draggable="false"
              className="overflow-hidden min-w-[300px] max-w-[300px] max-h-[60px] text-black cursor-text p-0 m-0 leading-none outline outline-gray-300 rounded-sm"
              style={{
                outline: `${!isActive ? "none" : ""}`,
              }}
              onBlur={(e) => {
                setCurContent((prevContent: AboutMeCardContent) => ({
                  ...prevContent,
                  contact: e.target.innerText,
                }));
                updateComponent(
                  id,
                  position,
                  size,
                  JSON.stringify({
                    ...curContent,
                    contact: e.target.innerText,
                  })
                );
              }}
            >
              {curContent.contact}
            </p>
          </div>
        </div>
      </ActiveOutlineContainer>
    </Rnd>
  );
}
