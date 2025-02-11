import { useDroppable } from '@dnd-kit/core';

export default function EditorDropZone({ children, onClick }: { children: React.ReactNode, onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'editor-drop-zone'
  });

  return (
    <div
      ref={setNodeRef}
      onMouseDown={onClick}
      className={`overflow-hidden flex-1 p-4 relative ${isOver ? 'bg-white' : 'bg-white'}`}
    >
      {children}
    </div>
  );
};

