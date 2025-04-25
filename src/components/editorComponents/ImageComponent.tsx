/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSearchParams } from "next/navigation";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";
import { toastError } from "@components/toasts/ErrorToast";
import SkeletonLoader from "@components/editorComponents/SkeletonLoader";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";
import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE, MAX_FILE_SIZE } from "@utils/constants";
import { auth, storage } from "@lib/firebase/firebaseApp";
import { Link as LinkIcon, Search } from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";
import isValidURL from "@components/RichText/utils/isValidURL";

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
  updateComponent = () => {},
  isActive = false,
  onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
}: ImageComponentProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [imageSrc, setImageSrc] = useState(content || "");
  const [loading, setLoading] = useState(!!content);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isLinkEditing, setIsLinkEditing] = useState(false);
  const [linkInputField, setLinkInputField] = useState("");
  const [link, setLink] = useState<string>("");
  const [isEditingExistingLink, setIsEditingExistingLink] = useState(false);
  const [prevLink, setPrevLink] = useState<string>("");

  const draftNumber = useSearchParams().get("draftNumber");

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const resizeImage = (
    imageSrc: string,
    baseWidth: number = 300,
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
      if (file.size > MAX_FILE_SIZE) {
        toastError("Image size exceeds the 5MB limit. Please upload a smaller image.");
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
        <img
          src={previewSrc}
          alt="Uploading Preview"
          className="w-full h-full object-cover"
        />
      ) : imageSrc ? (
        <img
          src={imageSrc}
          alt="Uploaded"
          className="w-full h-full object-cover"
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
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
    >
      <ActiveOutlineContainer isActive={isActive}>
        {loading && <SkeletonLoader width={size.width} height={size.height} />}

        {previewSrc ? (
          <img
            src={previewSrc}
            alt="Uploading Preview"
            className="w-full h-full object-cover"
          />
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt="Uploaded"
            className="w-full h-full object-cover"
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
      </ActiveOutlineContainer>
      {isActive && (
        <div className="absolute -bottom-10 left-0 z-10 flex items-center gap-[4px]">
          {isLinkEditing ? (
            <div className="absolute -bottom-5 left-0 z-10">
              <div className = "flex items-center p-2 gap-[4px] bg-white shadow-[0px_0px_37px_-14px_rgba(0,_0,_0,_1)] rounded-md border">
                <div 
                  className="flex justify-center items-center bg-white gap-[4px] p-1 border rounded-md focus-within:border-blue-500"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Search size={16}/>
                  <input
                    className="text-sm focus:outline-none"
                    type="url"
                    placeholder="URL"
                    value={linkInputField}
                    onChange={(e) => setLinkInputField(e.target.value)}
                  />
                </div>
                <button
                  className="text-sm text-blue-500 font-bold ml-2"
                  onClick={() => {
                    if (linkInputField && isValidURL(linkInputField)) {
                      setLink(linkInputField);
                      setIsLinkEditing(false);
                      setIsEditingExistingLink(false);
                      setPrevLink("");
                    }
                  }}
                >
                  Apply
                </button>
                {isEditingExistingLink ? (
                    <button
                      className="text-sm text-gray-400 ml-1"
                      onClick={() => {
                        setLinkInputField(prevLink);
                        setIsLinkEditing(false);
                        setIsEditingExistingLink(false);
                      }}
                    >
                      Cancel
                    </button>
              ) : (
                <button
                  className="text-sm text-gray-400 ml-1"
                  onClickCapture={() => {
                    setLinkInputField("");
                     setIsLinkEditing(false);
                   }}
                >
                  Cancel
                </button>
              )}
              </div>
            </div>
          ) : !link ? (
            <button
              onClick={() => {
                setIsLinkEditing(true);
                setLinkInputField("");
                setPrevLink("");
              }}
              className="flex items-center gap-1 text-sm bg-white border border-gray-300 px-2 py-1 rounded shadow hover:bg-gray-100"
            >
              <LinkIcon className="w-4 h-4 text-gray-700" />
              <span className="text-gray-800">Add Link</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                setIsLinkEditing(true);
                setIsEditingExistingLink(true);
                setLinkInputField(link);
                setPrevLink(link);
              }}
              className="flex items-center gap-1 text-sm text-blue-600 bg-white px-2 py-1 rounded shadow hover:bg-gray-100 min-w-[120px] justify-center"
              >
                <Pencil className="w-4 h-4" />
                Edit Link
            </button>
            <button
              className="flex items-center gap-1 text-sm text-red-500 ml-2 px-2 py-1 bg-white rounded shadow hover:bg-gray-100 min-w-[120px] justify-center"
                onClick={() => {
                  setLink("");
                  setLinkInputField("");
                  setIsLinkEditing(false);
                  setIsEditingExistingLink(false);
                  setPrevLink("");
              }}
            >
              <Trash2 className="w-4 h-4" />
              Remove Link
            </button>
            </>
          )}
        </div>
      )}
    </Rnd>
  );
}
