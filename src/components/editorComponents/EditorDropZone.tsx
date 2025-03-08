import { useDroppable } from "@dnd-kit/core";
import { forwardRef, Ref } from "react";

function EditorDropZone(
  {
    children,
    onClick,
    style,
    className = "",
  }: {
    children: React.ReactNode;
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    style?: React.CSSProperties;
    className?: string;
  },
  ref: Ref<HTMLDivElement>,
) {
  const { setNodeRef, isOver } = useDroppable({ id: "editor-drop-zone" });

  return (
    <div
      ref={(node) => {
        setNodeRef(node); // Set dnd-kit ref
        if (typeof ref === "function") {
          ref(node);
        } else if (ref && node) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      onMouseDown={onClick}
      className={`overflow-hidden w-full relative transition-all duration-300 ${
        isOver ? "bg-gray-100" : "bg-white"
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default forwardRef(EditorDropZone);
