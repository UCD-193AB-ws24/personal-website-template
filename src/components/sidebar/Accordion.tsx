import { ReactNode } from "react";

export default function Accordion({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}
