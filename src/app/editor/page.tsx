'use client'

import Image from "next/image"
import file from "../../../public/file.svg"
import { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import EditorDropZone from '@components/EditorDropZone';
import Sidebar from '@components/sidebar/Sidebar';
import Textbox from "@components/textbox"
import Interactive from "@components/interactive"
import DraggableResizableTextbox from "@components/DraggableResizableTextbox";

interface ComponentItem {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export default function Editor() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [activeComponent, setActiveComponent] = useState<{ id: string | null, type: string | null }>({ id: null, type: null });

  const addComponent = (type: string, position: { x: number; y: number }, id: string) => {
    setComponents(prev => [...prev, { id, type, position, size: { width: 200, height: 150 } }]);
  };


  const updateComponent = (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
    setComponents(prev => prev.map(comp => comp.id === id ? { ...comp, position, size } : comp));
  };

  const handleDragStart = ({ active }: any) => {
    setActiveComponent({ id: String(active.id), type: active.data?.current?.type || null });
  };


  // TODO: collision detection on drops is still buggy for components placed on top half of another
  const isColliding = (newPos: { x: number; y: number }, newSize: { width: number; height: number }) => {
    return components.some((comp) => {
      if (comp.id === activeComponent.id) return false;

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

  const handleDragEnd = ({ active, over }: any) => {
    if (over?.id === 'editor-drop-zone' && active.rect.current.translated) {
      const editorBounds = over.rect;
      const draggedRect = active.rect.current.translated as DOMRect;

      const dropX = Math.max(0, Math.min(draggedRect.left - editorBounds.left, editorBounds.width - draggedRect.width));
      const dropY = Math.max(0, Math.min(draggedRect.top - editorBounds.top, editorBounds.height - draggedRect.height));

      let newPos = { x: dropX, y: dropY };
      const newSize = { width: draggedRect.width, height: draggedRect.height }

      if (isColliding(newPos, newSize)) {
        newPos = findNearestFreeSpot(newPos, newSize);
      }

      if (activeComponent.id && activeComponent.type) {
        addComponent(activeComponent.type, newPos, activeComponent.id);
      }
    }
    setActiveComponent({ id: null, type: null });
  };

  const renderOverlayContent = (activeType: string | null) => {
    switch (activeType) {
      case 'textbox':
        return <DraggableResizableTextbox />;
      default:
        return null;
    }
  }

  const renderComponent = (comp: ComponentItem) => {
  if (comp.type === 'textbox') {
    return (
      <DraggableResizableTextbox
        key={comp.id}
        id={comp.id}
        initialX={comp.position.x}
        initialY={comp.position.y}
        initialSize={comp.size}
        components={components}
        updateComponent={updateComponent}
      />
    );
  }
  return null;
};

  return (
    <DndContext
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen">
        <Sidebar />

        <EditorDropZone>
          <h1 className="text-2xl font-bold mb-4">Your Website Preview</h1>
          {components.map(renderComponent)}
        </EditorDropZone>
      </div>
      <DragOverlay>
        {renderOverlayContent(activeComponent.type)}
      </DragOverlay>
    </DndContext>
  );
}
