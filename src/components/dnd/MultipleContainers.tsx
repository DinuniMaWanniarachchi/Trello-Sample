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

type ItemId = string;

type ContainersMap = Record<string, ItemId[]>;

interface MultipleContainersProps {
  containers?: ContainersMap;
  onMoveItem?: (itemId: string, fromListId: string, toListId: string, fromIndex: number, toIndex: number) => void;
  onReorderLists?: (fromId: string, toId: string) => void;
  renderItem?: (id: ItemId, listId: string) => React.ReactNode;
  renderListHeader?: (listId: string, count: number, dragHandle?: ReturnType<typeof useSortable> & { attributes: any; listeners: any }) => React.ReactNode;
  renderListFooter?: (listId: string) => React.ReactNode;
  getHeaderClassName?: (listId: string) => string | undefined;
  renderOverlayItem?: (id: ItemId, listId: string) => React.ReactNode;
  containerStyle?: React.CSSProperties;
  itemCount?: number;
  scrollable?: boolean;
}

function SortableItem({ id, listId, children }: { id: ItemId; listId: string; children?: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, data: { type: "card", listId } });

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
      {children ?? id}
    </div>
  );
}

function renderDefaultHeader() {
  return <span>List</span>;
}

function SortableListContainer({
  id,
  items,
  children,
  headerRenderer,
  scrollable,
  containerStyle,
  headerClassName,
}: {
  id: string;
  items: ItemId[];
  children?: React.ReactNode;
  headerRenderer?: (listId: string, count: number, dragHandle: { attributes: any; listeners: any }) => React.ReactNode;
  scrollable?: boolean;
  containerStyle?: React.CSSProperties;
  headerClassName?: string;
}) {
  const { setNodeRef, transform, transition, attributes, listeners } = useSortable({ id, data: { type: "list" } });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0">
      <div className="flex-shrink-0 w-68 h-[500px] rounded-md border border-border bg-card overflow-hidden flex flex-col" style={containerStyle}>
        <div className={`px-3 py-2 text-sm font-medium border-b border-border flex items-center justify-between ${headerClassName ?? 'bg-muted/50'}`}>
          <div className="flex-1 min-w-0">{headerRenderer ? headerRenderer(id, items.length, { attributes, listeners }) : (<span>{id} ({items.length})</span>)}</div>
          {!headerRenderer ? (
            <button aria-label="Drag list" className="h-6 w-6 cursor-grab" {...(attributes as any)} {...(listeners as any)} />
          ) : null}
        </div>
        <div className={`flex-1 ${scrollable ? "overflow-y-auto" : ""} p-3 space-y-2`}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {children}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

export default function MultipleContainers({
  containers: containersProp,
  onMoveItem,
  onReorderLists,
  renderItem,
  renderListHeader,
  renderListFooter,
  getHeaderClassName,
  renderOverlayItem,
  containerStyle,
  itemCount = 15,
  scrollable = true,
}: MultipleContainersProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const [activeId, setActiveId] = React.useState<ItemId | null>(null);
  const [activeType, setActiveType] = React.useState<"list" | "card" | undefined>(undefined);
  const [activeListId, setActiveListId] = React.useState<string | undefined>(undefined);
  const [containers, setContainers] = React.useState<ContainersMap>(
    containersProp ?? {
      ColumnA: Array.from({ length: Math.max(4, Math.ceil(itemCount / 2)) }, (_, i) => `A${i + 1}`),
      ColumnB: Array.from({ length: Math.ceil(itemCount / 2) }, (_, i) => `B${i + 1}`),
    }
  );

  // Keep internal state in sync if a controlled containers prop is passed
  React.useEffect(() => {
    if (containersProp) setContainers(containersProp);
  }, [containersProp]);

  const findContainerOf = (id: ItemId): string | null => {
    for (const key of Object.keys(containers)) {
      if (containers[key].includes(id)) return key;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    const t = event.active.data?.current?.type as "list" | "card" | undefined;
    setActiveType(t);
    const lId = (event.active.data?.current as any)?.listId as string | undefined;
    setActiveListId(lId ?? (t === 'card' ? findContainerOf(String(event.active.id)) ?? undefined : undefined));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      setActiveType(undefined);
      setActiveListId(undefined);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) {
      setActiveId(null);
      return;
    }

    const activeType = active.data?.current?.type as "list" | undefined;

    // Reorder lists (containers)
    if (activeType === "list") {
      const listIds = Object.keys(containers);
      const from = listIds.indexOf(activeId);
      const to = listIds.indexOf(overId);
      if (from !== -1 && to !== -1 && from !== to) {
        const newOrder = arrayMove(listIds, from, to);
        const reordered: ContainersMap = {};
        for (const id of newOrder) reordered[id] = containers[id];
        if (!containersProp) setContainers(reordered);
        onReorderLists?.(activeId, overId);
      }
      setActiveId(null);
      return;
    }

    // Move/reorder items
    const listIdsLocal = Object.keys(containers);
    const source = findContainerOf(activeId);
    let dest = findContainerOf(overId);
    // If hovered over a list container (not a specific item), allow dropping at end
    const overIsList = listIdsLocal.includes(overId);
    if (!dest && overIsList) {
      dest = overId;
    }
    if (!source || !dest) {
      setActiveId(null);
      return;
    }

    if (source === dest) {
      const fromIndex = containers[source].indexOf(activeId);
      const toIndex = overIsList ? containers[dest].length : containers[dest].indexOf(overId);
      if (fromIndex === -1 || toIndex === -1) {
        setActiveId(null);
        return;
      }
      if (!containersProp) {
        setContainers((prev) => ({
          ...prev,
          [source]: arrayMove(prev[source], fromIndex, toIndex),
        }));
      }
      onMoveItem?.(activeId, source, dest, fromIndex, toIndex);
    } else {
      const fromIndex = containers[source].indexOf(activeId);
      const toIndex = overIsList ? -1 : containers[dest].indexOf(overId);
      if (!containersProp) {
        setContainers((prev) => {
          const sourceItems = [...prev[source]];
          const destItems = [...prev[dest]];
          const [moved] = sourceItems.splice(fromIndex, 1);
          const insertAt = toIndex === -1 ? destItems.length : toIndex;
          destItems.splice(insertAt, 0, moved);
          return { ...prev, [source]: sourceItems, [dest]: destItems };
        });
      }
      onMoveItem?.(activeId, source, dest, fromIndex, toIndex === -1 ? containers[dest].length : toIndex);
    }

    setActiveId(null);
    setActiveType(undefined);
    setActiveListId(undefined);
  };

  const listIds = Object.keys(containers);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={listIds}>
        <div className="flex gap-3 md:gap-4 overflow-x-auto">
          {listIds.map((id) => {
            const items = containers[id];
            return (
              <SortableListContainer
                key={id}
                id={id}
                items={items}
                headerRenderer={renderListHeader ? (listId, count, dragHandle) => renderListHeader(listId, count, dragHandle as any) : undefined}
                scrollable={scrollable}
                containerStyle={containerStyle}
                headerClassName={getHeaderClassName ? getHeaderClassName(id) : undefined}
              >
                {items.map((itemId) => (
                  <div key={itemId}>
                    <SortableItem id={itemId} listId={id}>
                      {renderItem ? renderItem(itemId, id) : undefined}
                    </SortableItem>
                  </div>
                ))}
                {renderListFooter ? (
                  <div>
                    {renderListFooter(id)}
                  </div>
                ) : null}
              </SortableListContainer>
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId && activeType === 'card' && activeListId
          ? (renderOverlayItem
              ? renderOverlayItem(activeId, activeListId)
              : (renderItem ? renderItem(activeId, activeListId) : null))
          : null}
      </DragOverlay>
    </DndContext>
  );
}
