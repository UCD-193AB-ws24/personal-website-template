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
import RichTextbox from "@components/RichText/RichTextbox";
import RichTextToolbarPlugin from "@components/RichText/Plugins/RichTextToolbar";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import {
  RichTextInitialConfig,
} from "@components/RichText/RichTextSettings";

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
  initialSize = { width: 350, height: 40 },
  components = [],
  content = '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Type section title here...","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h1"}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
  updateComponent = () => { },
  isActive = true,
  onMouseDown: onMouseDown = () => { },
  setIsDragging = () => { },
  isPreview = false,
}: SectionTitleProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [data, setData] = useState(content);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleMouseDown = (e: MouseEvent | React.MouseEvent) => {
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
    >
      <LexicalComposer initialConfig={RichTextInitialConfig}>
        <div
          className={"w-full h-full  rounded"}
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
        bounds="parent"
        onMouseDown={(e: MouseEvent) => {
          handleMouseDown(e);
        }}
        style={{ pointerEvents: "auto" }}
        dragGrid={[GRID_SIZE, GRID_SIZE]}
        resizeGrid={[GRID_SIZE, GRID_SIZE]}
      >
        <ActiveOutlineContainer isActive={isActive}>
          <div
            className="w-full h-full"
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
              className="cursor-default h-full"
            >
              <RichTextbox
                isPreview={isPreview}
                textboxState={data.textboxState || data}
                updateTextboxState={updateTextboxState}
                isActive={isActive}
              />
            </div>
          </div>
        </ActiveOutlineContainer>
      </Rnd>
    </LexicalComposer>
  );
}
