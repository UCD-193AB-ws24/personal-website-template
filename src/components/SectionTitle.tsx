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

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={handleDragStop(id, size, components, updateComponent, setPosition)}
      onResizeStop={handleResizeStop(id, components, updateComponent, setSize, setPosition)}
      enableResizing={{ top: false, right: true, bottom: false, left: true, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
      minWidth={100}
      minHeight={50}
      bounds="parent"
      className="border-2 border-blue-500 bg-gray-100 shadow-md p-2 flex items-center justify-center"
    >
      <h1
        contentEditable
        suppressContentEditableWarning
        className="overflow-hidden w-full h-full text-black text-2xl font-bold outline-none cursor-text"
        onBlur={(e) => setText(e.currentTarget.innerText)}
      >
        {text}
      </h1>
    </Rnd>
  );
}
