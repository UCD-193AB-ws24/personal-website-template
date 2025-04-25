"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE } from "@utils/constants";
import RichTextbox from "@components/RichText/RichTextbox";
import RichTextToolbarPlugin from "@components/RichText/Plugins/RichTextToolbar";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import {
  RichTextInitialConfig,
  RichTextDefaultContent,
} from "@components/RichText/RichTextSettings";

interface DraggableResizableTextboxProps {
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

export default function DraggableResizableTextbox({
  id = "",
  initialPos = { x: -1, y: -1 },
  initialSize = { width: 200, height: 50 },
  components = [],
  content = RichTextDefaultContent,
  updateComponent = () => {},
  isActive = true,
  onMouseDown: onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
}: DraggableResizableTextboxProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [showOverlay, setShowOverlay] = useState(false);
  const [data, setData] = useState(content);
  // const [textboxState, setTextboxState] = useState(content);

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const updateTextboxState = (newState: string) => {
    // For backwards compatibility with older textboxes
    let newData: any = newState;
    if (!data.hasOwnProperty("textboxState")) {
      newData = { backgroundColor: "transparent", textboxState: newState };
    } else {
      newData = { ...data, textboxState: newState };
    }
    setData(newData);
    // setTextboxState(newState);
    updateComponent(id, position, size, newData);
  };

  const updateBackgroundColor = (newBgColor: string) => {
    // For backwards compatibility with older textboxes
    let newData: any = newBgColor;
    if (!data.hasOwnProperty("backgroundColor")) {
      newData = { textboxState: data, backgroundColor: newBgColor };
    } else {
      newData = { ...data, backgroundColor: newBgColor };
    }
    setData(newData);
    updateComponent(id, position, size, newData);
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
      className="whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg leading-none rounded"
    >
      <LexicalComposer initialConfig={RichTextInitialConfig}>
        <div
          className={`w-full h-full transition-all duration-150 ease-in-out rounded ${
            isActive
              ? "outline outline-2 outline-blue-500 shadow-md"
              : "outline outline-2 outline-transparent hover:outline hover:outline-2 hover:outline-gray-300"
          }`}
          style={{ backgroundColor: data.backgroundColor || "transparent" }}
        >
          <RichTextbox
            isPreview={isPreview}
            textboxState={data.textboxState || data}
            updateTextboxState={updateTextboxState}
            isActive={false}
          />
        </div>
      </LexicalComposer>
    </div>
  ) : (
    <LexicalComposer initialConfig={RichTextInitialConfig}>
      {isActive && (
        <RichTextToolbarPlugin updateBackgroundColor={updateBackgroundColor} />
      )}
      <Rnd
        size={{ width: size.width, height: size.height }}
        position={{ x: position.x, y: position.y }}
        onDragStart={() => {
          setIsDragging(true);
          setShowOverlay(false);
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
          handleResizeStop(
            id,
            components,
            updateComponent,
            setSize,
            setPosition,
          )(e, d, ref, delta, newPosition);
        }}
        minWidth={100}
        minHeight={50}
        bounds="parent"
        onMouseDown={handleMouseDown}
        style={{ pointerEvents: "auto" }}
        dragGrid={[GRID_SIZE, GRID_SIZE]}
        resizeGrid={[GRID_SIZE, GRID_SIZE]}
      >
        <div
          className={`w-full h-full transition-all duration-150 ease-in-out rounded ${
            isActive
              ? "outline outline-2 outline-blue-500 shadow-md"
              : "outline outline-2 outline-transparent hover:outline hover:outline-2 hover:outline-gray-300"
          }`}
          style={{ backgroundColor: data.backgroundColor || "transparent" }}
        >
          {/* Overlay for enabling drag */}
          {(showOverlay || !isActive) && (
            <div
              className="w-full h-full flex items-center justify-center absolute inset-0 z-10"
              onMouseDown={() => setShowOverlay(true)}
            >
            </div>
          )}

          <div
            onMouseEnter={() => setShowOverlay(false)} // remove overlay when interacting with iframe
            onMouseDown={(e) => e.stopPropagation()} // capture mouse movements
            className="cursor-default"
          >
            <RichTextbox
            isPreview={isPreview}
            textboxState={data.textboxState || data}
            updateTextboxState={updateTextboxState}
            isActive={isActive}
          />
          </div>
        </div>
      </Rnd>
    </LexicalComposer>
  );
}
