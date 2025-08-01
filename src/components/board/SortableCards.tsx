// components/board/SortableCard.tsx
"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Card, badgeColors } from '@/types/kanban';
import { formatDueDate, getDueDateColor } from '@/utils/dateUtils';

interface SortableCardProps {
  card: Card;
  listId: string;
  index: number;
  onClick: () => void;
}

export const SortableCard: React.FC<SortableCardProps> = ({ 
  card, 
  listId, 
  index, 
  onClick 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      card,
      listId,
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <UICard 
        className={`cursor-move hover:shadow-lg transition-all duration-200
                    bg-card border-border hover:bg-accent ${
                      isDragging ? 'opacity-50' : ''
                    }`}
        onClick={onClick}
      >
        <CardContent className="px-3 py-2">
          {/* Card Status Badges */}
          {card.statusBadges && card.statusBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.statusBadges.map((badge) => (
                <span 
                  key={badge.id}
                  className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${badgeColors[badge.color]}`}
                >
                  {badge.text}
                </span>
              ))}
            </div>
          )}
          
          <h4 className="text-card-foreground font-medium text-sm leading-tight mb-2">
            {card.title}
          </h4>
          
          {/* Due Date Display */}
          {card.dueDate && (
            <div className="mb-2">
              <span className={`text-xs ${getDueDateColor(card.dueDate)}`}>
                📅 Due {formatDueDate(card.dueDate)}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div 
              className="task-due-date cursor-pointer hover:bg-accent rounded px-1 py-0.5 transition-colors"
              title="Click to change date"
              style={{
                fontSize: "10px",
                color: "rgb(136, 136, 136)",
                marginRight: "8px",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              No due date
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                console.log("Add assignee clicked");
              }}
              className="w-5 h-5 rounded-full border border-dashed flex items-center justify-center
              transition-colors duration-200
              border-border hover:border-muted-foreground hover:bg-accent text-muted-foreground"
              title="Add assignee"
            >
              <span role="img" aria-label="plus" className="anticon anticon-plus text-xs">
                <svg viewBox="64 64 896 896" focusable="false" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                  <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
                  <path d="M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8z"></path>
                </svg>
              </span>
            </button>
          </div>
        </CardContent>
      </UICard>
    </div>
  );
};