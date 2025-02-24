'use client'

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, DragMoveEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { ArrowUpIcon, Router, XIcon } from "lucide-react";
import { ToastContainer, toast, Bounce, Slide, Zoom, Flip } from 'react-toastify';

import EditorDropZone from '@components/EditorDropZone';
import Sidebar from '@components/sidebar/Sidebar';
import DraggableResizableTextbox from '@components/DraggableResizableTextbox';
import SectionTitleTextbox from '@components/SectionTitle';
import LoadingSpinner from '@components/LoadingSpinner';
import PublishToast from '@components/PublishToast';

import type { ComponentItem, Position, Size } from '@customTypes/componentTypes';

import { findBestFreeSpot } from '@utils/collisionUtils';
import { APIResponse } from '@customTypes/apiResponse';
import { useSearchParams } from 'next/navigation';
import { fetchUsername } from '@lib/requests/fetchUsername';

function DraftLoader({ setComponents, setIsLoading, setDraftNumber, setHasLoadedDraftOnce }: { setComponents: (c: ComponentItem[]) => void, setIsLoading: (loading: boolean) => void, setDraftNumber: (draftNumber: number) => void, setHasLoadedDraftOnce: (hasLoadedDraftOnce: boolean) => void }) {
  const searchParams = useSearchParams();
  const draftNumber = searchParams.get("draftNumber");

  useEffect(() => {
    setDraftNumber(parseInt(draftNumber!));

    if (draftNumber) {
      fetch(`/api/db/drafts?draftNumber=${draftNumber}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setComponents(Array.isArray(res.data) ? res.data : []);
          setIsLoading(false);
          setHasLoadedDraftOnce(true);
        })
        .catch((error) => {
          console.error("Error fetching draft:", error);
          setIsLoading(false);
          setHasLoadedDraftOnce(true);
        });
    } else {
      setIsLoading(false);
      setHasLoadedDraftOnce(true);
    }
  }, [draftNumber]);

  return null;
}

export default function Editor() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [activeComponent, setActiveComponent] = useState<ComponentItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editorHeight, setEditorHeight] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedDraftOnce, setHasLoadedDraftOnce] = useState(false);
  const [draftNumber, setDraftNumber] = useState(-1);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEditorHeight(window.innerHeight - 64); // top bar is 64px
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const saveComponents = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/db/drafts?draftNumber=${draftNumber}`, {
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

  const handlePublish = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/user/publish-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftNumber: draftNumber
        }),
      });

      const resBody = await res.json();

      if (!resBody.success) {
        throw new Error(resBody.error);
      }

      setIsLoading(false);
      await toastPublish()
    } catch (error: any) {
      console.log("Error:", error.message);
      setIsLoading(false);
    }
  }

  const toastPublish = async () => {
    const username = await fetchUsername();

    toast(PublishToast, {
      position: "top-right",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
      theme: "light",
      transition: Flip,
      onClose: (reason) => {
        switch (reason) {
          case "view":
            window.open(`${process.env.NEXT_PUBLIC_URL}/pages/${username}`, '_blank')?.focus()
          default:
        }
      },
    });
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
    sectionTitle: { width: 350, height: 50 },
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
      setEditorHeight(Math.max(lowestY + 100, window.innerHeight - 64));
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
        isPreview={isPreview}
      />
    ) : null;
  };

  return (
    <>
      {isPreview ?
        <div
          className="bg-white"
        >
          <button
            className={`text-white text-large font-semibold px-3 py-2 rounded-md mr-1 bg-red-500 transition-all duration-300 hover:bg-red-700 shadow-md hover:shadow-lg fixed top-[10px] right-[0px] z-10`}
            onClick={() => setIsPreview(!isPreview)}
          >
            Exit Preview
          </button>
          <div
            /* Sidebar is w-64 = 16rem*/
            className="relative min-h-screen w-[calc(100%-16rem)] mx-auto"
            style={{ minHeight: `${editorHeight + 64}px` }} // top bar is 64px
          >
            {components.map(renderComponent)}
          </div>
        </div>
        :
        <DndContext
          modifiers={[restrictToWindowEdges]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
        >
          <div
            className={`flex ${isPreview ? "justify-center items-center h-screen bg-gray-200" : ""} text-black relative`}
          >
            <Sidebar />

            <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full" style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: "10" }} onClick={saveComponents}>Save</button>

            <LoadingSpinner show={isLoading} />
            <ToastContainer />

            <Suspense fallback={<LoadingSpinner show={true} />}>
              {!hasLoadedDraftOnce && (<DraftLoader setDraftNumber={setDraftNumber} setComponents={setComponents} setIsLoading={setIsLoading} setHasLoadedDraftOnce={setHasLoadedDraftOnce} />)}
            </Suspense>

            <div className="flex flex-col flex-grow">
              <div className="fixed top-0 right-0 z-50 bg-gray-100 flex justify-between items-center px-6 py-3 w-[calc(100%-256px)] h-[64px]">
                <Link href="/saveddrafts" className="text-large font-semibold px-4 py-2 rounded-md border border-gray-500 transition-all duration-300 hover:bg-gray-500 hover:text-white shadow-md hover:shadow-lg">
                  Drafts
                </Link>
                <div className="flex">
                  <button
                    className={`text-large font-semibold px-4 py-2 rounded-md mr-4 border border-blue-500 transition-all duration-300 hover:bg-blue-500 hover:text-white shadow-md hover:shadow-lg`}
                    onClick={() => setIsPreview(!isPreview)}
                  >
                    Preview
                  </button>

                  <button
                    className={`text-white text-large font-semibold px-4 py-2 rounded-md bg-blue-500 transition-all duration-300 hover:bg-blue-700 shadow-md hover:shadow-lg`}
                    onClick={handlePublish}
                  >
                    Publish
                  </button>
                </div>
              </div>
              <EditorDropZone
                ref={editorRef}
                onClick={handleBackgroundClick}
                style={{ minHeight: `${editorHeight}px`, height: 'auto', marginTop: '64px' }}
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
          </div>
          {showScrollTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-20 right-5 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
            >
              <ArrowUpIcon size={24} />
            </button>
          )}
          <DragOverlay>
            {renderOverlayContent(activeComponent?.type || null)}
          </DragOverlay>
        </DndContext>
      }
    </>
  );
}
