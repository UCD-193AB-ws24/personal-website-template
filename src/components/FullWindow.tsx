"use client";

import { ReactNode, useState, useEffect } from "react";

import useIsMobile from "@lib/hooks/useIsMobile";

export default function FullWindow({
  children,
  width,
  lowestY,
}: {
  children: ReactNode;
  width: number;
  lowestY: number;
}) {
  const [height, setHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    setHeight(document.body.scrollHeight);
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    setHeight((prev) => Math.max(prev, lowestY + 50));
  }, [lowestY]);

  const sidePadding = isMobile ? 16 : 128; // 1rem on mobile, 8rem on desktop
  const totalWidth = width + sidePadding * 2;
  const useFullWindowWidth = totalWidth < windowWidth;

  return (
    <div
      className={"relative bg-white"}
      style={{
        minWidth: useFullWindowWidth ? windowWidth : `${totalWidth}px`,
        minHeight: height,
      }}
    >
      <div
        className="absolute"
        style={{
          left: isMobile ? "1rem" : "8rem",
          top: 0,
          right: isMobile ? "1rem" : "8rem",
        }}
      >
        {children}
      </div>
    </div>
  );
}
