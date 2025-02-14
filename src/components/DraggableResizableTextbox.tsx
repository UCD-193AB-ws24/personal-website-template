import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

import type { ComponentItem, Position, Size } from '@customTypes/componentTypes';

import { handleDragStop, handleResizeStop } from '@utils/dragResizeUtils';

interface DraggableResizableTextboxProps {
  id?: string;
  initialPos?: Position;
  initialSize?: Size
  components?: ComponentItem[];
  content?: any;
  updateComponent?: (id: string, newPos: { x: number; y: number }, newSize: { width: number; height: number }) => void;
  isActive?: boolean;
  onMouseDown?: () => void;
  setIsDragging?: (dragging: boolean) => void;
}

export default function DraggableResizableTextbox({
  id = "",
  initialPos = { x: -1, y: -1 },
  initialSize = { width: 200, height: 50 },
  components = [],
  content = "",
  updateComponent = () => { },
  isActive = true,
  onMouseDown: onMouseDown = () => { },
  setIsDragging = () => { }
}: DraggableResizableTextboxProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);

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
      minWidth={100}
      minHeight={50}
      bounds="parent"
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className={`p-2 w-full h-full transition-all duration-150 ease-in-out border-2 ${isActive
          ? 'border-blue-500 bg-gray-100 shadow-md outline-none'
          : 'border-transparent bg-transparent outline-none hover:outline-2 hover:outline-gray-300'
          }`}
      >
        <textarea
          className={`overflow-hidden w-full h-full resize-none border-none outline-none bg-transparent p-2 text-lg`}
          placeholder="Type here..."
          defaultValue={content}
        />
      </div>
    </Rnd>
  );
}
