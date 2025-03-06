import { DraggableData, Position, ResizableDelta } from "react-rnd";
import { ResizeDirection } from "re-resizable";
import { findBestFreeSpot } from "@utils/collisionUtils";

import type { ComponentItem, Size } from "@customTypes/componentTypes";

export const handleDragStop = (
  id: string,
  size: { width: number; height: number },
  components: ComponentItem[],
  updateComponent: (
    id: string,
    newPos: Position,
    newSize: Size,
    content?: any,
  ) => void,
  setPosition: (pos: { x: number; y: number }) => void,
) => {
  return (e: any, d: DraggableData) => {
    const newPos = findBestFreeSpot({ x: d.x, y: d.y }, size, components, id);
    setPosition(newPos);
    updateComponent(id, newPos, size);
  };
};

export const handleResizeStop = (
  id: string,
  components: ComponentItem[],
  updateComponent: (
    id: string,
    newPos: Position,
    newSize: Size,
    content?: any,
  ) => void,
  setSize: (size: { width: number; height: number }) => void,
  setPosition: (pos: { x: number; y: number }) => void,
) => {
  return (
    e: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    ref: HTMLElement,
    delta: ResizableDelta,
    newPos: Position,
  ) => {
    const newSize = {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    };

    const finalPos = findBestFreeSpot(newPos, newSize, components, id);
    setSize(newSize);
    setPosition(finalPos);
    updateComponent(id, finalPos, newSize);
  };
};
