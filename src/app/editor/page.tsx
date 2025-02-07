'use client'

import { useState } from 'react';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import EditorDropZone from '@components/EditorDropZone';
import Sidebar from '@components/sidebar/Sidebar';
import DraggableResizableTextbox from '@components/DraggableResizableTextbox';
import SectionTitleTextbox from '@components/SectionTitle';

import type { ComponentItem } from '@customTypes/componentTypes';

import { findBestFreeSpot } from '@utils/collisionUtils';


export default function Editor() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [activeComponent, setActiveComponent] = useState<{ id: string | null, type: string | null }>({ id: null, type: null });

  const componentSizes: Record<string, { width: number; height: number }> = {
    textBlock: { width: 200, height: 150 },
    sectionTitle: { width: 350, height: 25 },
  };

  const addComponent = (type: string, position: { x: number; y: number }, id: string) => {
    const size = componentSizes[type] || { width: 200, height: 150 };
    setComponents(prev => [...prev, { id, type, position, size }]);
  };

  const updateComponent = (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
    setComponents(prev => prev.map(comp => comp.id === id ? { ...comp, position, size } : comp));
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveComponent({ id: String(active.id), type: active.data?.current?.type || null });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over?.id === 'editor-drop-zone' && active.rect.current.translated && activeComponent.id && activeComponent.type) {
      const editorBounds = over.rect;
      const draggedRect = active.rect.current.translated as DOMRect;

      const dropX = Math.max(0, Math.min(draggedRect.left - editorBounds.left, editorBounds.width - draggedRect.width));
      const dropY = Math.max(0, Math.min(draggedRect.top - editorBounds.top, editorBounds.height - draggedRect.height));

      const newSize = { width: draggedRect.width, height: draggedRect.height }
      const newPos = findBestFreeSpot({ x: dropX, y: dropY }, newSize, components, activeComponent.id);

      addComponent(activeComponent.type, newPos, activeComponent.id);
    }
    setActiveComponent({ id: null, type: null });
  };

  const renderOverlayContent = (activeType: string | null) => {
    switch (activeType) {
      case 'textBlock':
        return <DraggableResizableTextbox />;
      case 'sectionTitle':
        return <SectionTitleTextbox />
      default:
        return null;
    }
  }

  const componentMap: Record<string, React.ComponentType<Partial<ComponentItem>>> = {
    textBlock: DraggableResizableTextbox,
    sectionTitle: SectionTitleTextbox,
  };

  const renderComponent = (comp: ComponentItem) => {
    const Component = componentMap[comp.type];

    return Component ? (
      <Component
        key={comp.id}
        id={comp.id}
        initialX={comp.position.x}
        initialY={comp.position.y}
        initialSize={comp.size}
        components={components}
        updateComponent={updateComponent}
      />
    ) : null;
  };

  return (
    <DndContext
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen text-black">
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
