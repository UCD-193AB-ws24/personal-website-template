import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-3 text-left font-medium"
      >
        <span>{title}</span>
        {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}
