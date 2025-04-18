"use client";

import { ReactNode, useState, useEffect, useMemo } from "react";

import useIsMobile from "@lib/hooks/useIsMobile";

export default function FullWindow({
  children,
  width,
  lowestY,
  isMobilePreview = false,
}: {
  children: ReactNode;
  width: number;
  lowestY: number;
  isMobilePreview?: boolean;
}) {
  const [height, setHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobilePreview) {
      setHeight(lowestY);
      setWindowWidth(width);
    } else {
      setHeight(document.body.scrollHeight);
      setWindowWidth(window.innerWidth);
    }
  }, [isMobilePreview, lowestY, width]);

  useEffect(() => {
    if (!isMobilePreview) {
      setHeight((prev) => Math.max(prev, lowestY + 50));
    }
  }, [lowestY, isMobilePreview]);

  const sidePadding = (isMobile || isMobilePreview) ? 16 : 128; // 1rem on mobile, 8rem on desktop
  const totalWidth = width + sidePadding * 2;
  const useFullWindowWidth = totalWidth < windowWidth;

  if (isMobilePreview) {
    // Mobile preview mode
    return (
      <div
        className="bg-white border-[5px] border-black rounded-md shadow-lg mx-auto mt-16"
        style={{
          width: "375px",
          height: "667px",
          overflow: "auto",
          position: "relative",
        }}
      >
        <div
          className="absolute"
          style={{
            left: "1rem",
            right: "1rem",
            top: 0,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Desktop mode
  return (
    <div
      className="flex flex-row relative bg-white"
      style={{
        minWidth: `${useFullWindowWidth ? windowWidth : totalWidth}px`,
        minHeight: height,
        overflow: undefined,
      }}
    >
      <div
        className="absolute"
        style={{
          left: "8rem",
          right: "8rem",
          top: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
