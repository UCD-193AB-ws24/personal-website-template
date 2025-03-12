import React from "react";

interface ActiveOutlineContainerProps {
  isActive: boolean;
  children: React.ReactNode;
}

export default function ActiveOutlineContainer({
  isActive = true,
  children,
}: ActiveOutlineContainerProps) {
  return (
    <div
      className={`w-full h-full transition-all duration-150 ease-in-out ${
        isActive
          ? "outline outline-2 outline-blue-500 bg-gray-100 shadow-md"
          : "outline outline-2 outline-transparent bg-transparent hover:outline hover:outline-2 hover:outline-gray-300"
      }`}
    >
      {children}
    </div>
  );
}
