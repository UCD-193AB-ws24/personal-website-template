/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSearchParams } from "next/navigation";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";
import { toastError } from "@components/toasts/ErrorToast";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE, MAX_FILE_SIZE } from "@utils/constants";
import { auth, storage } from "@lib/firebase/firebaseApp";
import RichTextbox from "@components/RichText/RichTextbox";
import RichTextToolbarPlugin from "@components/RichText/Plugins/RichTextToolbar";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import {
  RichTextInitialConfig,
} from "@components/RichText/RichTextSettings";

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
  isDragOverlay?: boolean;
}

export default function AboutMeCard({
  id = "",
  initialPos = { x: -1, y: -1 },
  initialSize = { width: 740, height: 215 },
  components = [],
  content = { "root": { "children": [{ "children": [{ "detail": 0, "format": 1, "mode": "normal", "style": "font-size: 24px;", "text": "First Last", "type": "text", "version": 1 }], "direction": "ltr", "format": "", "indent": 0, "type": "paragraph", "version": 1, "textFormat": 1, "textStyle": "font-size: 24px;" }, { "children": [{ "detail": 0, "format": 0, "mode": "normal", "style": "", "text": "Enter information here", "type": "text", "version": 1 }], "direction": "ltr", "format": "", "indent": 0, "type": "paragraph", "version": 1, "textFormat": 0, "textStyle": "" }, { "children": [], "direction": "ltr", "format": "", "indent": 0, "type": "paragraph", "version": 1, "textFormat": 0, "textStyle": "" }, { "children": [], "direction": "ltr", "format": "", "indent": 0, "type": "paragraph", "version": 1, "textFormat": 0, "textStyle": "" }, { "children": [{ "detail": 0, "format": 2, "mode": "normal", "style": "", "text": "example@ email.com  ", "type": "text", "version": 1 }, { "detail": 0, "format": 0, "mode": "normal", "style": "", "text": "| ", "type": "text", "version": 1 }, { "detail": 0, "format": 2, "mode": "normal", "style": "", "text": "(123) - 456 - 7890", "type": "text", "version": 1 }], "direction": "ltr", "format": "", "indent": 0, "type": "paragraph", "version": 1, "textFormat": 2, "textStyle": "" }], "direction": "ltr", "format": "", "indent": 0, "type": "root", "version": 1, "textFormat": 1, "textStyle": "font-size: 24px;" } },
  updateComponent = () => { },
  isActive = true,
  onMouseDown: onMouseDown = () => { },
  setIsDragging = () => { },
  isPreview = false,
  isDragOverlay = false,
}: AboutMeCardProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [data, setData] = useState(content);
  const [imageUrl, setImageUrl] = useState<string | null>(content?.image ?? null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [imageWidthPercent, setImageWidthPercent] = useState<number>(
    content?.imageLayout?.widthPercent ?? 40
  );
  const [imagePositionPercent, setImagePositionPercent] = useState<{ x: number; y: number }>(
    content?.imageLayout?.positionPercent ?? { x: 0, y: 0 }
  );
  const [showOverlay, setShowOverlay] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [parentSize, setParentSize] = useState({ width: 1, height: 1 });

  const draftNumber = useSearchParams().get("draftNumber");

  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    setParentSize({ width, height });
  }, [size.width, size.height]);

  useEffect(() => {
    try {
      const parsedContent = typeof content === "string" ? JSON.parse(content) : content;

      setData(parsedContent);
      if (parsedContent?.image) {
        setImageUrl(parsedContent.image);
      }

      if (parsedContent?.imageLayout) {
        setImageWidthPercent(parsedContent.imageLayout.widthPercent ?? 40);
        setImagePositionPercent(parsedContent.imageLayout.positionPercent ?? { x: 0, y: 0 });
      }
    } catch (err) {
      console.error("Failed to parse content for AboutMeCard:", err);
    }
  }, [content]);


  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const updateTextboxState = (newState: string) => {
    const isObject = typeof data === "object" && data !== null;

    const newData = {
      backgroundColor: isObject ? data.backgroundColor ?? "transparent" : "transparent",
      image: imageUrl,
      imageLayout: {
        widthPercent: imageWidthPercent,
        positionPercent: imagePositionPercent
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
      textboxState: isObject ? data.textboxState ?? "" : data,
      image: imageUrl,
      imageLayout: {
        widthPercent: imageWidthPercent,
        positionPercent: imagePositionPercent
      },
    };

    setData(newData);
    updateComponent(id, position, size, newData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const userId = auth.currentUser?.uid;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toastError("Image size exceeds 5MB. Please upload a smaller image.");
      return;
    }

    const filePath = `users/${userId}/drafts/${draftNumber}/${id}-${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    const localPreview = URL.createObjectURL(file);
    setPreviewSrc(localPreview);

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
            widthPercent: imageWidthPercent,
            positionPercent: imagePositionPercent,
          },
        });
      }
    );
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
            <div className="relative w-full h-full"
            >
              <div
                style={{
                  position: "relative",
                  width: `${(imageWidthPercent)}%`,
                  left: `${imagePositionPercent.x}%`,
                  top: `${imagePositionPercent.y}%`,
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
            className="w-full h-full rounded"
            style={{ backgroundColor: data.backgroundColor || "transparent" }}
          >

            {/* Overlay for enabling drag */}
            {(showOverlay || !isActive) && (
              <div
                className="w-full h-full flex items-center justify-center absolute inset-0 z-10"
                onMouseDown={() => setShowOverlay(true)}
              >
              </div>
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
                <div ref={imageContainerRef} className="relative w-full h-full border border-gray-300">
                  {(previewSrc || imageUrl) ? (
                    <Rnd
                      bounds="parent"
                      size={{ width: `${imageWidthPercent}%`, height: "auto" }}
                      position={{
                        x: (imagePositionPercent.x / 100) * parentSize.width,
                        y: (imagePositionPercent.y / 100) * parentSize.height,
                      }}
                      minWidth={100}
                      minHeight={100}
                      onDragStop={(_, d) => {
                        const newPos = {
                          x: (d.x / parentSize.width) * 100,
                          y: (d.y / parentSize.height) * 100,
                        };
                        setImagePositionPercent(newPos);
                        updateComponent(id, position, size, {
                          ...data,
                          image: imageUrl,
                          imageLayout: {
                            widthPercent: imageWidthPercent,
                            positionPercent: newPos,
                          },
                          textboxState: data.textboxState ?? "",
                          backgroundColor: data.backgroundColor ?? "transparent",
                        });
                      }}
                      onResizeStop={(_, __, ref, ____, newPosition) => {
                        const newWidth = Number(ref.style.width.replace("%", ""));
                        const newPos = {
                          x: (newPosition.x / parentSize.width) * 100,
                          y: (newPosition.y / parentSize.height) * 100,
                        };
                        setImageWidthPercent(newWidth);
                        setImagePositionPercent(newPos);
                        updateComponent(id, position, size, {
                          ...data,
                          image: imageUrl,
                          imageLayout: {
                            widthPercent: newWidth,
                            positionPercent: newPos,
                          },
                          textboxState: data.textboxState ?? "",
                          backgroundColor: data.backgroundColor ?? "transparent",
                        });
                      }}
                      lockAspectRatio
                      dragGrid={[GRID_SIZE, GRID_SIZE]}
                      resizeGrid={[GRID_SIZE, GRID_SIZE]}
                      disableDragging={!isActive}
                      enableResizing={isActive}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 cursor-pointer">
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
                        ) : null}
                      </div>
                    </Rnd>)
                    : (
                      <label className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-200">
                        Click to Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
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
    </LexicalComposer >
  );
}
