/* Menu bar component for multi-page functionality */ 

"use client";

import React, { useState } from "react";
import Link from "next/link";


interface NavigationBarProps {
  content?: any;
  isActive?: boolean;
  onMouseDown?: () => void;
  isPreview?: boolean;
}


export default function NavigationBar({content = [], isActive = true, onMouseDown: onMouseDown = () => {}, isPreview = false}: NavigationBarProps) {
  const [buttons, setButtons] = useState(["Home", "About", "Contact"]);

  const handleButtonClick = (index: number, newName: string) => {
    const updatedButtons = [...buttons];
    updatedButtons[index] = newName;
    setButtons(updatedButtons);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const addNewButton = () => {
    setButtons([...buttons, "New Page"]);
  };

  return isPreview ? (
    <div className="absolute top-0 left-0 w-full bg-gray-800 text-white shadow-md py-3 px-6 z-50">
    <div className="flex justify-between items-center">
      <div className="flex space-x-4">
        {buttons.map((btn, index) => (
          <div
            key={index}
            className="bg-gray-700 text-white px-4 py-2 rounded-md border-none outline-none focus:ring-2 focus:ring-blue-400"
          >
            {btn}
          </div>
        ))}
      </div>
    </div>
    </div>
    ) : (
    <div className={`absolute top-0 left-0 w-full bg-gray-800 text-white shadow-md py-3 px-6 z-10 ${isActive
          ? 'border-blue-500 bg-gray-100 shadow-md outline-none'
          : 'border-transparent bg-transparent outline-none hover:outline-2 hover:outline-gray-300'}`} onMouseDown={handleMouseDown}>
      <div className="flex justify-between items-center">
        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          {buttons.map((btn, index) => (
            <input
              key={index}
              type="text"
              className="bg-gray-700 text-white px-4 py-2 rounded-md border-none outline-none focus:ring-2 focus:ring-blue-400"
              value={btn}
              onChange={(e) => handleButtonClick(index, e.target.value)}
            />
          ))}
        </div>

        {/* Add New Button */}
        <button
          onClick={addNewButton}
          className="px-4 py-2 bg-green-500 hover:bg-green-400 rounded-md text-white transition"
        >
          + Add Page
        </button>
      </div>
    </div>
  );
}
