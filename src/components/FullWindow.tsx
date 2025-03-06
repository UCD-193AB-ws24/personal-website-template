"use client";

import { ReactNode, useState, useEffect } from "react";

export default function FullWindow({ children }: { children: ReactNode }) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    setHeight(document.body.scrollHeight);
  }, []);

  return (
    <div
      className="relative bg-white w-[calc(100%-16rem)]"
      style={{ minHeight: height }}
    >
      {children}
    </div>
  );
}
