/* Menu bar component for multi-page functionality */

"use client";

import React, { useState } from "react";
import { XIcon, PlusIcon, PencilIcon } from "lucide-react";

interface NavigationBarProps {
  pages?: { pageName: string }[];
  activePageIndex?: number;
  switchPage?: (index: number) => void;
  addPage?: () => void;
  deletePage?: (index: number) => void;
  updatePageName?: (index: number, newName: string) => void;
  isPreview?: boolean;
  onMouseDown?: () => void;
}

export default function NavigationBar({
  pages = [],
  activePageIndex,
  switchPage: switchPage = () => { },
  addPage: addPage = () => { },
  deletePage: deletePage = () => { },
  updatePageName: updatePageName = () => { },
  isPreview,
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
        alert("Page name must be unique!");
        return;
      }
      updatePageName(index, editedName.trim());
    }
    setEditingIndex(null);
  };

  return (
    <div
      className="absolute top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center px-4 shadow-lg"
      onMouseDown={!isPreview ? handleMouseDown : undefined}
    >
      {pages.map((page, index) => (
        <div key={index} className="flex items-center space-x-2">
          {editingIndex === index ? (
            <input
              type="text"
              value={editedName}
              onChange={handleEditChange}
              onBlur={() => handleEditSubmit(index)}
              onKeyDown={(e) => e.key === "Enter" && handleEditSubmit(index)}
              autoFocus
              className="px-2 py-1 bg-gray-600 text-white rounded-md outline-none border border-gray-400"
            />
          ) : (
            <button
              onClick={() => switchPage(index)}
              className={`px-4 py-2 mx-1 rounded-md transition-all duration-200 ${activePageIndex === index ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              {page.pageName}
            </button>
          )}

          {!isPreview && activePageIndex === index && (
            <>
              {/* Edit Button */}
              <button
                onClick={() => handleEditStart(index, page.pageName)}
                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-400"
              >
                <PencilIcon size={14} />
              </button>

              {/* Delete Button (Only if more than one page exists) */}
              {pages.length > 1 && (
                <button
                  onClick={() => deletePage(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                >
                  <XIcon size={16} />
                </button>
              )}
            </>
          )}
        </div>
      ))}

      {!isPreview && (
        <button
          onClick={addPage}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded flex items-center hover:bg-green-700"
        >
          <PlusIcon size={16} className="mr-1" /> Add Page
        </button>
      )}
    </div>
  );
}
