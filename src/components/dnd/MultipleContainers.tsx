"use client";

import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Basic preset: multiple containers with sortable items and cross-container movement
// Usage: () => <MultipleContainers />

type ItemId = string;

function SortableItem({ id }: { id: ItemId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-md border border-border bg-card p-2 text-sm"
    >
      {id}
    </div>
  );
}

function Container({
  id,
  items,
  children,
}: {
  id: string;
  items: ItemId[];
  children?: React.ReactNode;
}) {
  return (
    <div className="flex-shrink-0 w-68 h-[500px] rounded-md border border-border bg-card overflow-hidden flex flex-col">
      <div className="px-3 py-2 text-sm font-medium bg-muted/50 border-b border-border">
        {id} ({items.length})
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
}

export default function MultipleContainers() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const [activeId, setActiveId] = React.useState<ItemId | null>(null);
  const [containers, setContainers] = React.useState<Record<string, ItemId[]>>({
    ColumnA: ["A1", "A2", "A3", "A4"],
    ColumnB: ["B1", "B2", "B3"],
  });

  const allItems = React.useMemo(() => Object.values(containers).flat(), [containers]);

  const findContainerOf = (id: ItemId): string | null => {
    for (const key of Object.keys(containers)) {
      if (containers[key].includes(id)) return key;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(String(active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) {
      setActiveId(null);
      return;
    }

    const source = findContainerOf(activeId);
    const dest = findContainerOf(overId);

    if (!source || !dest) {
      setActiveId(null);
      return;
    }

    if (source === dest) {
      // Reorder within same container
      const idxFrom = containers[source].indexOf(activeId);
      const idxTo = containers[dest].indexOf(overId);
      if (idxFrom === -1 || idxTo === -1) {
        setActiveId(null);
        return;
        }
      setContainers((prev) => ({
        ...prev,
        [source]: arrayMove(prev[source], idxFrom, idxTo),
      }));
    } else {
      // Move across containers
      const fromIndex = containers[source].indexOf(activeId);
      const toIndex = containers[dest].indexOf(overId);
      setContainers((prev) => {
        const sourceItems = [...prev[source]];
        const destItems = [...prev[dest]];
        const [moved] = sourceItems.splice(fromIndex, 1);
        const insertAt = toIndex === -1 ? destItems.length : toIndex;
        destItems.splice(insertAt, 0, moved);
        return { ...prev, [source]: sourceItems, [dest]: destItems };
      });
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 md:gap-4 overflow-x-auto">
        {Object.entries(containers).map(([id, items]) => (
          <Container key={id} id={id} items={items}>
            {items.map((itemId) => (
              <SortableItem key={itemId} id={itemId} />
            ))}
          </Container>
        ))}
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="rounded-md border border-border bg-card p-2 text-sm opacity-90">
            {activeId}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
