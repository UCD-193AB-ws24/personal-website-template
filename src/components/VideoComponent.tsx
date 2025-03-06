"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { MoveIcon } from "lucide-react";
import { toast, Flip } from "react-toastify";

import ErrorToast from "@components/ErrorToast";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";
import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";

interface VideoComponentProps {
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

export default function VideoComponent({
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
}: VideoComponentProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [videoSrc, setVideoSrc] = useState(content || "");
  const [isOverlayActive, setIsOverlayActive] = useState(true);

  const handleMouseDown = (e: MouseEvent | React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
    setIsOverlayActive(false); // Hide overlay when clicked
  };

  const extractYouTubeId = (url: string) => {
    // https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
    const videoIDRegEx =
      /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=)([^#\&\?]*).*/;
    const match = url.match(videoIDRegEx);
    return match ? match[1] : null;
  };

  const handleYouTubeLink = () => {
    const inputElement = document.getElementById(
      `${id}-youtube-input`,
    ) as HTMLInputElement;
    const url = inputElement?.value.trim();
    if (!url) return;

    const videoId = extractYouTubeId(url);
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      setVideoSrc(embedUrl);
      updateComponent(id, position, size, embedUrl);
    } else {
      toast(
        (props) => (
          <ErrorToast
            {...props}
            message="Invalid YouTube video URL. Please enter a valid URL."
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
      {videoSrc ? (
        <iframe
          className="w-full h-full"
          src={videoSrc}
          allowFullScreen
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          No Video
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
      minWidth={250}
      minHeight={125}
      bounds="parent"
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: "auto" }}
      dragHandleClassName={`${id}-drag-handle`}
    >
      <div
        className={`w-full h-full border-2 transition-all duration-150 ease-in-out ${
          isActive
            ? "border-blue-500 bg-gray-100 shadow-lg"
            : "border-transparent hover:border-gray-300"
        }`}
      >
        {videoSrc ? (
          <div className="relative w-full h-full">
            {/* Transparent Overlay to Capture Clicks */}
            {isOverlayActive && (
              <div
                className="absolute inset-0 bg-transparent z-10 cursor-pointer"
                onMouseDown={handleMouseDown}
              />
            )}

            {/* Youtube Viewer */}
            <iframe
              className="w-full h-full"
              src={videoSrc}
              allowFullScreen
              style={{ pointerEvents: "auto" }}
              onMouseLeave={() => setIsOverlayActive(true)} // Re-enable overlay when leaving iframe
            ></iframe>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center bg-gray-200 p-4">
            <label className="text-lg font-medium text-gray-700 mb-2">
              Enter a YouTube Link
            </label>
            <div className="flex w-full max-w-md space-x-2">
              <input
                type="text"
                placeholder="Paste YouTube link here..."
                className="flex-1 p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleYouTubeLink();
                }}
                id={`${id}-youtube-input`}
                onMouseDown={(e) => e.stopPropagation()}
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleYouTubeLink}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Embed
              </button>
            </div>
          </div>
        )}
      </div>
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
