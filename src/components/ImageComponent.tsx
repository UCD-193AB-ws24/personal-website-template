"use client"

import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

import type { ComponentItem, Position, Size } from '@customTypes/componentTypes';
import { handleDragStop, handleResizeStop } from '@utils/dragResizeUtils';

interface ImageComponentProps {
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
  isPreview = false
}: ImageComponentProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [imageSrc, setImageSrc] = useState(content || "");

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        const img = new Image();
        img.src = imageUrl;

        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const newWidth = 300 // Default width
          const newHeight = newWidth / aspectRatio; // Maintain aspect ratio

          setImageSrc(imageUrl);
          setSize({ width: newWidth, height: newHeight});
          updateComponent(id, position, { width: newWidth, height: newHeight }, imageUrl);
        };
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
      {imageSrc ? (
        <img src={imageSrc} alt="Uploaded" className="w-full h-full object-cover" />
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
        handleDragStop(id, size, components, updateComponent, setPosition)(e, d);
      }}
      onResizeStart={() => setIsDragging(true)}
      onResizeStop={(e, d, ref, delta, newPosition) => {
        setIsDragging(false);
        handleResizeStop(id, components, updateComponent, setSize, setPosition)(e, d, ref, delta, newPosition);
      }}
      lockAspectRatio={true}
      minWidth={100}
      minHeight={100}
      bounds="parent"
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className={`w-full h-full border-2 transition-all duration-150 ease-in-out ${
          isActive ? 'border-blue-500 bg-gray-100 shadow-md' : 'border-transparent hover:border-gray-300'
        }`}
      >
        {imageSrc ? (
          <img src={imageSrc} alt="Uploaded" className="w-full h-full object-cover" />
        ) : (
          <label
            className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-200"
          >
            Click to Upload an Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    </Rnd>
  );
}
