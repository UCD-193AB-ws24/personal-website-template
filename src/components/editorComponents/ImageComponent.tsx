/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSearchParams } from "next/navigation";
import { isHeic, heicTo } from "heic-to/csp";

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
// import { auth, storage } from "@lib/firebase/firebaseApp";
import { getFirebaseAuth, getFirebaseStorage } from "@lib/firebase/firebaseApp";
const auth = getFirebaseAuth();
const storage = getFirebaseStorage();

import { Link as LinkIcon, Search } from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";
import isValidURL from "@components/RichText/utils/isValidURL";

interface ImageComponentProps {
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
  const normalizedContent =
    typeof content === "string" ? { image: content } : content;
  const [imageSrc, setImageSrc] = useState(normalizedContent.image || "");
  const [link, setLink] = useState(normalizedContent.link || "");
  const [loading, setLoading] = useState(!!normalizedContent.image);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isLinkEditing, setIsLinkEditing] = useState(false);
  const [linkInputField, setLinkInputField] = useState("");
  const [isEditingExistingLink, setIsEditingExistingLink] = useState(false);
  const [prevLink, setPrevLink] = useState<string>("");
  const [drag, setDrag] = useState(false);
  const [isHeicConverting, setIsHeicConverting] = useState(false);
  const positionRef = useRef(position);
  const sizeRef = useRef(size);

  const draftNumber = useSearchParams().get("draftNumber");

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    if (!imageSrc || !loading) return;

    const img = new Image();
    img.src = imageSrc;

    if (img.complete) {
      // Chrome fix for cached images
      setLoading(false);
    } else {
      img.onload = () => setLoading(false);
      img.onerror = () => setLoading(false);
    }
  }, [imageSrc, loading]);

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
      let file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        toastError(
          "Image size exceeds the 5MB limit. Please upload a smaller image.",
        );
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
          updateComponent(id, positionRef.current, sizeRef.current, {
            image: downloadURL,
            link,
          });
        },
      );
    }
  };

  const dropdownWidth = !isPreview ? 323 : 0;
  const parentWidth = !isPreview
    ? document.getElementById("editor-drop-zone")?.clientWidth || 500
    : undefined;
  const isButtonOnLeft =
    !isPreview && dropdownWidth && parentWidth
      ? position.x + dropdownWidth > parentWidth
      : undefined;

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
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <img
              src={previewSrc}
              alt="Uploading Preview"
              className="w-full h-full object-cover"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              style={{ display: loading ? "none" : "block" }}
            />
          </a>
        ) : (
          <img
            src={previewSrc}
            alt="Uploading Preview"
            className="w-full h-full object-cover"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            style={{ display: loading ? "none" : "block" }}
          />
        )
      ) : imageSrc ? (
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <img
              src={imageSrc}
              alt="Uploaded"
              className="w-full h-full object-cover"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              style={{ display: loading ? "none" : "block" }}
            />
          </a>
        ) : (
          <img
            src={imageSrc}
            alt="Uploaded"
            className="w-full h-full object-cover"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            style={{ display: loading ? "none" : "block" }}
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          No Image
        </div>
      )}
    </div>
  ) : (
    <>
      <Rnd
        size={{ width: size.width, height: size.height }}
        position={{ x: position.x, y: position.y }}
        onDragStart={(e) => {
          setIsDragging(true);
          setDrag(true);
          setIsLinkEditing(false);
          e.preventDefault();
        }}
        onDragStop={(e, d) => {
          setIsDragging(false);
          setDrag(false);
          handleDragStop(
            id,
            size,
            components,
            updateComponent,
            setPosition,
          )(e, d);
        }}
        onResizeStart={() => {
          setIsDragging(true);
          setDrag(true);
          setIsLinkEditing(false);
        }}
        onResizeStop={(e, d, ref, delta, newPosition) => {
          setIsDragging(false);
          setDrag(false);
          handleResizeStop(
            id,
            components,
            updateComponent,
            setSize,
            setPosition,
          )(e, d, ref, delta, newPosition);
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
          {loading && (
            <SkeletonLoader width={size.width} height={size.height} />
          )}

          {previewSrc ? (
            <div className="relative w-full h-full">
              <img
                src={previewSrc}
                alt="Uploading Preview"
                className="w-full h-full object-cover"
              />
              {!isActive && link && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(link, "_blank", "noopener,noreferrer");
                  }}
                  className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md hover:scale-105 transition-transform"
                >
                  <LinkIcon className="w-5 h-5 text-gray-700 opacity-80" />
                </button>
              )}
            </div>
          ) : imageSrc ? (
            <div className="relative w-full h-full">
              <img
                src={imageSrc}
                alt="Uploaded"
                className="w-full h-full object-cover"
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                style={{ display: loading ? "none" : "block" }}
              />
              {!isActive && link && (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(link, "_blank", "noopener,noreferrer");
                  }}
                  className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md hover:scale-105 transition-transform"
                >
                  <LinkIcon className="w-5 h-5 text-gray-700 opacity-80" />
                </button>
              )}
            </div>
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
        </ActiveOutlineContainer>
      </Rnd>
      {!drag && isActive && (
        <div
          className="flex items-center gap-[4px]"
          style={{
            position: "absolute",
            top: `${position.y + size.height + 10}px`,
            left: `${isLinkEditing && isButtonOnLeft ? position.x - dropdownWidth + size.width : position.x}px`,
            zIndex: 10,
            pointerEvents: "auto",
            transition: "opacity 0.2s ease-in-out, transform 0.1s",
          }}
        >
          {isLinkEditing ? (
            <div className="absolute top-0 left-0 z-10">
              <div className="flex items-center p-2 gap-[4px] bg-white shadow-[0px_0px_37px_-14px_rgba(0,_0,_0,_1)] rounded-md border">
                <div
                  className="flex justify-center items-center bg-white gap-[4px] p-1 border rounded-md focus-within:border-blue-500"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Search size={16} />
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
                    const validURL = isValidURL(linkInputField);
                    if (validURL) {
                      setLink(validURL);
                      setIsLinkEditing(false);
                      setIsEditingExistingLink(false);
                      setPrevLink("");
                      updateComponent(id, position, size, {
                        image: imageSrc,
                        link: validURL,
                      });
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
                  updateComponent(id, position, size, {
                    image: imageSrc,
                    link: "",
                  });
                }}
              >
                <Trash2 className="w-4 h-4" />
                Remove Link
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
