import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

interface DraggableResizableTextboxProps {
  id?: string;
  initialX?: number;
  initialY?: number;
  initialSize?: { width: number; height: number };
  components?: {
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }[];
  updateComponent?: (id: string, newPos: { x: number; y: number }, newSize: { width: number; height: number }) => void;
}

export default function DraggableResizableTextbox({
  id = "",
  initialX = -1,
  initialY = -1,
  initialSize = { width: 200, height: 50 },
  components = [],
  updateComponent = () => {},
}: DraggableResizableTextboxProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState(initialSize);

  const isColliding = (newPos: { x: number; y: number }, newSize: { width: number; height: number }) => {
    return components.some((comp) => {
      if (comp.id === id) return false;

      const rect1 = { x: newPos.x, y: newPos.y, right: newPos.x + newSize.width, bottom: newPos.y + newSize.height };
      const rect2 = { x: comp.position.x, y: comp.position.y, right: comp.position.x + comp.size.width, bottom: comp.position.y + comp.size.height };

      return (
        rect1.x < rect2.right &&
        rect1.right > rect2.x &&
        rect1.y < rect2.bottom &&
        rect1.bottom > rect2.y
      );
    });
  };

  const findNearestFreeSpot = (startPos: { x: number; y: number }, newSize: { width: number; height: number }) => {
    const step = 10;
    let angle = 0;
    let radius = 0;

    while (radius < 500) { // Limit the search radius
      const newX = startPos.x + radius * Math.cos(angle);
      const newY = startPos.y + radius * Math.sin(angle);

      const candidatePos = { x: Math.max(0, newX), y: Math.max(0, newY) };

      if (!isColliding(candidatePos, newSize)) {
        return candidatePos;
      }

      angle += Math.PI / 4; // Move in a circular pattern
      if (angle >= 2 * Math.PI) {
        angle = 0;
        radius += step;
      }
    }

    return startPos;
  };

  const handleDragStop = (e: any, d: any) => {
    let newPos = { x: d.x, y: d.y };

    if (isColliding(newPos, size)) {
      newPos = findNearestFreeSpot(newPos, size);
    }

    setPosition(newPos);
    updateComponent(id, newPos, size);
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, newPos: any) => {
    const newSize = {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    };

    let finalPos = newPos;

    if (isColliding(newPos, newSize)) {
      finalPos = findNearestFreeSpot(newPos, newSize);
    }

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
        className="w-full h-full resize-none border-none outline-none bg-transparent p-2 text-lg"
        placeholder="Type here..."
      />
    </Rnd>
  );
}
