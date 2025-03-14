"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";
import * as LucideIcons from "lucide-react";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE } from "@utils/constants";

interface IconComponentProps {
  id?: string;
  initialPos?: Position;
  initialSize?: Size;
  components?: ComponentItem[];
  updateComponent?: (
    id: string,
    newPos: Position,
    newSize: Size,
    selectedIcon: string,
  ) => void;
  isActive?: boolean;
  onMouseDown?: () => void;
  setIsDragging?: (dragging: boolean) => void;
  isPreview?: boolean;
  selectedIcon?: string;
}

export default function IconComponent({
  id = "",
  initialPos = { x: 0, y: 0 },
  initialSize = { width: 50, height: 50 },
  components = [],
  updateComponent = () => {},
  isActive = true,
  onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
  selectedIcon = "Star",
}: IconComponentProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [icon, setIcon] = useState(selectedIcon);
  const [showDropdown, setShowDropdown] = useState(false);
  const [drag, setDrag] = useState(false);

  const Icon = (LucideIcons as any)[icon] || LucideIcons.Star;

  const handleMouseDown = (e: React.MouseEvent | MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const handleIconChange = (newIcon: string) => {
    setIcon(newIcon);
    setShowDropdown(false);
  };

  if (isPreview) {
    return (
      <div
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
        }}
      >
        <Icon className="w-full h-full text-black" />
      </div>
    );
  }

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStart={() => {
        setIsDragging(true);
        setDrag(true);
      }}
      onDragStop={(e, d) => {
        setIsDragging(false);
        setDrag(false);
        setShowDropdown(false);
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
      }}
      onResizeStop={(e, d, ref, delta, newPosition) => {
        setIsDragging(false);
        setDrag(false);
        setShowDropdown(false);
        handleResizeStop(id, components, updateComponent, setSize, setPosition)(
          e,
          d,
          ref,
          delta,
          newPosition,
        );
      }}
      lockAspectRatio={true}
      minWidth={20}
      minHeight={20}
      bounds="parent"
      onMouseDown={handleMouseDown}
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
      dragHandleClassName={`icon-${id}`}
    >
      <ActiveOutlineContainer isActive={isActive}>
        <Icon className={`w-full h-full text-black icon-${id}`} />
      </ActiveOutlineContainer>
      {!drag && isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown((prev) => !prev);
          }}
          style={{
            position: "relative",
            top: `${-size.height}px`,
            left: `${size.width}px`,
            zIndex: 10,
            pointerEvents: "auto",
            transition: "opacity 0.2s ease-in-out, transform 0.1s",
          }}
          className="w-6 h-6 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 hover:scale-110 flex items-center justify-center z-50"
        >
          <LucideIcons.Pencil className="w-4 h-4 text-white" />
        </button>
      )}

      {!drag && isActive && showDropdown && (
        <div
          style={{
            position: "relative",
            top: `${-size.height + 20}px`,
            left: `${size.width + 10}px`,
            zIndex: 20,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "5px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            width: "200px",
            gap: "5px",
          }}
        >
          {[
            "Star",
            "Heart",
            "Camera",
            "Check",
            "Home",
            "Search",
            "User",
            "X",
          ].map((iconName) => {
            const IconItem = (LucideIcons as any)[iconName];
            return (
              <button
                key={iconName}
                onClick={() => handleIconChange(iconName)}
                className="p-2 border rounded flex items-center justify-center hover:bg-gray-200"
              >
                <IconItem className="w-6 h-6 text-black" />
              </button>
            );
          })}
        </div>
      )}
    </Rnd>
  );
}
