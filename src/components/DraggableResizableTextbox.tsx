import React, { useState } from 'react';
import { Rnd, DraggableData, ResizableDelta, Position } from 'react-rnd';
import { ResizeDirection } from "re-resizable";


import type { ComponentItem } from '@customTypes/componentTypes';

import { findBestFreeSpot } from '@utils/collisionUtils';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragStop = (e: any, d: DraggableData) => {
    const newPos = findBestFreeSpot({ x: d.x, y: d.y }, size, components, id);
    setPosition(newPos);
    updateComponent(id, newPos, size);
  };

  const handleResizeStop = (
    e: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    ref: HTMLElement,
    delta: ResizableDelta,
    newPos: Position
  ) => {
    const newSize = {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    };

    const finalPos = findBestFreeSpot(newPos, size, components, id);
    setSize(newSize);
    setPosition(finalPos);
    updateComponent(id, finalPos, newSize);
  };

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
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
