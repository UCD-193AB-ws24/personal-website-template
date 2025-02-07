import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

import type { ComponentItem } from '@customTypes/componentTypes';

import { handleDragStop, handleResizeStop } from '@utils/dragResizeUtils';

interface DraggableResizableTextboxProps {
  id?: string;
  initialX?: number;
  initialY?: number;
  initialSize?: { width: number; height: number };
  components?: ComponentItem[];
  updateComponent?: (id: string, newPos: { x: number; y: number }, newSize: { width: number; height: number }) => void;
}

export default function DraggableResizableTextbox({
  id = "",
  initialX = -1,
  initialY = -1,
  initialSize = { width: 200, height: 50 },
  components = [],
  updateComponent = () => { },
}: DraggableResizableTextboxProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState(initialSize);

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={handleDragStop(id, size, components, updateComponent, setPosition)}
      onResizeStop={handleResizeStop(id, components, updateComponent, setSize, setPosition)}
      minWidth={100}
      minHeight={50}
      bounds="parent"
      className="border-2 border-blue-500 bg-gray-100 shadow-md p-2"
    >
      <textarea
        className="overflow-hidden w-full h-full resize-none border-none outline-none bg-transparent p-2 text-lg"
        placeholder="Type here..."
      />
    </Rnd>
  );
}
