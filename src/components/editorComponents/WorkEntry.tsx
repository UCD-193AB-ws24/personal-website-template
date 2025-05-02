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

interface WorkEntryProps {
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
  isDragOverlay?: boolean;
}

export default function WorkEntry({
  id = "",
  initialPos = { x: -1, y: -1 },
  initialSize = { width: 620, height: 120 },
  components = [],
  content = '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"font-size: 24px;","text":"Company","type":"text","version":1},{"detail":0,"format":1,"mode":"normal","style":"","text":"                                                                  ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"Jan 20XX - Dec 20XX","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":1,"textStyle":"font-size: 24px;"},{"children":[{"detail":0,"format":2,"mode":"normal","style":"","text":"Job Title","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":2,"textStyle":""},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Work Detail 1","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Work Detail 2","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":2}],"direction":"ltr","format":"","indent":0,"type":"list","version":1,"listType":"bullet","start":1,"tag":"ul"}],"direction":"ltr","format":"","indent":0,"type":"root","version":1,"textStyle":"font-size: 24px;"}}',
  updateComponent = () => { },
  isActive = true,
  onMouseDown: onMouseDown = () => { },
  setIsDragging = () => { },
  isPreview = false,
  isDragOverlay = false,
}: WorkEntryProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [data, setData] = useState(content);
  const [showOverlay, setShowOverlay] = useState(false);

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

  const handleMouseDown = (e: MouseEvent) => {
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
      }}
    >
      <LexicalComposer initialConfig={RichTextInitialConfig}>
        <div
          className={"w-full h-full rounded"}
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
      {isActive && !isDragOverlay && (
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
        minHeight={60}
        minWidth={300}
        bounds="parent"
        onMouseDown={handleMouseDown}
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
              className="w-full h-full cursor-default"
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
