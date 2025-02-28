'use client'

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, DragMoveEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { ArrowUpIcon, Router, XIcon } from "lucide-react";
import { ToastContainer } from 'react-toastify';

import EditorDropZone from '@components/EditorDropZone';
import Sidebar from '@components/sidebar/Sidebar';
import DraggableResizableTextbox from '@components/DraggableResizableTextbox';
import SectionTitleTextbox from '@components/SectionTitle';
import NavigationBar from '@components/NavigationBar';
import LoadingSpinner from '@components/LoadingSpinner';
import { toastPublish } from '@components/PublishToast';

import type { ComponentItem, Page, Position, Size } from '@customTypes/componentTypes';

import { findBestFreeSpot } from '@utils/collisionUtils';
import { APIResponse } from '@customTypes/apiResponse';
import { useSearchParams } from 'next/navigation';
import { toastSaveSuccess } from '@components/SaveToast';
import { saveDraft } from '@lib/requests/saveDrafts';
import SavedDrafts from '../saveddrafts/page';

function DraftLoader({ setPages, setActivePageId, setComponents, setIsLoading, setDraftNumber, setHasLoadedDraftOnce }: { setPages: any, setActivePageId: any, setComponents: (c: ComponentItem[]) => void, setIsLoading: (loading: boolean) => void, setDraftNumber: (draftNumber: number) => void, setHasLoadedDraftOnce: (hasLoadedDraftOnce: boolean) => void }) {
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
          const draftPages = res.data;
          setPages(draftPages);

          if (draftPages.length > 0) {
            setActivePageId(0);
            setComponents(draftPages[0].components || []);
          } else {
            // No pages exist, create a default one
            const defaultPage = { pageName: "Home", components: [] };
            setPages([defaultPage]);
            setActivePageId(0);
            setComponents([]);
          }

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
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number | null>(null);


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

  const switchPage = (pageIndex: number) => {
    if (activePageIndex == null) return;

    setPages(prevPages => {
      const updatedPages = [...prevPages];
      updatedPages[activePageIndex].components = components;
      return updatedPages;
    });

    setActivePageIndex(pageIndex);
    setComponents(pages[pageIndex]?.components || []);
    setActiveComponent(null)
  };

  const updatePageName = (index: number, newName: string) => {
    setPages(prevPages => {
      const updatedPages = [...prevPages];
      updatedPages[index].pageName = newName;
      return updatedPages;
    });
  };

  const addPage = () => {
    setPages(prevPages => {
      if (activePageIndex !== null) {
        prevPages[activePageIndex].components = [...components];
      }

      // Enumerate New Page (e.g., New Page 2, New Page 3, ...)
      const existingNames = new Set(prevPages.map(page => page.pageName));
      let counter = 2;
      let newPageName = "New Page";
      while (existingNames.has(newPageName)) {
        newPageName = `New Page ${counter++}`;
      }

      const updatedPages = [...prevPages, { pageName: newPageName, components: [] }]

      setActivePageIndex(updatedPages.length - 1);
      setComponents([]);

      return updatedPages;
    });
  };

  const deletePage = (pageIndex: number) => {
    if (activePageIndex == null) return;

    // Save components first
    setPages(prevPages => {
      const updatedPages = [...prevPages];
      updatedPages[activePageIndex].components = components;
      return updatedPages;
    });
    const pageToDelete = pages[pageIndex];

    if (pageToDelete.components.length > 1) {
      toast(
        <div className="flex flex-col">
          <h3 className="font-semibold text-lg text-yellow-500">Warning</h3>
          <p className="text-sm">
            Are you sure you want to delete this page?
          </p>
          <div className="flex justify-between mt-4">
            <button
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
              onClick={() => toast.dismiss()}
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition ml-3"
              onClick={() => {
                toast.dismiss();
                confirmDelete(pageIndex);
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div >,
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
          transition: Flip,
        }
      );
      return;
    }
    confirmDelete(pageIndex);
  };

  const confirmDelete = (pageIndex: number) => {
    if (activePageIndex == null) return;

    setPages(prevPages => {
      const updatedPages = [...prevPages];
      updatedPages.splice(pageIndex, 1); // Remove the selected page

      let newActiveIndex = activePageIndex;

      // If the deleted page was the active page, shift active page index
      if (activePageIndex >= updatedPages.length) {
        newActiveIndex = updatedPages.length - 1;
      } else if (activePageIndex === pageIndex) {
        newActiveIndex = Math.max(0, pageIndex - 1);
      }

      setActivePageIndex(newActiveIndex);
      setComponents(updatedPages[newActiveIndex]?.components || []);

      return updatedPages;
    });
  };

  const handleSaveDraft = async () => {
    if (activePageIndex == null) return;
    setIsLoading(true);

    try {
      // Save changes to the current page
      const updatedPages = pages.map((page, index) =>
        index === activePageIndex ? { ...page, components: [...components] } : page
      );

      setPages(updatedPages);

      const result = await saveDraft(draftNumber, pages);

      if (result === "") {
        setIsLoading(false);
        toastSaveSuccess();
        return
      }

      throw new Error("Bad request");
    } catch (error: any) {
      console.log("error:", error.message)
      setIsLoading(false);
    }
  }

  // Saves the current changes and publishes the draft
  const handlePublish = async () => {
    setIsLoading(true);

    try {
      // Save changes to the current page
      const updatedPages = pages.map((page, index) =>
        index === activePageIndex ? { ...page, components: [...components] } : page
      );

      setPages(updatedPages);

      const saveDraftResult = await saveDraft(draftNumber, updatedPages);
      if (saveDraftResult !== "") {
        throw new Error(saveDraftResult);
      }

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

      if (res.ok && resBody.success) {
        toastPublish();
        setIsLoading(false);
        return;
      }

      throw new Error(resBody.error);
    } catch (error: any) {
      console.log("Error:", error.message);
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
    sectionTitle: { width: 350, height: 50 },
    navBar: { width: 5000, height: 48 }
  };

  const addComponent = (type: string, position: { x: number; y: number }, id: string) => {
    const size = componentSizes[type] || { width: 200, height: 150 };

    if (type === "navBar") {
      const hasNavBar = components.some((comp) => comp.type === "navBar");
      if (hasNavBar) return; // do not add an additional nav bar
    }

    setComponents(prev => [...prev, { id, type, position, size }]);
  };

  const removeComponent = (id: string) => {
    setComponents(prev => {
      const componentToRemove = prev.find(comp => comp.id === id);
      const updatedComponents = prev.filter(comp => comp.id !== id);

      // If the removed component is a navBar, set the first page's name back to Home
      if (componentToRemove?.type === "navBar") {
        setPages(prevPages => {
          const updatedPages = [...prevPages];
          if (updatedPages.length > 0) {
            updatedPages[0] = { ...updatedPages[0], pageName: "Home" };
          }
          return updatedPages;
        });
      }

      return updatedComponents;
    });

    setActiveComponent(null);
  };


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
      if (activeComponent.type == 'navBar') {
        const draggedRect = active.rect.current.translated as DOMRect;
        addComponent(activeComponent.type, { x: 0, y: 0 }, activeComponent.id);
        setActiveComponent({ ...activeComponent, position: { x: 0, y: 0 }, size: { width: draggedRect.width, height: draggedRect.height } });
        return;
      }
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
      case 'navBar':
        return <NavigationBar />
      default:
        return null;
    }
  }

  const componentMap: Record<string, React.ComponentType<Partial<ComponentItem>>> = {
    textBlock: DraggableResizableTextbox,
    sectionTitle: SectionTitleTextbox,
    navBar: NavigationBar,
  };

  const renderComponent = (comp: ComponentItem) => {
    if (comp.type === "navBar") {
      return (
        <NavigationBar
          key={comp.id}
          components={components}
          setComponents={setComponents}
          pages={pages}
          setPages={setPages}
          activePageIndex={activePageIndex || 0}
          setActivePageIndex={setActivePageIndex}
          switchPage={switchPage}
          addPage={addPage}
          deletePage={deletePage}
          updatePageName={updatePageName}
          isPreview={isPreview}
          onMouseDown={() => handleComponentSelect(comp)}
        />
      );
    }

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

  {/* Make Navigation Bar always present when more than one page exists */ }
  useEffect(() => {
    if (pages.length > 1 && !components.some((comp) => comp.type === "navBar")) {
      addComponent("navBar", { x: 0, y: 0 }, `navBar-${Date.now()}`);
    }
  }, [pages, components]);

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
            className={`flex ${isPreview ? "justify-center items-center h-screen bg-gray-200" : ""} text-black relative bg-white`}
          >
            <Sidebar />

            <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full" style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: "10" }} onClick={handleSaveDraft}>Save</button>

            <LoadingSpinner show={isLoading} />
            <ToastContainer />

            <Suspense fallback={<LoadingSpinner show={true} />}>
              {!hasLoadedDraftOnce && (<DraftLoader setPages={setPages} setActivePageId={setActivePageIndex} setDraftNumber={setDraftNumber} setComponents={setComponents} setIsLoading={setIsLoading} setHasLoadedDraftOnce={setHasLoadedDraftOnce} />)}
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
                {!isLoading && components.length === 0 && pages.length < 2 ? (
                  <h1 className="text-2xl font-bold mb-4 text-gray-400 text-center mt-20">
                    Drag components here to start building your site!
                  </h1>
                ) : (
                  components.map(renderComponent)
                )}

                {activeComponent && !isDragging && (
                  (activeComponent.type !== "navBar" || pages.length === 1) && (
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
                        left:
                          activeComponent.type === "navBar"
                            ? "50px"
                            : `${activeComponent.position.x + activeComponent.size.width - 20}px`,
                        zIndex: 10,
                        pointerEvents: "auto",
                        transition: "opacity 0.2s ease-in-out, transform 0.1s",
                      }}
                      className="w-6 h-6 bg-red-500 text-white rounded shadow-md hover:bg-red-600 hover:scale-110 flex items-center justify-center z-50"
                    >
                      <XIcon size={32} />
                    </button>
                  )
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
