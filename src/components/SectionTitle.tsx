"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";

interface SectionTitleProps {
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

export default function SectionTitleTextbox({
  id = "",
  initialPos = { x: -1, y: -1 },
  initialSize = { width: 350, height: 50 },
  components = [],
  content = "Type section title here...",
  updateComponent = () => {},
  isActive = true,
  onMouseDown: onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
}: SectionTitleProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [text, setText] = useState(content);

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const handleBlur = (e: React.FocusEvent<HTMLHeadingElement, Element>) => {
    setText(e.currentTarget.innerText);
    updateComponent(id, position, size, e.currentTarget.innerText);
  };

  return isPreview ? (
    <h1
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      className="whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-2xl font-bold"
    >
      {content}
    </h1>
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
        top: false,
        right: true,
        bottom: false,
        left: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      minWidth={100}
      minHeight={50}
      bounds="parent"
      onMouseDown={(e: MouseEvent) => {
        handleMouseDown(e);
      }}
      style={{ pointerEvents: "auto" }}
    >
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-150 ease-in-out border-2 ${
          isActive
            ? "border-blue-500 bg-gray-100 shadow-md outline-none"
            : "border-transparent bg-transparent outline-none hover:outline-2 hover:outline-gray-300"
        }`}
      >
        <h1
          contentEditable
          suppressContentEditableWarning
          className="overflow-hidden w-full h-full text-black text-2xl font-bold outline-none cursor-text"
          onBlur={handleBlur}
        >
          {text}
        </h1>
      </div>
    </Rnd>
  );
}
