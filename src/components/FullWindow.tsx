"use client";

import { ReactNode, useState, useEffect } from "react";

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

  useEffect(() => {
    setHeight(document.body.scrollHeight);
    setWindowWidth(window.innerWidth);
  }, []);

  const sidePadding = 128; // 8rem
  const totalWidth = width + sidePadding * 2;
  const useFullWindowWidth = totalWidth < windowWidth;

  useEffect(() => {
    setHeight((prev) => Math.max(prev, lowestY + 50));
  }, [lowestY]);

  return (
    <div
      className={"relative bg-white"}
      style={{
        minHeight: height,
        width: useFullWindowWidth ? windowWidth : `${totalWidth}px`,
        minWidth: "100vw",
      }}
    >
      <div
        className="absolute"
        style={{ left: "8rem", top: "0", right: "8rem" }}
      >
        {children}
      </div>
    </div>
  );
}
