import { ReactNode } from "react";
import { useDraggable } from '@dnd-kit/core';

interface SidebarItemProps {
  name: string;
  description: string;
  icon: ReactNode;
  type: string;
}

export default function SidebarItem({ name, description, icon, type }: SidebarItemProps) {
  const uniqueId = `${type}-${Date.now()}`;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: uniqueId,
    data: { type },
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex items-start p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-200"
    >
      <div className="mr-3 text-blue-500">{icon}</div>
      <div>
        <h3 className="font-semibold text-sm">{name}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}

