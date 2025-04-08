"use client";

import { ReactNode, useState, useEffect } from "react";

export default function FullWindow({
  children,
  width,
}: {
  children: ReactNode;
  width: number;
}) {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  const sidePadding = 128; // 8rem
  const totalWidth = width + sidePadding * 2;
  const useFullWindowWidth = totalWidth < windowWidth;

  return (
    <div
      className={"relative bg-white"}
      style={{
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
