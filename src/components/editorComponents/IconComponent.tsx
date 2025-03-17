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
    content: string,
  ) => void;
  isActive?: boolean;
  onMouseDown?: () => void;
  setIsDragging?: (dragging: boolean) => void;
  isPreview?: boolean;
  content?: string;
}

export default function IconComponent({
  id = "",
  initialPos = { x: 75, y: 0 },
  initialSize = { width: 50, height: 50 },
  components = [],
  updateComponent = () => { },
  isActive = true,
  onMouseDown = () => { },
  setIsDragging = () => { },
  isPreview = false,
  content = "Star",
}: IconComponentProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [icon, setIcon] = useState(content);
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
    updateComponent(id, position, size, newIcon);
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

  const dropdownWidth = 200;
  const parentPadding = 10;
  const parentWidth =
    document.getElementById("editor-drop-zone")?.clientWidth || 500;

  const isButtonOnLeft =
    position.x + size.width + dropdownWidth + parentPadding > parentWidth;

  return (
    <>
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
        style={{ pointerEvents: "auto" }}
      >
        <ActiveOutlineContainer isActive={isActive}>
          <Icon className={`w-full h-full text-black`} />
        </ActiveOutlineContainer>
      </Rnd>
      {!drag && isActive && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown((prev) => !prev);
          }}
          style={{
            position: "absolute",
            top: `${position.y + 10}px`,
            left: isButtonOnLeft ? `${position.x - 25}px` : `${position.x + size.width}px`,
            zIndex: 10,
            pointerEvents: "auto",
            transition: "opacity 0.2s ease-in-out, transform 0.1s",
          }}
          className="w-6 h-6 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 hover:scale-110 flex items-center justify-center z-50"
        >
          <LucideIcons.Pencil className="w-4 h-4 text-white" />
        </div>
      )}

      {!drag && isActive && showDropdown && (
        <>
          <div
            style={{
              position: "absolute",
              top: `${position.y + 40}px`,
              left: isButtonOnLeft ? `${position.x - dropdownWidth - parentPadding}px` : `${position.x + size.width + parentPadding}px`,
              zIndex: 1000,
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "5px",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              width: `${dropdownWidth}px`,
              gap: "5px",
              pointerEvents: "auto",
            }}
          >
            {[
              "Star",
              "Camera",
              "Check",
              "Home",
              "Search",
              "User",
              "X",
              "Mail",
              "Briefcase",
              "Code",
              "File",
              "Globe",
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
        </>
      )}
    </>
  );
}
