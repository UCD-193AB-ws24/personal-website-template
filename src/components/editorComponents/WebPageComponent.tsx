"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { MoveIcon } from "lucide-react";
import { toast, Flip } from "react-toastify";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";
import ErrorToast from "@components/toasts/ErrorToast";

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
  const [isOverlayActive, setIsOverlayActive] = useState(true);

  const handleMouseDown = (e: MouseEvent | React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
    setIsOverlayActive(false); // Hide overlay when clicked
  };

  const isValidURL = (url: string) => {
    // https://regex101.com/r/3fYy3x/1
    const validURLRegex =
      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
    const match = url.match(validURLRegex);
    return match ? true : false;
  };

  const handleWebPageLink = () => {
    const inputElement = document.getElementById(
      `${id}-webpage-input`,
    ) as HTMLInputElement;
    const url = inputElement?.value.trim();
    if (!url) return;

    if (isValidURL(url)) {
      setWebPageSrc(url);
      updateComponent(id, position, size, url);
    } else {
      toast(
        (props) => (
          <ErrorToast
            {...props}
            message="Invalid URL. Please enter a valid URL."
          />
        ),
        {
          position: "top-right",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "light",
          transition: Flip,
        },
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
      minWidth={250}
      minHeight={125}
      bounds="parent"
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: "auto" }}
      dragHandleClassName={`${id}-drag-handle`}
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
    >
      <ActiveOutlineContainer isActive={isActive}>
        {webpageSrc ? (
          <div className="relative w-full h-full">
            {/* Transparent Overlay to Capture Clicks */}
            {isOverlayActive && (
              <div
                className="absolute inset-0 bg-transparent z-10 cursor-pointer"
                onMouseDown={handleMouseDown}
              />
            )}

            {/* Web Page Viewer */}
            <iframe
              className="w-full h-full"
              src={webpageSrc}
              allowFullScreen
              style={{ pointerEvents: "auto" }}
              onMouseLeave={() => setIsOverlayActive(true)} // Re-enable overlay when leaving iframe
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
      {isActive && (
        <div
          className={`${id}-drag-handle absolute top-10 right-[-30px] w-6 h-6 bg-gray-300 rounded-md cursor-move flex items-center justify-center z-10`}
        >
          <MoveIcon />
        </div>
      )}
    </Rnd>
  );
}
