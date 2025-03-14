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
  initialPos = { x: 50, y: 50 },
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

  const Icon = (LucideIcons as any)[icon] || LucideIcons.Star;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStart={() => setIsDragging(true)}
      onDragStop={(e, d) => {
        setIsDragging(false);
        setPosition({ x: d.x, y: d.y });
        updateComponent(id, { x: d.x, y: d.y }, size, icon);
      }}
      onResizeStart={() => setIsDragging(true)}
      onResizeStop={(e, d, ref, delta, newPosition) => {
        setIsDragging(false);
        const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
        setSize(newSize);
        setPosition(newPosition);
        updateComponent(id, newPosition, newSize, icon);
      }}
      enableResizing={{
        left: true,
        right: true,
        top: true,
        bottom: true,
      }}
      lockAspectRatio={true}
      minWidth={20}
      minHeight={20}
      bounds="parent"
      onMouseDown={handleMouseDown}
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
    >
      <ActiveOutlineContainer isActive={isActive}>
        <Icon className="w-full h-full text-black" />
      </ActiveOutlineContainer>
    </Rnd>
  );
}
