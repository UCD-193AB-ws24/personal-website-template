/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSearchParams } from "next/navigation";
import { isHeic, heicTo } from "heic-to/csp";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";
import { toastError } from "@components/toasts/ErrorToast";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE, MAX_FILE_SIZE } from "@utils/constants";

import { getFirebaseAuth, getFirebaseStorage } from "@lib/firebase/firebaseApp";
const auth = getFirebaseAuth();
const storage = getFirebaseStorage();
import RichTextbox from "@components/RichText/RichTextbox";
import RichTextToolbarPlugin from "@components/RichText/Plugins/RichTextToolbar";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextInitialConfig } from "@components/RichText/RichTextSettings";

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
    content?: any,
  ) => void;
  isActive?: boolean;
  onMouseDown?: () => void;
  setIsDragging?: (dragging: boolean) => void;
  isPreview?: boolean;
  isDragOverlay?: boolean;
}

export default function AboutMeCard({
  id = "",
  initialPos = { x: -1, y: -1 },
  initialSize = { width: 740, height: 215 },
  components = [],
  content = {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 1,
              mode: "normal",
              style: "font-size: 24px;",
              text: "First Last",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 1,
          textStyle: "font-size: 24px;",
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "Enter information here",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 0,
          textStyle: "",
        },
        {
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 0,
          textStyle: "",
        },
        {
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 0,
          textStyle: "",
        },
        {
          children: [
            {
              detail: 0,
              format: 2,
              mode: "normal",
              style: "",
              text: "example@email.com  ",
              type: "text",
              version: 1,
            },
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "| ",
              type: "text",
              version: 1,
            },
            {
              detail: 0,
              format: 2,
              mode: "normal",
              style: "",
              text: "(123) - 456 - 7890",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 2,
          textStyle: "",
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
      textFormat: 1,
      textStyle: "font-size: 24px;",
    },
  },
  updateComponent = () => {},
  isActive = true,
  onMouseDown: onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
  isDragOverlay = false,
}: AboutMeCardProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [data, setData] = useState(content);
  const [imageUrl, setImageUrl] = useState<string | null>(
    content?.image ?? null,
  );
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [imageSizePx, setImageSizePx] = useState<{
    width: number;
    height: number;
  }>(content?.imageLayout?.sizePx ?? { width: 200, height: 200 });

  const [imagePositionPx, setImagePositionPx] = useState<{
    x: number;
    y: number;
  }>(content?.imageLayout?.positionPx ?? { x: 0, y: 0 });
  const [showOverlay, setShowOverlay] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [parentSize, setParentSize] = useState({ width: 1, height: 1 });
  const imgRef = useRef<HTMLDivElement>(null);
  const [isHeicConverting, setIsHeicConverting] = useState(false);

  const draftNumber = useSearchParams().get("draftNumber");

  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    setParentSize({ width, height });
  }, [size.width, size.height]);

  useEffect(() => {
    try {
      const parsedContent =
        typeof content === "string" ? JSON.parse(content) : content;

      setData(parsedContent);
      if (parsedContent?.image) {
        setImageUrl(parsedContent.image);
      }

      if (parsedContent?.imageLayout) {
        setImageSizePx(parsedContent.imageLayout.sizePx ?? 200);
        setImagePositionPx(
          parsedContent.imageLayout.positionPx ?? { x: 0, y: 0 },
        );
      }
    } catch (err) {
      console.error("Failed to parse content for AboutMeCard:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const updateTextboxState = (newState: string) => {
    const isObject = typeof data === "object" && data !== null;

    const newData = {
      backgroundColor: isObject
        ? (data.backgroundColor ?? "transparent")
        : "transparent",
      image: imageUrl,
      imageLayout: {
        sizePx: imageSizePx,
        positionPx: imagePositionPx,
      },
      textboxState: newState,
    };

    setData(newData);
    updateComponent(id, position, size, newData);
  };

  const updateBackgroundColor = (newBgColor: string) => {
    const isObject = typeof data === "object" && data !== null;

    const newData = {
      backgroundColor: newBgColor,
      textboxState: isObject ? (data.textboxState ?? "") : data,
      image: imageUrl,
      imageLayout: {
        sizePx: imageSizePx,
        positionPx: imagePositionPx,
      },
    };

    setData(newData);
    updateComponent(id, position, size, newData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const userId = auth.currentUser?.uid;
    let file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toastError("Image size exceeds 5MB. Please upload a smaller image.");
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

    const filePath = `users/${userId}/drafts/${draftNumber}/${id}-${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    const localPreview = URL.createObjectURL(file);
    setPreviewSrc(localPreview);

    const img = new Image();
    img.src = localPreview;
    img.onload = async () => {
      const aspectRatio = img.height / img.width;
      const targetWidth = parentSize.width * 0.4;
      const targetHeight = targetWidth * aspectRatio;
      const targetSize = { width: targetWidth, height: targetHeight };
      setImageSizePx(targetSize);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed:", error);
          setPreviewSrc(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadURL);
          setPreviewSrc(null);

          updateComponent(id, position, size, {
            ...data,
            image: downloadURL,
            imageLayout: {
              sizePx: targetSize,
              positionPx: imagePositionPx,
            },
          });
        },
      );
    };
  };

  const updateImageSizeAndPositionPx = () => {
    const imgContainer = imageContainerRef.current;
    const img = imgRef.current;

    if (!imgContainer || !img) return;

    const containerRect = imgContainer.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const width = imgRect.width;
    const height = imgRect.height;
    const x = imgRect.left - containerRect.left;
    const y = imgRect.top - containerRect.top;

    const clampedX = Math.max(0, Math.min(x, containerRect.width - width));
    const clampedY = Math.max(0, Math.min(y, containerRect.height - height));

    const newSize = { width, height };
    const newPos = { x: clampedX, y: clampedY };

    setImageSizePx(newSize);
    setImagePositionPx(newPos);

    updateComponent(id, position, size, {
      ...data,
      image: imageUrl,
      imageLayout: {
        sizePx: newSize,
        positionPx: newPos,
      },
      textboxState: data.textboxState ?? "",
      backgroundColor: data.backgroundColor ?? "transparent",
    });
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
    >
      <LexicalComposer initialConfig={RichTextInitialConfig}>
        <div
          className="w-full h-full rounded"
          style={{ backgroundColor: data.backgroundColor || "transparent" }}
        >
          <div
            className="flex w-full h-full gap-[40px] whitespace-pre-wrap bg-transparent resize-none text-lg"
            style={{ padding: `${GRID_SIZE}px` }}
          >
            <div className="relative w-full h-full">
              <div
                style={{
                  position: "relative",
                  width: `${imageSizePx.width}px`,
                  height: `${imageSizePx.height}px`,
                  left: `${imagePositionPx.x}px`,
                  top: `${imagePositionPx.y}px`,
                }}
              >
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    No Image
                  </div>
                )}
              </div>
            </div>

            <div className="w-full h-full flex flex-col gap-[60px]">
              <RichTextbox
                isPreview={isPreview}
                textboxState={data.textboxState || data}
                updateTextboxState={updateTextboxState}
                isActive={isActive}
              />
            </div>
          </div>
        </div>
      </LexicalComposer>
    </div>
  ) : (
    <LexicalComposer initialConfig={RichTextInitialConfig}>
      {isActive && !isDragOverlay && (
        <RichTextToolbarPlugin updateBackgroundColor={updateBackgroundColor} />
      )}
      <Rnd
        size={{ width: size.width, height: size.height }}
        position={{ x: position.x, y: position.y }}
        onDragStart={() => {
          setIsDragging(true);
          setShowOverlay(false);
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
        onResize={(_, __, ref, ___, ____) => {
          // Force children to update/re-render: this prevents the image from snapping
          // into position after the resize event stops
          const rect = ref.getBoundingClientRect();
          setSize({ width: rect.width, height: rect.height });

          updateImageSizeAndPositionPx();
        }}
        onResizeStart={() => {
          setIsDragging(true);
        }}
        onResizeStop={(e, d, ref, delta, newPosition) => {
          setIsDragging(false);
          handleResizeStop(
            id,
            components,
            updateComponent,
            setSize,
            setPosition,
          )(e, d, ref, delta, newPosition);
        }}
        minHeight={Math.max(215, imageSizePx.height + 20 || 215)}
        minWidth={Math.max(630, imageSizePx.width + 300 || 630)}
        bounds="parent"
        onMouseDown={handleMouseDown}
        style={{ pointerEvents: "auto" }}
        dragGrid={[GRID_SIZE, GRID_SIZE]}
        resizeGrid={[GRID_SIZE, GRID_SIZE]}
      >
        <ActiveOutlineContainer isActive={isActive}>
          <div
            className="w-full h-full rounded"
            style={{ backgroundColor: data.backgroundColor || "transparent" }}
          >
            {/* Overlay for enabling drag */}
            {(showOverlay || !isActive) && (
              <div
                className="w-full h-full flex items-center justify-center absolute inset-0 z-10"
                onMouseDown={() => setShowOverlay(true)}
              ></div>
            )}

            <div
              onMouseEnter={() => setShowOverlay(false)} // remove overlay when interacting with iframe
              onMouseDown={(e) => e.stopPropagation()} // capture mouse movements
              className="w-full h-full cursor-default"
            >
              <div
                className="flex w-full h-full gap-[40px] whitespace-pre-wrap bg-transparent resize-none text-lg"
                style={{ padding: `${GRID_SIZE}px` }}
              >
                <div
                  ref={imageContainerRef}
                  className="relative w-full h-full border border-gray-300"
                  style={{
                    width: "100%",
                    minWidth: `${imageSizePx.width}px`,
                  }}
                >
                  {previewSrc || imageUrl ? (
                    <Rnd
                      bounds="parent"
                      size={imageSizePx}
                      position={imagePositionPx}
                      minWidth={100}
                      minHeight={100}
                      onDragStop={(_, d) => {
                        const newPos = { x: d.x, y: d.y };
                        setImagePositionPx(newPos);
                        updateComponent(id, position, size, {
                          ...data,
                          image: imageUrl,
                          imageLayout: {
                            sizePx: imageSizePx,
                            positionPx: newPos,
                          },
                          textboxState: data.textboxState ?? "",
                          backgroundColor:
                            data.backgroundColor ?? "transparent",
                        });
                      }}
                      onResizeStop={(_, __, ref, ____, newPosition) => {
                        const newWidth = ref.offsetWidth;
                        const newHeight = ref.offsetHeight;
                        const newSize = { width: newWidth, height: newHeight };
                        const newPos = { x: newPosition.x, y: newPosition.y };
                        setImageSizePx(newSize);
                        setImagePositionPx(newPos);
                        updateComponent(id, position, size, {
                          ...data,
                          image: imageUrl,
                          imageLayout: {
                            sizePx: newSize,
                            positionPx: newPos,
                          },
                          textboxState: data.textboxState ?? "",
                          backgroundColor:
                            data.backgroundColor ?? "transparent",
                        });
                      }}
                      lockAspectRatio
                      dragGrid={[GRID_SIZE, GRID_SIZE]}
                      resizeGrid={[GRID_SIZE, GRID_SIZE]}
                      disableDragging={!isActive}
                      enableResizing={isActive}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div
                        ref={imgRef}
                        className="w-full h-full flex items-center justify-center bg-gray-200 cursor-pointer"
                      >
                        {previewSrc ? (
                          <img
                            src={previewSrc}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : imageUrl ? (
                          <img
                            draggable={false}
                            src={imageUrl}
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                          />
                        ) : null}
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
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </>
                      )}
                    </label>
                  )}
                </div>

                <div className="w-full h-full flex flex-col gap-[60px]">
                  <RichTextbox
                    isPreview={isPreview}
                    textboxState={data.textboxState || data}
                    updateTextboxState={updateTextboxState}
                    isActive={isActive}
                  />
                </div>
              </div>
            </div>
          </div>
        </ActiveOutlineContainer>
      </Rnd>
    </LexicalComposer>
  );
}
