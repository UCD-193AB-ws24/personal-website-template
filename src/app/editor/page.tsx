'use client'

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import EditorDropZone from '@components/EditorDropZone';
import Sidebar from '@components/sidebar/Sidebar';
import DraggableResizableTextbox from '@components/DraggableResizableTextbox';
import SectionTitleTextbox from '@components/SectionTitle';

import type { ComponentItem } from '@customTypes/componentTypes';

import { findBestFreeSpot } from '@utils/collisionUtils';
import { useSearchParams } from 'next/navigation';


export default function Editor() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [activeComponent, setActiveComponent] = useState<{ id: string | null, type: string | null }>({ id: null, type: null });

  const searchParams = useSearchParams();
  const draftNumber = searchParams.get("draftNumber");

  useEffect(() => {
    if (draftNumber && draftNumber != "-1") {
      fetchSavedComponents(draftNumber as string).then((res) => {
        return res.json();
      }).then((res) => {
        const savedComponents: ComponentItem[] = [];
        res.data.forEach((c: ComponentItem) => {
          savedComponents.push(c);
        })
        setComponents(savedComponents);
      }).catch((err) => {
        console.log("error:", err);
      })
    }
  }, [draftNumber]);

  const fetchSavedComponents = (draftNumber: string | string[]) => {
    return Promise.resolve(fetch("/api/db/drafts?draftNumber=" + draftNumber, {
      headers: {
        "Content-Type": "application/json",
      },
    }));
  }

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only clear active if the background (drop zone) was clicked
    if (e.target === e.currentTarget) {
      setActiveComponent({ id: null, type: null });
    }
  };

  const handleComponentSelect = (id: string, type: string) => {
    setActiveComponent({ id, type });
  };


  const componentSizes: Record<string, { width: number; height: number }> = {
    textBlock: { width: 200, height: 150 },
    sectionTitle: { width: 350, height: 25 },
  };

  const addComponent = (type: string, position: { x: number; y: number }, id: string) => {
    const size = componentSizes[type] || { width: 200, height: 150 };
    setComponents(prev => [...prev, { id, type, position, size }]);
  };

  // Updates a component's position and size, given by their id
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
        initialPos={comp.position}
        initialSize={comp.size}
        components={components}
        content={comp?.content}
        updateComponent={updateComponent}
        isActive={activeComponent.id === comp.id}
        onMouseDown={() => handleComponentSelect(comp.id, comp.type)}
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
        </EditorDropZone>
      </div>
      <DragOverlay>
        {renderOverlayContent(activeComponent.type)}
      </DragOverlay>
    </DndContext>
  );
}
