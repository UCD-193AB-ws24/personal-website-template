"use client";

import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { MoveIcon } from "lucide-react";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";
import { toastError } from "@components/toasts/ErrorToast";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";
import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE } from "@utils/constants";

interface WebPageComponent {
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

export default function WebPageComponent({
  id = "",
  initialPos = { x: -1, y: -1 },
  initialSize = { width: 225, height: 125 },
  components = [],
  content = "",
  updateComponent = () => {},
  isActive = false,
  onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
}: WebPageComponent) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [webpageSrc, setWebPageSrc] = useState(content || "");
  const [showOverlay, setShowOverlay] = useState(false);

  // Track the initial mouse position for threshold logic
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const dragThreshold = 10; // Minimum movement (px) before dragging starts

  const isValidURL = (url: string) => {
    // https://regex101.com/r/3fYy3x/1
    const validURLRegex =
      /((([A-Za-z]{3,9}:(?:\/\/)?)?(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+\.[A-Za-z]{2,6}|(?:www\.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+\.[A-Za-z]{2,6})((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
    const match = url.match(validURLRegex);
    return match ? true : false;
  };

  const handleWebPageLink = () => {
    const inputElement = document.getElementById(
      `${id}-webpage-input`,
    ) as HTMLInputElement;
    let url = inputElement?.value.trim();
    if (!url) return;

    // Prepend http:// or https:// if url doesn't have it
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    if (isValidURL(url)) {
      setWebPageSrc(url);
      updateComponent(id, position, size, url);
    } else {
      toastError("Invalid URL. Please enter a valid URL.");
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
      {webpageSrc ? (
        <iframe
          className="w-full h-full"
          src={webpageSrc}
          allowFullScreen
          style={{ pointerEvents: "auto" }}
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          No URL
        </div>
      )}
    </div>
  ) : (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStart={() => setIsDragging(true)}
      onDrag={(e, _d) => {
        setIsDragging(true);
        setShowOverlay(true);
        if (startPos.current) {
          let clientX: number;
          let clientY: number;
          if ("clientX" in e) {
            clientX = e.clientX;
            clientY = e.clientY;
          } else if ("touches" in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
          } else {
            return;
          }

          const dx = Math.abs(clientX - startPos.current.x);
          const dy = Math.abs(clientY - startPos.current.y);

          if (dx > dragThreshold || dy > dragThreshold) {
            setIsDragging(true);
          }
        }
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
      minWidth={250}
      minHeight={125}
      bounds="parent"
      onMouseDown={(e) => {
        startPos.current = { x: e.clientX, y: e.clientY };
        setShowOverlay(false);
        onMouseDown();
      }}
      style={{ pointerEvents: "auto" }}
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
    >
      <ActiveOutlineContainer isActive={isActive}>
        {webpageSrc ? (
          <div className="relative w-full h-full">
            {/* Overlay for enabling drag */}
            {(showOverlay || !isActive) && (
              <div
                className="w-full h-full flex items-center justify-center absolute inset-0 bg-gray-100 bg-opacity-15 z-10"
                onMouseDown={() => setShowOverlay(true)}
              >
                <div className="absolute w-16 h-16 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <MoveIcon size={48} className="text-white" />
                </div>
              </div>
            )}

            {/* Web Page Viewer */}
            <iframe
              className="w-full h-full"
              src={webpageSrc}
              allowFullScreen
              style={{
                pointerEvents: showOverlay ? "none" : "auto", // Allow interaction after dragging
              }}
              onMouseEnter={() => setShowOverlay(false)} // Remove overlay when interacting with iframe
            ></iframe>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center bg-gray-200 p-4">
            <label className="text-lg font-medium text-gray-700 mb-2">
              Enter a Link
            </label>
            <div className="flex w-full max-w-md space-x-2">
              <input
                type="text"
                placeholder="Paste link here..."
                className="flex-1 p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleWebPageLink();
                }}
                id={`${id}-webpage-input`}
                onMouseDown={(e) => e.stopPropagation()}
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleWebPageLink}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Embed
              </button>
            </div>
          </div>
        )}
      </ActiveOutlineContainer>
    </Rnd>
  );
}
