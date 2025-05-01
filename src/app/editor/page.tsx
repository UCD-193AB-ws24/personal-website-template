"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { ArrowUpIcon, XIcon } from "lucide-react";
import { ToastContainer } from "react-toastify";

import EditorDropZone from "@components/editorComponents/EditorDropZone";
import EditorTopBar from "@components/editorComponents/EditorTopBar";
import Sidebar from "@components/sidebar/Sidebar";
import NavigationBar from "@components/editorComponents/NavigationBar";
import LoadingSpinner from "@components/LoadingSpinner";
import { toastPublish } from "@components/toasts/PublishToast";
import FullWindow from "@components/FullWindow";

import type {
  ComponentItem,
  Page,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { findBestFreeSpot } from "@utils/collisionUtils";
import {
  componentMap,
  componentSizes,
  renderOverlayContent,
} from "@utils/componentUtils";
import {
  switchPage,
  updatePageName,
  addPage,
  deletePage,
} from "@utils/pageManagerUtils";
import { GRID_SIZE } from "@utils/constants";
import { useSearchParams } from "next/navigation";
import { toastSaveSuccess } from "@components/toasts/SaveToast";
import { saveDraft } from "@lib/requests/saveDrafts";
import { fetchDraftName } from "@lib/requests/fetchDraftName";
import { auth } from "@lib/firebase/firebaseApp";
import { deleteUnusedDraftFiles } from "@lib/requests/deleteUnusedFiles";
import EditorContextProvider from "@contexts/EditorContext";
import PagesContextProvider from "@contexts/PagesContext";
import ProjectCard from "@components/editorComponents/ProjectCard";

interface DraftLoaderProps {
  setPages: any;
  setActivePageId: any;
  setComponents: (c: ComponentItem[]) => void;
  setIsLoading: (loading: boolean) => void;
  setDraftNumber: (draftNumber: number) => void;
  setHasLoadedDraftOnce: (hasLoadedDraftOnce: boolean) => void;
  setDraftName: (newDraftName: string) => void;
}

function DraftLoader({
  setPages,
  setActivePageId,
  setComponents,
  setIsLoading,
  setDraftNumber,
  setHasLoadedDraftOnce,
  setDraftName,
}: DraftLoaderProps) {
  const searchParams = useSearchParams();
  const draftNumber = searchParams.get("draftNumber");

  useEffect(() => {
    setDraftNumber(parseInt(draftNumber!));
    fetchDraftName(parseInt(draftNumber!)).then((name) => setDraftName(name));

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
            const defaultPage = {
              pageName: "Home",
              components: [],
            };
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
  }, [
    draftNumber,
    setDraftNumber,
    setDraftName,
    setPages,
    setActivePageId,
    setComponents,
    setIsLoading,
    setHasLoadedDraftOnce,
  ]);

  return null;
}

export default function Editor() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [activeComponent, setActiveComponent] = useState<ComponentItem | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [editorHeight, setEditorHeight] = useState(0);
  const [editorWidth, setEditorWidth] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedDraftOnce, setHasLoadedDraftOnce] = useState(false);
  const [draftNumber, setDraftNumber] = useState(-1);
  const [isPreview, setIsPreview] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number | null>(null);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const defaultHeight = container.clientHeight;
    const defaultWidth = container.clientWidth;

    const lowestY = Math.max(
      ...components.map((comp) => comp.position.y + comp.size.height),
    );

    const farthestX = Math.max(
      ...components
        .filter((comp) => comp.type !== "navBar" && comp.type !== "projectCard")
        .map((comp) => comp.position.x + comp.size.width),
    );

    setEditorHeight(Math.max(lowestY + 50, defaultHeight));
    setEditorWidth(Math.max(farthestX, defaultWidth));
  }, [components]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container?.scrollTop > 300);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const componentsRef = useRef(components);
  useEffect(() => {
    componentsRef.current = components;
  }, [components]);

  const handleSwitchPage = (pageIndex: number) => {
    switchPage(
      pageIndex,
      activePageIndex,
      pages,
      setPages,
      componentsRef.current,
      setComponents,
      setActiveComponent,
      setActivePageIndex,
    );
  };

  const handleUpdatePageName = (pageIndex: number, newName: string) => {
    updatePageName(pageIndex, newName, setPages);
  };

  const handleAddPage = () => {
    addPage(
      activePageIndex,
      components,
      setPages,
      setActivePageIndex,
      setComponents,
    );
  };

  const handleDeletePage = (pageIndex: number) => {
    deletePage(
      pageIndex,
      activePageIndex,
      pages,
      components,
      setPages,
      setActivePageIndex,
      setComponents,
    );
  };

  const handleSaveDraft = async () => {
    if (activePageIndex == null) return;
    setIsLoading(true);

    try {
      // Save changes to the current page
      const updatedPages = pages.map((page, index) =>
        index === activePageIndex
          ? { ...page, components: [...components] }
          : page,
      );

      setPages(updatedPages);

      // Delete deleted images from Firebase Storage
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");
      deleteUnusedDraftFiles(userId, String(draftNumber), updatedPages);

      const result = await saveDraft(draftNumber, updatedPages);

      if (result === "") {
        setIsLoading(false);
        toastSaveSuccess();
        return;
      }

      throw new Error("Bad request");
    } catch (error: any) {
      console.log("error:", error.message);
      setIsLoading(false);
    }
  };

  // Saves the current changes and publishes the draft
  const handlePublish = async () => {
    setIsLoading(true);

    try {
      // Save changes to the current page
      const updatedPages = pages.map((page, index) =>
        index === activePageIndex
          ? { ...page, components: [...components] }
          : page,
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
          draftNumber: draftNumber,
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
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only clear active if the background (drop zone) was clicked
    if (e.target === e.currentTarget) {
      setActiveComponent(null);
    }
  };

  const handleComponentSelect = (component: ComponentItem) => {
    setActiveComponent(component);
  };

  const addComponent = (
    type: string,
    position: { x: number; y: number },
    id: string,
  ) => {
    const size = componentSizes[type] || { width: 200, height: 150 };

    if (type === "navBar") {
      const hasNavBar = components.some((comp) => comp.type === "navBar");
      if (hasNavBar) return; // do not add an additional nav bar
    }

    setComponents((prev) => [...prev, { id, type, position, size }]);
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => {
      const componentToRemove = prev.find((comp) => comp.id === id);
      const updatedComponents = prev.filter((comp) => comp.id !== id);

      // If the removed component is a navBar, set the first page's name back to Home
      if (componentToRemove?.type === "navBar") {
        setPages((prevPages) => {
          const updatedPages = [...prevPages];
          if (updatedPages.length > 0) {
            updatedPages[0] = {
              ...updatedPages[0],
              pageName: "Home",
            };
          }
          return updatedPages;
        });
      }

      return updatedComponents;
    });

    setActiveComponent(null);
  };

  const updateComponent = (
    id: string,
    position: Position,
    size: Size,
    content?: any,
  ) => {
    if (content) {
      setComponents((prev) =>
        prev.map((comp) =>
          comp.id === id ? { ...comp, position, size, content } : comp,
        ),
      );
    } else {
      setComponents((prev) =>
        prev.map((comp) =>
          comp.id === id ? { ...comp, position, size } : comp,
        ),
      );

      if (activeComponent?.id === id) {
        setActiveComponent((prev) =>
          prev ? { ...prev, position, size } : null,
        );
      }
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setIsDragging(true);
    const id = String(active.id);
    const type = active.data?.current?.type || null;
    setActiveComponent({
      id,
      type,
      position: { x: -1, y: -1 },
      size: { width: -1, height: -1 },
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setIsDragging(false);
    if (!activeComponent) return;
    if (over?.id === "editor-drop-zone" && active.rect.current.translated) {
      if (activeComponent.type == "navBar") {
        const draggedRect = active.rect.current.translated as DOMRect;
        addComponent(activeComponent.type, { x: 0, y: 0 }, activeComponent.id);
        setActiveComponent({
          ...activeComponent,
          position: { x: 0, y: 0 },
          size: {
            width: draggedRect.width,
            height: draggedRect.height,
          },
        });
        return;
      }
      const editorBounds = over.rect;
      const draggedRect = active.rect.current.translated as DOMRect;

      const dropX = Math.max(
        0,
        Math.min(
          draggedRect.left - editorBounds.left,
          editorBounds.width - draggedRect.width,
        ),
      );
      const dropY = Math.max(
        0,
        Math.min(
          draggedRect.top - editorBounds.top,
          editorBounds.height - draggedRect.height,
        ),
      );

      let roundedX = Math.round(dropX / GRID_SIZE) * GRID_SIZE;
      const roundedY = Math.round(dropY / GRID_SIZE) * GRID_SIZE;
      if (activeComponent.type === "projectCard") roundedX = 0;

      const newSize = componentSizes[activeComponent.type] || {
        width: draggedRect.width,
        height: draggedRect.height,
      };

      const newPos = findBestFreeSpot(
        { x: roundedX, y: roundedY },
        newSize,
        components,
        activeComponent.id,
      );

      addComponent(activeComponent.type, newPos, activeComponent.id);
      setActiveComponent({
        ...activeComponent,
        position: newPos,
        size: newSize,
      });

      const lowestY = Math.max(
        ...components.map((comp) => comp.position.y + comp.size.height),
        newPos.y + newSize.height,
      );
      setEditorHeight(Math.max(lowestY + 100, window.innerHeight - 64));
    }
  };

  const handleDragMove = ({ active }: DragMoveEvent) => {
    if (!editorRef.current) return;

    const editorRect = editorRef.current.getBoundingClientRect();
    const cursorY = active.rect.current.translated?.top ?? 0;

    if (cursorY > editorRect.bottom - 100) {
      setEditorHeight((prevHeight) => prevHeight + 50);
    }
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
          switchPage={handleSwitchPage}
          addPage={handleAddPage}
          deletePage={handleDeletePage}
          updatePageName={handleUpdatePageName}
          isPreview={isPreview}
          isMobilePreview={isMobilePreview}
          onMouseDown={() => handleComponentSelect(comp)}
        />
      );
    } else if (comp.type === "projectCard") {
      return (
        <ProjectCard
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
          isMobilePreview={isMobilePreview}
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

  {
    /* Make Navigation Bar always present when more than one page exists */
  }
  useEffect(() => {
    if (
      pages.length > 1 &&
      !components.some((comp) => comp.type === "navBar")
    ) {
      addComponent("navBar", { x: 0, y: 0 }, `navBar-${Date.now()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, components]);

  return (
    <>
      {/* Full-screen white background to cover the body::before */}
      <div className="fixed inset-0 z-0 bg-white" />

      {isPreview ? (
        <PagesContextProvider pages={pages}>
          <EditorContextProvider handleSwitchPage={handleSwitchPage}>
            <div
              className={`bg-white min-w-[100vw] h-auto w-max ${!isMobilePreview ? "min-h-screen" : ""}`}
            >
              <button
                className="text-white text-large font-semibold px-3 py-2 rounded-md mr-2 bg-gray-600 hover:bg-gray-800 shadow-md hover:shadow-lg fixed top-[10px] right-[140px] z-[1000]"
                onClick={() => setIsMobilePreview(!isMobilePreview)}
              >
                {isMobilePreview ? "Switch to Desktop" : "Switch to Mobile"}
              </button>
              <button
                className={`text-white text-large font-semibold px-3 py-2 rounded-md mr-1 bg-red-500 transition-all duration-300 hover:bg-red-700 shadow-md hover:shadow-lg fixed top-[10px] right-[0px] z-[1000]`}
                onClick={() => {
                  setIsPreview(!isPreview);
                  setIsMobilePreview(false);
                }}
              >
                Exit Preview
              </button>
              <FullWindow
                width={editorWidth}
                lowestY={editorHeight - 50}
                isMobilePreview={isMobilePreview}
              >
                {components.map(renderComponent)}
              </FullWindow>
            </div>
          </EditorContextProvider>
        </PagesContextProvider>
      ) : (
        <PagesContextProvider pages={pages}>
          <EditorContextProvider handleSwitchPage={handleSwitchPage}>
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

                <button
                  className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md"
                  style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    zIndex: "10",
                  }}
                  onClick={handleSaveDraft}
                >
                  Save
                </button>

                <LoadingSpinner show={isLoading} />
                <ToastContainer />

                <Suspense fallback={<LoadingSpinner show={true} />}>
                  {!hasLoadedDraftOnce && (
                    <DraftLoader
                      setPages={setPages}
                      setActivePageId={setActivePageIndex}
                      setDraftNumber={setDraftNumber}
                      setComponents={setComponents}
                      setIsLoading={setIsLoading}
                      setHasLoadedDraftOnce={setHasLoadedDraftOnce}
                      setDraftName={setDraftName}
                    />
                  )}
                </Suspense>

                <EditorTopBar
                  draftName={draftName}
                  isGridVisible={isGridVisible}
                  setIsGridVisible={setIsGridVisible}
                  isPreview={isPreview}
                  setIsPreview={setIsPreview}
                  handlePublish={handlePublish}
                />

                <div
                  className="overflow-auto"
                  ref={scrollContainerRef}
                  style={{
                    marginTop: "64px",
                    marginLeft: "16rem",
                    height: `calc(100vh - 64px)`, // full height minus top bar
                    width: `calc(100vw - 16rem)`, // full width minus sidebar
                  }}
                >
                  <EditorDropZone
                    ref={editorRef}
                    onClick={handleBackgroundClick}
                    style={{
                      backgroundSize: isGridVisible ? "20px 20px" : "auto",
                      minHeight: `${editorHeight}px`,
                      minWidth: `${editorWidth}px`,
                    }}
                    // https://ibelick.com/blog/create-grid-and-dot-backgrounds-with-css-tailwind-css
                    className={`relative transition-all ${
                      isGridVisible
                        ? `absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#e2e5e9_1px,transparent_1px),linear-gradient(to_bottom,#e2e5e9_1px,transparent_1px)] bg-[size:${GRID_SIZE}px_${GRID_SIZE}px]`
                        : "bg-white"
                    }`}
                  >
                    {!isLoading &&
                    components.length === 0 &&
                    pages.length < 2 ? (
                      <h1 className="text-2xl font-bold mb-4 text-gray-400 text-center mt-20">
                        Drag components here to start building your site!
                      </h1>
                    ) : (
                      components.map(renderComponent)
                    )}

                    {activeComponent &&
                      !isDragging &&
                      (activeComponent.type !== "navBar" ||
                        pages.length === 1) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeComponent(activeComponent.id);
                          }}
                          style={{
                            position: "absolute",
                            top:
                              activeComponent.position.y < 40
                                ? `${activeComponent.position.y + activeComponent.size.height + 15}px`
                                : `${activeComponent.position.y - 25}px`,
                            left:
                              activeComponent.type === "navBar" ||
                              activeComponent.type === "projectCard"
                                ? "50px"
                                : `${activeComponent.position.x + activeComponent.size.width - 20}px`,
                            zIndex: 10,
                            pointerEvents: "auto",
                            transition:
                              "opacity 0.2s ease-in-out, transform 0.1s",
                          }}
                          className="w-6 h-6 bg-red-500 text-white rounded shadow-md hover:bg-red-600 hover:scale-110 flex items-center justify-center z-50"
                        >
                          <XIcon size={32} />
                        </button>
                      )}
                  </EditorDropZone>
                </div>
              </div>
              {showScrollTop && (
                <button
                  onClick={() =>
                    scrollContainerRef.current?.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="fixed bottom-20 right-5 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
                >
                  <ArrowUpIcon size={24} />
                </button>
              )}
              <DragOverlay>
                {renderOverlayContent(activeComponent?.type || null)}
              </DragOverlay>
            </DndContext>
          </EditorContextProvider>
        </PagesContextProvider>
      )}
    </>
  );
}
