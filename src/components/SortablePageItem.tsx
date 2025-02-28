"use client";

import React from "react";
import { XIcon, PencilIcon } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";

interface SortablePageItemProps {
  page: { pageName: string };
  index: number;
  activePageIndex?: number;
  switchPage: (index: number) => void;
  handleEditStart: (index: number, currentName: string) => void;
  editingIndex: number | null;
  editedName: string;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEditSubmit: (index: number) => void;
  deletePage: (index: number) => void;
  pages: { pageName: string }[];
}

export default function SortablePageItem({
  page,
  index,
  activePageIndex,
  switchPage,
  handleEditStart,
  editingIndex,
  editedName,
  handleEditChange,
  handleEditSubmit,
  deletePage,
  pages
}: SortablePageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.pageName });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    width: "auto",
    minWidth: "80px",
    zIndex: 50,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center space-x-2 cursor-grab">
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

      {/* Edit and Delete Buttons */}
      {activePageIndex === index && (
        <>
          <button
            onClick={() => handleEditStart(index, page.pageName)}
            className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-400"
          >
            <PencilIcon size={14} />
          </button>

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
  );
}
