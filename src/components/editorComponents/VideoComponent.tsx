"use client";

import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { PlayIcon } from "lucide-react";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";
import { toastError } from "@components/toasts/ErrorToast";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";
import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE } from "@utils/constants";

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
  const [showOverlay, setShowOverlay] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (videoSrc) {
      const videoId = extractYouTubeId(videoSrc);
      if (videoId) {
        setThumbnail(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      }
    }
  }, [videoSrc]);

  useEffect(() => {
    // Pause YouTube video when not active
    if (!isActive && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        '{"event":"command","func":"pauseVideo","args":""}',
        "*",
      );
    }
  }, [isActive]);

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
      toastError("Invalid YouTube video URL. Please enter a valid URL.");
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
      onDragStart={() => {
        setIsDragging(true);
        setShowOverlay(true);
      }}
      onDragStop={(e, d) => {
        setIsDragging(false);
        setShowOverlay(false);
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
      onMouseDown={() => {
        setShowOverlay(false);
        onMouseDown();
      }}
      style={{ pointerEvents: "auto" }}
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
    >
      <ActiveOutlineContainer isActive={isActive}>
        {videoSrc ? (
          <>
            {/* Overlay for enabling drag */}
            {(showOverlay || !isActive) && (
              <div
                className="w-full h-full flex items-center justify-center absolute inset-0 bg-gray-300 bg-opacity-50 z-10"
                onMouseDown={() => setShowOverlay(true)}
              >
                {thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable="false"
                  />
                )}

                {/* Play Button Overlay */}
                <div className="absolute w-16 h-16 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <PlayIcon size={48} className="text-white" />
                </div>
              </div>
            )}
            <iframe
              className="w-full h-full"
              ref={iframeRef}
              src={`${videoSrc}?enablejsapi=1`}
              allowFullScreen
              style={{
                pointerEvents: showOverlay ? "none" : "auto", // Allow interaction after dragging
              }}
              onMouseEnter={() => setShowOverlay(false)} // Remove overlay when interacting with iframe
            ></iframe>
          </>
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
      </ActiveOutlineContainer>
    </Rnd>
  );
}
