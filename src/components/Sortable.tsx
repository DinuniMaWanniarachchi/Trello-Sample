// components/Sortable.tsx
'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Item {
  id: string;
  content: string;
}

interface SortableProps {
  items: Item[];
  onChange: (items: Item[]) => void;
}

export default function Sortable({ items, onChange }: SortableProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const updated = Array.from(items);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    onChange(updated);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <div
            className="space-y-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {items.map((item, index) => (
              <Draggable draggableId={item.id} index={index} key={item.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-4 bg-white dark:bg-gray-800 border rounded shadow text-black dark:text-white"
                  >
                    {item.content}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
