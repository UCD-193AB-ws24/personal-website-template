import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

import type { ComponentItem } from '@customTypes/componentTypes';

import { handleDragStop, handleResizeStop } from '@utils/dragResizeUtils';

interface SectionTitleProps {
  id?: string;
  initialX?: number;
  initialY?: number;
  initialSize?: { width: number; height: number };
  components?: ComponentItem[];
  updateComponent?: (id: string, newPos: { x: number; y: number }, newSize: { width: number; height: number }) => void;
  isActive?: boolean;
  onMouseDown?: () => void;
  setIsDragging?: (dragging: boolean) => void;
}

export default function SectionTitleTextbox({
  id = "",
  initialX = -1,
  initialY = -1,
  initialSize = { width: 350, height: 25 },
  components = [],
  updateComponent = () => { },
  isActive = true,
  onMouseDown: onMouseDown = () => { },
  setIsDragging = () => { }
}: SectionTitleProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState(initialSize);
  const [text, setText] = useState("Type section title here...");

  const handleMouseDown = (e: MouseEvent) => {
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
        handleDragStop(id, size, components, updateComponent, setPosition)(e, d);
      }}
      onResizeStart={() => setIsDragging(true)}
      onResizeStop={(e, d, ref, delta, newPosition) => {
        setIsDragging(false);
        handleResizeStop(id, components, updateComponent, setSize, setPosition)(e, d, ref, delta, newPosition);
      }}
      enableResizing={{ top: false, right: true, bottom: false, left: true, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
      minWidth={100}
      minHeight={50}
      bounds="parent"
      onMouseDown={(e: MouseEvent) => {
        handleMouseDown(e);
      }}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className={`p-2 w-full h-full flex items-center justify-center transition-all duration-150 ease-in-out border-2 ${isActive
            ? 'border-blue-500 bg-gray-100 shadow-md outline-none'
            : 'border-transparent bg-transparent outline-none hover:outline-2 hover:outline-gray-300'
          }`}
      >
        <h1
          contentEditable
          suppressContentEditableWarning
          className="overflow-hidden w-full h-full text-black text-2xl font-bold outline-none cursor-text"
          onBlur={(e) => setText(e.currentTarget.innerText)}
        >
          {text}
        </h1>
      </div>
    </Rnd>
  );
}
