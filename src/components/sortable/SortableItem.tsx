"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableItemProps {
  id: string;
  title: string;
  description: string;
  onClick: () => void;
  useDragOverlay?: boolean;
}

export default function SortableItem({
  id,
  title,
  description,
  onClick,
  useDragOverlay = false,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: useDragOverlay ? 1 : isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("mb-2 transition-all duration-200 ease-in-out")}
    >
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md",
          isDragging && !useDragOverlay && "border-dashed border-2 border-muted"
        )}
        onClick={onClick}
      >
        <CardContent className="p-3 flex justify-between items-center">
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            variant="ghost"
            className="hover:cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
