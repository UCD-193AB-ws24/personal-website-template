"use client";

import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { MoveIcon } from "lucide-react";
import { toast, Flip } from "react-toastify";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSearchParams } from "next/navigation";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";
import ErrorToast, { toastError } from "@components/toasts/ErrorToast";
import SkeletonLoader from "@components/editorComponents/SkeletonLoader";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";
import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE } from "@utils/constants";
import { auth, storage } from "@lib/firebase/firebaseApp";

interface FileComponentProps {
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

export default function FileComponent({
  id = "",
  initialPos = { x: -1, y: -100 },
  initialSize = { width: 200, height: 300 },
  components = [],
  content = "",
  updateComponent = () => {},
  isActive = false,
  onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
}: FileComponentProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [pdfSrc, setPdfSrc] = useState(content || "");
  const [loading, setLoading] = useState(!!content);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Track the initial mouse position for threshold logic
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const dragThreshold = 10; // Minimum movement (px) before dragging starts

  const draftNumber = useSearchParams().get("draftNumber");

  // https://stackoverflow.com/questions/58488416/open-base64-encoded-pdf-file-using-javascript-issue-with-file-size-larger-than
  const MAX_FILE_SIZE = 5 * 1024 * 1025; // max 5MB upload for now

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userId = auth.currentUser?.uid;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        toastError("File size exceeds the 5MB limit. Please upload a smaller file.");
        return;
      }
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
          console.log("Success:", downloadURL);
          setPdfSrc(downloadURL);
          setPreviewSrc(null);
          updateComponent(id, position, size, downloadURL);
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
      {loading && <SkeletonLoader width={size.width} height={size.height} />}
      {previewSrc ? (
        <iframe src={previewSrc} className="w-full h-full border-none" />
      ) : pdfSrc ? (
        <iframe
          src={pdfSrc}
          className="w-full h-full border-none"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          style={{ display: loading ? "none" : "block" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          No PDF
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
        {loading && <SkeletonLoader width={size.width} height={size.height} />}
        {previewSrc ? (
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

            {/* PDF Viewer */}
            <iframe
              id={`pdf-iframe-${id}`}
              src={previewSrc}
              className="w-full h-full border-none"
              style={{
                pointerEvents: showOverlay ? "none" : "auto", // Allow interaction after dragging
              }}
              onMouseEnter={() => setShowOverlay(false)} // Remove overlay when interacting with iframe
            />
          </div>
        ) : pdfSrc ? (
          <div className="relative w-full h-full">
            {/* Overlay for enabling drag */}
            {(showOverlay || !isActive) && !loading && (
              <div
                className="w-full h-full flex items-center justify-center absolute inset-0 bg-gray-100 bg-opacity-15 z-10"
                onMouseDown={() => setShowOverlay(true)}
              >
                <div className="absolute w-16 h-16 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <MoveIcon size={48} className="text-white" />
                </div>
              </div>
            )}

            {/* PDF Viewer */}
            <iframe
              id={`pdf-iframe-${id}`}
              src={pdfSrc}
              className="w-full h-full border-none"
              style={{
                pointerEvents: showOverlay ? "none" : "auto", // Allow interaction after dragging
                display: loading ? "none" : "block",
              }}
              onMouseEnter={() => setShowOverlay(false)} // Remove overlay when interacting with iframe
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
        ) : (
          <label className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-200">
            Click to Upload a PDF
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}
      </ActiveOutlineContainer>
    </Rnd>
  );
}
