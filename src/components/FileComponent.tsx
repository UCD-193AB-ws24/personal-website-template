"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { MoveIcon } from "lucide-react";
import { toast, Flip } from "react-toastify";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSearchParams } from "next/navigation";

import ErrorToast from "@components/ErrorToast";
import SkeletonLoader from "@components/SkeletonLoader";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";
import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
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
  const [isOverlayActive, setIsOverlayActive] = useState(true);
  const [loading, setLoading] = useState(!!content);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const draftNumber = useSearchParams().get("draftNumber");

  // https://stackoverflow.com/questions/58488416/open-base64-encoded-pdf-file-using-javascript-issue-with-file-size-larger-than
  const MAX_FILE_SIZE = 5 * 1024 * 1025; // max 5MB upload for now

  const handleMouseDown = (e: MouseEvent | React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
    setIsOverlayActive(false); // Hide overlay when clicked
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userId = auth.currentUser?.uid;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        toast(
          (props) => (
            <ErrorToast
              {...props}
              message="File size exceeds the 5MB limit. Please upload a smaller file."
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
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: "auto" }}
      dragHandleClassName={`${id}-drag-handle`}
    >
      <div
        className={`w-full h-full transition-all duration-150 ease-in-out ${
          isActive
            ? "outline outline-2 outline-blue-500 bg-gray-100 shadow-md"
            : "outline outline-2 outline-transparent  bg-transparent hover:outline hover:outline-2 hover:outline-gray-300"
        }`}
      >
        {loading && <SkeletonLoader width={size.width} height={size.height} />}
        {previewSrc ? (
          <div className="relative w-full h-full">
            {/* Transparent Overlay to Capture Clicks */}
            {isOverlayActive && (
              <div
                className="absolute inset-0 bg-transparent z-10 cursor-pointer"
                onMouseDown={handleMouseDown}
              />
            )}

            {/* PDF Viewer */}
            <iframe
              id={`pdf-iframe-${id}`}
              src={previewSrc}
              className="w-full h-full border-none"
              style={{ pointerEvents: "auto" }}
              onMouseLeave={() => setIsOverlayActive(true)} // Re-enable overlay when leaving iframe
            />
          </div>
        ) : pdfSrc ? (
          <div className="relative w-full h-full">
            {/* Transparent Overlay to Capture Clicks */}
            {isOverlayActive && (
              <div
                className="absolute inset-0 bg-transparent z-10 cursor-pointer"
                onMouseDown={handleMouseDown}
              />
            )}

            {/* PDF Viewer */}
            <iframe
              id={`pdf-iframe-${id}`}
              src={pdfSrc}
              className="w-full h-full border-none"
              onMouseLeave={() => setIsOverlayActive(true)} // Re-enable overlay when leaving iframe
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              style={{
                pointerEvents: "auto",
                display: loading ? "none" : "block",
              }}
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
