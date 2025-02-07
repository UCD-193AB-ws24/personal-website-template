import { useDroppable } from '@dnd-kit/core';

export default function EditorDropZone({children} : {children : React.ReactNode}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'editor-drop-zone'
  });

  return (
    <div
      ref={setNodeRef}
      className={`overflow-hidden flex-1 p-4 relative ${isOver ? 'bg-gray-100' : 'bg-white'}`}
    >
      {children}
    </div>
  );
};

