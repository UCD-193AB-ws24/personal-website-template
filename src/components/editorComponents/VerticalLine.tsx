"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE } from "@utils/constants";

interface VerticalLineProps {
  id?: string;
  initialPos?: Position;
  initialSize?: Size;
  components?: ComponentItem[];
  updateComponent?: (id: string, newPos: Position, newSize: Size) => void;
  isActive?: boolean;
  onMouseDown?: () => void;
  setIsDragging?: (dragging: boolean) => void;
  isPreview?: boolean;
}

export default function VerticalLine({
  id = "",
  initialPos = { x: 90, y: -120 },
  initialSize = { width: 2, height: 350 },
  components = [],
  updateComponent = () => {},
  isActive = true,
  onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
}: VerticalLineProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);

  const handleMouseDown = (e: MouseEvent | React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  return isPreview ? (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        backgroundColor: "black",
      }}
    />
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
      enableResizing={{
        top: true,
        bottom: true,
        left: false,
        right: false,
      }}
      minHeight={50}
      maxWidth={2}
      bounds="parent"
      onMouseDown={(e: MouseEvent) => {
        handleMouseDown(e);
      }}
      style={{ pointerEvents: "auto" }}
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
    >
      <ActiveOutlineContainer isActive={isActive}>
        <div className="w-full h-full bg-black" />
      </ActiveOutlineContainer>
    </Rnd>
  );
}
