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
import RichTextToolbarPlugin from '@components/RichText/Plugins/RichTextToolbar';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import { RichTextInitialConfig, BlankRichTextEditorState } from "@components/RichText/RichTextSettings";


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
  content = BlankRichTextEditorState,
  updateComponent = () => {},
  isActive = true,
  onMouseDown: onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
}: DraggableResizableTextboxProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [textboxState, setTextboxState] = useState(content);

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };


  const updateTextboxState = (newState: string) => {
    setTextboxState(newState);
    updateComponent(id, position, size, newState);
  }

  return isPreview ? (<div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      className="whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg leading-none"
    >
      <LexicalComposer initialConfig={RichTextInitialConfig}>
        <RichTextbox isPreview={isPreview} textboxState={textboxState} updateTextboxState={updateTextboxState} />
      </LexicalComposer>
    </div>) : (
    <LexicalComposer initialConfig={RichTextInitialConfig}>
      { isActive && <RichTextToolbarPlugin /> }
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
        minWidth={100}
        minHeight={50}
        bounds="parent"
        onMouseDown={handleMouseDown}
        style={{ pointerEvents: "auto" }}
        dragGrid={[GRID_SIZE, GRID_SIZE]}
        resizeGrid={[GRID_SIZE, GRID_SIZE]}
      >
        <ActiveOutlineContainer isActive={isActive}>
          <RichTextbox isPreview={isPreview} textboxState={textboxState} updateTextboxState={updateTextboxState} isActive={isActive} />
        </ActiveOutlineContainer>
      </Rnd>
    </LexicalComposer>
  )
}
