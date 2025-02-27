import React, { useState } from "react";
import { Rnd } from "react-rnd";

import type { ComponentItem, Position, Size } from "@customTypes/componentTypes";
import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";

interface FileComponentProps {
  id?: string;
  initialPos?: Position;
  initialSize?: Size;
  components?: ComponentItem[];
  content?: string;
  updateComponent?: (id: string, newPos: Position, newSize: Size, content?: string) => void;
  isActive?: boolean;
  onMouseDown?: () => void;
  setIsDragging?: (dragging: boolean) => void;
  isPreview?: boolean;
}

export default function FileComponent({
  id = "",
  initialPos = { x: 50, y: 50 },
  initialSize = { width: 400, height: 500 },
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
  const [isDragging, setDragging] = useState(false);

  const handleMouseDown = (e: MouseEvent | React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const pdfUrl = reader.result as string;
        setPdfSrc(pdfUrl);
        updateComponent(id, position, size, pdfUrl);
      };
      reader.readAsDataURL(file);
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
      {pdfSrc ? (
        <iframe src={pdfSrc} className="w-full h-full border-none" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">No PDF</div>
      )}
    </div>
  ) : (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStart={(e) => {
        setIsDragging(true);
        setDragging(true);
      }}
      onDragStop={(e, d) => {
        setIsDragging(false);
        setDragging(false);
        handleDragStop(id, size, components, updateComponent, setPosition)(e, d);
      }}
      onResizeStart={(e) => {
        setIsDragging(true);
        setDragging(true);
      }}
      onResizeStop={(e, d, ref, delta, newPosition) => {
        setIsDragging(false);
        setDragging(false);
        handleResizeStop(id, components, updateComponent, setSize, setPosition)(e, d, ref, delta, newPosition);
      }}
      bounds="parent"
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: "auto" }}
    >
      <div
        className={`w-full h-full border-2 transition-all duration-150 ease-in-out ${isActive ? "border-blue-500 bg-gray-100 shadow-md" : "border-transparent hover:border-gray-300"}`}
      >

        {isDragging && pdfSrc && (
          <div
            className="absolute inset-0 z-10"
            style={{ background: "transparent" }}
          />
        )}

        {pdfSrc ? (
          <div className="relative w-full h-full">
          <iframe id={`pdf-iframe-${id}`} src={pdfSrc} className="w-full h-full border-none" style={{ pointerEvents: "auto" }} />
          <div

            className="absolute inset-0"
            onMouseDown={handleMouseDown}
            style={{ background: "transparent" }}
          />
        </div>
        ) : (
          <label className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-200">
            Click to Upload a PDF
            <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
          </label>
        )}
      </div>
    </Rnd>
  );
}
