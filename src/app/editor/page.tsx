'use client'

import { useState, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, DragMoveEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { ArrowUpIcon, XIcon } from "lucide-react";

import EditorDropZone from '@components/EditorDropZone';
import Sidebar from '@components/sidebar/Sidebar';
import DraggableResizableTextbox from '@components/DraggableResizableTextbox';
import SectionTitleTextbox from '@components/SectionTitle';
import LoadingSpinner from '@components/LoadingSpinner';

import type { ComponentItem, Position, Size } from '@customTypes/componentTypes';

import { findBestFreeSpot } from '@utils/collisionUtils';
import { APIResponse } from '@customTypes/apiResponse';
import { useSearchParams } from 'next/navigation';


export default function Editor() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [activeComponent, setActiveComponent] = useState<ComponentItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editorHeight, setEditorHeight] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const draftNumber = searchParams.get("draftNumber");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEditorHeight(window.innerHeight);
    }
  }, []);

  useEffect(() => {
    if (draftNumber) {
      fetchSavedComponents(draftNumber as string).then((res) => {
        return res.json();
      }).then((res) => {
        const savedComponents: ComponentItem[] = [];
        res.data.forEach((c: ComponentItem) => {
          savedComponents.push(c);
        })
        setComponents(savedComponents);
        setIsLoading(false);
      }).catch((error: any) => {
        console.log("error:", error.message);
        setIsLoading(false);
      })
    } else {
      setIsLoading(false)
    }
  }, [draftNumber]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchSavedComponents = (draftNumber: string | string[]) => {
    setIsLoading(true);

    return Promise.resolve(fetch("/api/db/drafts?draftNumber=" + draftNumber, {
      headers: {
        "Content-Type": "application/json",
      },
    }));
  }

  const saveComponents = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/db/drafts?draftNumber=1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          components: components
        }),
      });
      const resBody = await res.json() as APIResponse<string>;

      if (res.ok && resBody.success) {
        setIsLoading(false);
        return
      }

      throw new Error("Bad request");
    } catch (error: any) {
      console.log("error:", error.message)
      setIsLoading(false);
    }
  }

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

  const updateComponent = (id: string, position: Position, size: Size, content?: any) => {
    if (content) {
      setComponents(prev => prev.map(comp => comp.id === id ? { ...comp, position, size, content } : comp));
    } else {
      setComponents(prev => prev.map(comp =>
        comp.id === id ? { ...comp, position, size } : comp
      ));

      if (activeComponent?.id === id) {
        setActiveComponent(prev => (prev ? { ...prev, position, size } : null));
      }
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

      const lowestY = Math.max(...components.map(comp => comp.position.y + comp.size.height), newPos.y + newSize.height);
      setEditorHeight(Math.max(100 + lowestY, window.innerHeight));
    }
  };

  const handleDragMove = ({ active }: DragMoveEvent) => {
    if (!editorRef.current) return;

    const editorRect = editorRef.current.getBoundingClientRect();
    const cursorY = active.rect.current.translated?.top ?? 0;

    if (cursorY > editorRect.bottom - 100) {
      setEditorHeight(prevHeight => prevHeight + 50);
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
      onDragMove={handleDragMove}
    >
      <div className="flex text-black">
        <Sidebar />
        <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full" style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: "10" }} onClick={saveComponents}>Save</button>

        <LoadingSpinner show={isLoading} />

        <EditorDropZone
          ref={editorRef}
          onClick={handleBackgroundClick}
          style={{ minHeight: `${editorHeight}px`, height: 'auto' }}
        >
          {!isLoading && components.length === 0 ? (
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
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-5 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
        >
          <ArrowUpIcon size={24} />
        </button>
      )}
      <DragOverlay>
        {renderOverlayContent(activeComponent?.type || null)}
      </DragOverlay>
    </DndContext>
  );
}
