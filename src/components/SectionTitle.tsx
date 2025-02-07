import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

import type { ComponentItem } from '@customTypes/componentTypes';

import { findBestFreeSpot } from '@utils/collisionUtils';

interface SectionTitleProps {
  id?: string;
  initialX?: number;
  initialY?: number;
  initialSize?: { width: number; height: number };
  components?: ComponentItem[];
  updateComponent?: (id: string, newPos: { x: number; y: number }, newSize: { width: number; height: number }) => void;
}

export default function SectionTitleTextbox({
  id = "",
  initialX = -1,
  initialY = -1,
  initialSize = { width: 350, height: 25 },
  components = [],
  updateComponent = () => { },
}: SectionTitleProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState(initialSize);
  const [text, setText] = useState("Type section title here...");

  const handleDragStop = (e: any, d: any) => {
    const newPos = findBestFreeSpot({ x: d.x, y: d.y }, size, components, id);
    setPosition(newPos);
    updateComponent(id, newPos, size);
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, newPos: any) => {
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
      enableResizing={{ top: false, right: true, bottom: false, left: true, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
      minWidth={100}
      minHeight={50}
      bounds="parent"
      className="border-2 border-blue-500 bg-gray-100 shadow-md p-2 flex items-center justify-center"
    >
      <h1
        contentEditable
        suppressContentEditableWarning
        className="w-full h-full text-black text-2xl font-bold outline-none cursor-text"
        onBlur={(e) => setText(e.currentTarget.innerText)}
      >
        {text}
      </h1>
    </Rnd>
  );
}
