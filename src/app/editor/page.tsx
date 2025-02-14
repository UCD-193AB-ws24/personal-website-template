'use client'

import { useState } from 'react';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { XIcon } from "lucide-react";

import EditorDropZone from '@components/EditorDropZone';
import Sidebar from '@components/sidebar/Sidebar';
import DraggableResizableTextbox from '@components/DraggableResizableTextbox';
import SectionTitleTextbox from '@components/SectionTitle';

import type { ComponentItem } from '@customTypes/componentTypes';

import { findBestFreeSpot } from '@utils/collisionUtils';


export default function Editor() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [activeComponent, setActiveComponent] = useState<ComponentItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only clear active if the background (drop zone) was clicked
    if (e.target === e.currentTarget) {
      setActiveComponent(null)
    }
  };

  const handleComponentSelect = (component: ComponentItem) => {
    setActiveComponent(component);
  };


  const componentSizes: Record<string, { width: number; height: number }> = {
    textBlock: { width: 200, height: 150 },
    sectionTitle: { width: 350, height: 25 },
  };

  const addComponent = (type: string, position: { x: number; y: number }, id: string) => {
    const size = componentSizes[type] || { width: 200, height: 150 };
    setComponents(prev => [...prev, { id, type, position, size }]);
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    setActiveComponent(null);
  }

  const updateComponent = (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
    setComponents(prev => prev.map(comp =>
      comp.id === id ? { ...comp, position, size } : comp
    ));

    if (activeComponent?.id === id) {
      setActiveComponent(prev => (prev ? { ...prev, position, size } : null));
    }
  };


  const handleDragStart = ({ active }: DragStartEvent) => {
    setIsDragging(true);
    const id = String(active.id);
    const type = active.data?.current?.type || null;
    setActiveComponent({ id, type, position: { x: -1, y: -1 }, size: { width: -1, height: -1 } });
  };


  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setIsDragging(false);
    if (!activeComponent) return;
    if (over?.id === 'editor-drop-zone' && active.rect.current.translated) {
      const editorBounds = over.rect;
      const draggedRect = active.rect.current.translated as DOMRect;

      const dropX = Math.max(0, Math.min(draggedRect.left - editorBounds.left, editorBounds.width - draggedRect.width));
      const dropY = Math.max(0, Math.min(draggedRect.top - editorBounds.top, editorBounds.height - draggedRect.height));

      const newSize = { width: draggedRect.width, height: draggedRect.height };
      const newPos = findBestFreeSpot({ x: dropX, y: dropY }, newSize, components, activeComponent.id);

      addComponent(activeComponent.type, newPos, activeComponent.id);
      setActiveComponent({ ...activeComponent, position: newPos, size: newSize });
    }
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
        isActive={activeComponent?.id === comp.id}
        onMouseDown={() => handleComponentSelect(comp)}
        setIsDragging={setIsDragging}
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

        <EditorDropZone onClick={handleBackgroundClick}>
          {components.length === 0 ? (
            <h1 className="text-2xl font-bold mb-4 text-gray-400 text-center mt-20">
              Drag components here to start building your site!
            </h1>
          ) : (
            components.map(renderComponent)
          )}

          {activeComponent && !isDragging && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeComponent(activeComponent.id);
              }}
              style={{
                position: "absolute",
                top: activeComponent.position.y < 40
                  ? `${activeComponent.position.y + activeComponent.size.height + 15}px`
                  : `${activeComponent.position.y - 25}px`,
                left: `${activeComponent.position.x + activeComponent.size.width - 20}px`,
                zIndex: 10,
                pointerEvents: "auto",
                transition: "opacity 0.2s ease-in-out, transform 0.1s",
              }}
              className="w-6 h-6 bg-red-500 text-white rounded shadow-md hover:bg-red-600 hover:scale-110 flex items-center justify-center"
            >
              <XIcon size={32} />
            </button>
          )}

        </EditorDropZone>
      </div>
      <DragOverlay>
        {renderOverlayContent(activeComponent?.type || null)}
      </DragOverlay>
    </DndContext>
  );
}
