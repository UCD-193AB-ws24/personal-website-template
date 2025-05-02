/* Menu bar component for multi-page functionality */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusIcon,
  MenuIcon,
  XIcon,
  ArrowLeftToLine,
  ArrowRightToLine,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

import { toastError } from "@components/toasts/ErrorToast";
import SortablePageItem from "@components/SortablePageItem";

import type { ComponentItem } from "@customTypes/componentTypes";
import useIsMobile from "@lib/hooks/useIsMobile";

interface NavigationBarProps {
  username?: string;
  components?: ComponentItem[];
  setComponents?: React.Dispatch<React.SetStateAction<ComponentItem[]>>;
  pages?: { pageName: string; components: ComponentItem[] }[];
  setPages?: React.Dispatch<
    React.SetStateAction<{ pageName: string; components: ComponentItem[] }[]>
  >;
  activePageIndex?: number;
  setActivePageIndex?: React.Dispatch<React.SetStateAction<number | null>>;
  switchPage?: (index: number) => void;
  addPage?: () => void;
  deletePage?: (index: number) => void;
  updatePageName?: (index: number, newName: string) => void;
  isPreview?: boolean;
  isPublish?: boolean;
  isMobilePreview?: boolean;
  onMouseDown?: () => void;
  isDragOverlay?: boolean;
}

export default function NavigationBar({
  username = "",
  components = [],
  setComponents: setComponents = () => {},
  pages = [],
  setPages: setPages = () => {},
  activePageIndex,
  setActivePageIndex: setActivePageIndex = () => {},
  switchPage: switchPage = () => {},
  addPage: addPage = () => {},
  deletePage: deletePage = () => {},
  updatePageName: updatePageName = () => {},
  isPreview,
  isMobilePreview = false,
  isPublish = false,
  isDragOverlay = false,
  onMouseDown,
}: NavigationBarProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");

  const [backgroundWidth, setBackgroundWidth] = useState<number | null>(null);
  const sidePadding = 128; // 8rem

  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const maxRight = Math.max(
      ...components
        .filter((c) => c.type !== "navBar" && c.type !== "projectCard")
        .map((c) => c.position.x + c.size.width),
    );

    const totalWidth = maxRight + sidePadding * 2;
    const winWidth = window.innerWidth;

    setBackgroundWidth(totalWidth < winWidth ? winWidth : totalWidth);
  }, [components]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown?.();
  };

  const handleEditStart = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditedName(currentName);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const handleEditSubmit = (index: number) => {
    if (!editedName.trim()) {
      setEditedName(pages[index].pageName); // Revert to existing name if new name is empty string
    } else {
      const isDuplicate = pages.some(
        (page, i) => i !== index && page.pageName === editedName.trim(),
      );
      if (isDuplicate) {
        toastError("Page name must be unique!");
        return;
      }
      updatePageName(index, editedName.trim());
    }
    setEditingIndex(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Requires 10px movement before activating drag
      },
    }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id || activePageIndex === undefined) return;

    const oldIndex = pages.findIndex((page) => page.pageName === active.id);
    const newIndex = pages.findIndex((page) => page.pageName === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Create a new pages array and store the active page's components
    const updatedPages = [...pages];
    updatedPages[activePageIndex] = {
      ...updatedPages[activePageIndex],
      components: [...components], // Save current components
    };

    // Reorder pages in the new array
    const reorderedPages = arrayMove(updatedPages, oldIndex, newIndex);

    // Update state
    setPages(reorderedPages);
    setComponents(reorderedPages[newIndex]?.components || []);
    setActivePageIndex(newIndex);
  };

  if (isDragOverlay) {
    return (
      <div className="flex w-[256px] h-[48px] justify-between items-center">
        <ArrowLeftToLine size={24} color="gray" />
        <div className="bg-gray-800 min-w-[200px] min-h-[48px] flex justify-end items-center p-1">
          <MenuIcon color="white" size={32} />
        </div>
        <ArrowRightToLine size={24} color="gray" />
      </div>
    );
  }

  // Mobile nav bar (with hamburger menu)
  if ((isPublish && isMobile) || (isPreview && (isMobile || isMobilePreview))) {
    return (
      <div
        className={`bg-gray-800 text-white shadow-lg z-[100] overflow-x-hidden ${
          isPreview
            ? "fixed top-[calc(4rem+5px)] left-1/2 w-[calc(44.97vh_-_5px)] -translate-x-1/2"
            : "fixed top-0 left-0 w-screen"
        }`}
      >
        <div className="flex items-center justify-end px-4 h-12">
          <button
            className="text-white focus:outline-none "
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon size={32} /> : <MenuIcon size={32} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="flex flex-col items-center px-4 pb-2">
            {pages.map((page, index) => {
              const urlFriendlyPageName = encodeURIComponent(
                page.pageName.replace(/ /g, "-"),
              );

              const isLast = index === pages.length - 1;
              const isActive = activePageIndex === index;

              return (
                <div key={index} className="w-full">
                  {isPreview ? (
                    <div
                      onClick={() => switchPage(index)}
                      className={`w-full block cursor-pointer ${!isLast ? "border-b border-gray-700" : ""}`}
                    >
                      <div
                        className={`w-full text-center py-3 transition-all duration-200 text-lg font-medium ${
                          isActive
                            ? "text-blue-400"
                            : "text-white hover:text-blue-300 hover:bg-gray-700"
                        }`}
                      >
                        {page.pageName}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={index}
                      href={`/pages/${username}/${urlFriendlyPageName}`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`w-full block ${!isLast ? "border-b border-gray-700" : ""}`}
                    >
                      <div
                        className={`w-full text-center py-3 transition-all duration-200 text-lg font-medium ${
                          activePageIndex === index
                            ? "text-blue-400"
                            : "text-white hover:text-blue-300 hover:bg-gray-700"
                        }`}
                      >
                        {page.pageName}
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (isPublish) {
    return (
      <div className="absolute top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center px-4 shadow-lg z-[100]">
        {/*
         * Hack: If the page has a navbar, render a div with the same background color
         * behind the navbar so that the navbar appears to take up the entire screen width
         */}
        <div
          className="absolute h-12 min-w-[100vw] bg-gray-800 top-0 left-0 z-[-100]"
          style={{
            transform: "translate(-8rem, 0)",
            width: `${backgroundWidth}px`,
          }}
        ></div>
        {pages.map((page, index) => {
          const urlFriendlyPageName = encodeURIComponent(
            page.pageName.replace(/ /g, "-"),
          );
          return (
            <Link
              key={index}
              href={`/pages/${username}/${urlFriendlyPageName}`}
            >
              <button
                className={`px-4 py-2 mx-1 rounded-md transition-all duration-200 ${
                  activePageIndex === index
                    ? "bg-blue-500"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {page.pageName}
              </button>
            </Link>
          );
        })}
      </div>
    );
  } else if (isPreview) {
    return (
      <div className="absolute top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center px-4 shadow-lg z-[100]">
        {/*
         * Hack: If the page has a navbar, render a div with the same background color
         * behind the navbar so that the navbar appears to take up the entire screen width
         */}
        <div
          className="absolute h-12 min-w-[100vw] bg-gray-800 top-0 left-0 z-[-100]"
          style={{
            transform: "translate(-8rem, 0)",
            width: `${backgroundWidth}px`,
          }}
        ></div>
        {pages.map((page, index) => (
          <div key={index} className="flex items-center space-x-2">
            <button
              onClick={() => switchPage(index)}
              className={`px-4 py-2 mx-1 rounded-md transition-all duration-200 ${activePageIndex === index ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              {page.pageName}
            </button>
          </div>
        ))}
      </div>
    );
  }

  /* Editor Mode */
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
    >
      <div
        className="absolute top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center px-4 shadow-lg"
        onMouseDown={handleMouseDown}
      >
        <SortableContext items={pages.map((page) => page.pageName)}>
          {pages.map((page, index) => (
            <SortablePageItem
              key={page.pageName}
              page={page}
              index={index}
              activePageIndex={activePageIndex}
              switchPage={switchPage}
              handleEditStart={handleEditStart}
              editingIndex={editingIndex}
              editedName={editedName}
              handleEditChange={handleEditChange}
              handleEditSubmit={handleEditSubmit}
              deletePage={deletePage}
              pages={pages}
            />
          ))}
        </SortableContext>
        <button
          onClick={addPage}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded flex items-center hover:bg-green-700"
        >
          <PlusIcon size={16} className="mr-1" /> Add Page
        </button>
      </div>
    </DndContext>
  );
}
