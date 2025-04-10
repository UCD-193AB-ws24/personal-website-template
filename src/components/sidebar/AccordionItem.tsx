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
    <div className="bg-white">
      <div className="border border-gray-300 hover:bg-gray-50">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center p-3 text-left font-medium"
        >
          <span>{title}</span>
          {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        <div className="p-3 pb-3 bg-blue-50">{children}</div>
      </div>
    </div>
  );
}
