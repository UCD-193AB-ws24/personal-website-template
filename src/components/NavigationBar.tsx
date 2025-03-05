/* Menu bar component for multi-page functionality */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { toast, Flip } from 'react-toastify';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { restrictToHorizontalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

import ErrorToast from '@components/ErrorToast';
import SortablePageItem from '@components/SortablePageItem';

import type { ComponentItem } from '@customTypes/componentTypes';

interface NavigationBarProps {
  username?: string;
  components?: ComponentItem[],
  setComponents?: React.Dispatch<React.SetStateAction<ComponentItem[]>>;
  pages?: { pageName: string, components: ComponentItem[] }[];
  setPages?: React.Dispatch<React.SetStateAction<{ pageName: string, components: ComponentItem[] }[]>>;
  activePageIndex?: number;
  setActivePageIndex?: React.Dispatch<React.SetStateAction<number | null>>;
  switchPage?: (index: number) => void;
  addPage?: () => void;
  deletePage?: (index: number) => void;
  updatePageName?: (index: number, newName: string) => void;
  isPreview?: boolean;
  isPublish?: boolean;
  onMouseDown?: () => void;
}

export default function NavigationBar({
  username = "",
  components = [],
  setComponents: setComponents = () => { },
  pages = [],
  setPages: setPages = () => { },
  activePageIndex,
  setActivePageIndex: setActivePageIndex = () => { },
  switchPage: switchPage = () => { },
  addPage: addPage = () => { },
  deletePage: deletePage = () => { },
  updatePageName: updatePageName = () => { },
  isPreview,
  isPublish = false,
  onMouseDown,
}: NavigationBarProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");

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
      const isDuplicate = pages.some((page, i) => i !== index && page.pageName === editedName.trim());
      if (isDuplicate) {
        toast((props) => <ErrorToast {...props} message="Page name must be unique!" />, {
          position: "top-right",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "light",
          transition: Flip,
        });
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

    const oldIndex = pages.findIndex(page => page.pageName === active.id);
    const newIndex = pages.findIndex(page => page.pageName === over.id);
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

  if (isPublish) {
    return (
      <div className="absolute top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center px-4 shadow-lg">
        {pages.map((page, index) => {
          const urlFriendlyPageName = encodeURIComponent(page.pageName.replace(/ /g, "-"));
          return (
            <Link key={index} href={`/pages/${username}/${urlFriendlyPageName}`}>
              <button
                className={`px-4 py-2 mx-1 rounded-md transition-all duration-200 ${activePageIndex === index ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
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
      <div
        className="absolute top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center px-4 shadow-lg"
      >
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
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors} modifiers={[restrictToHorizontalAxis, restrictToParentElement]}>
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
