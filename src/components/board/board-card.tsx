"use client";

import React, { useState, useEffect, useRef } from 'react';

import { Card as UICard, CardContent } from '@/components/ui/card';
import { Card, badgeColors, PriorityType } from '@/types/kanban';
import { formatDueDate, getDueDateColor } from '@/utils/dateUtils';
import { DatePicker, Popover, Button } from 'antd';
import { CalendarOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { DatePickerProps } from 'antd/es/date-picker';
import { useAppDispatch } from '@/lib/hooks';
import { updateCard } from '@/lib/features/boardSlice';
import { PREDEFINED_LABELS } from '@/types/taskLabels';
import { getLabelByType } from '@/utils/labelUtils';

const priorityColors: Record<PriorityType, string> = {
  none: 'bg-gray-400',
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

const priorityNames: Record<PriorityType, string> = {
  none: 'No Priority',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

interface BoardCardProps {
  card: Card;
  listId: string; // Added listId for Redux updates
  isDragging?: boolean;
  onClick: () => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ 
  card, 
  listId,
  isDragging = false, 
  onClick
}) => {
  const dispatch = useAppDispatch();
  const mountedRef = useRef(true);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    card?.dueDate ? dayjs(card.dueDate) : null
  );

  // Guard: if props.card is temporarily undefined during drag overlays, skip render
  if (!card) {
    return null;
  }

  // Update selectedDate when card.dueDate changes
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setSelectedDate(card?.dueDate ? dayjs(card.dueDate) : null);
  }, [card?.dueDate]);

  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDatePickerVisible(true);
  };

  const handleDateChange: DatePickerProps['onChange'] = (date) => {
    if (date) {
      const formattedDate = date.format('YYYY-MM-DD');
      dispatch(updateCard({ 
        listId, 
        cardId: card.id, 
        updates: { dueDate: formattedDate } 
      }));
      if (mountedRef.current) setSelectedDate(date);
    }
    if (mountedRef.current) setIsDatePickerVisible(false);
  };

  const handleRemoveDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use Redux to remove the due date
    dispatch(updateCard({ 
      listId, 
      cardId: card.id, 
      updates: { dueDate: undefined } 
    }));
    if (mountedRef.current) setSelectedDate(null);
  };

  const handleCardClick = () => {
    if (!isDatePickerVisible) {
      onClick();
    }
  };

  const handlePopoverVisibleChange = (visible: boolean) => {
    if (mountedRef.current) setIsDatePickerVisible(visible);
  };

  const handleAddAssignee = (e: React.MouseEvent) => {
    e.stopPropagation();
    // For now, just add a sample assignee - you can enhance this later
    const sampleAssignees = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown'];
    const randomAssignee = sampleAssignees[Math.floor(Math.random() * sampleAssignees.length)];
    
    dispatch(updateCard({ 
      listId, 
      cardId: card.id, 
      updates: { assignee: randomAssignee } 
    }));
  };

  // DatePicker content for the popover
  const datePickerContent = (
    <div className="p-2">
      <div className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
        <CalendarOutlined className="mr-2" />
        Set Due Date
      </div>
      <DatePicker
        value={selectedDate}
        onChange={handleDateChange}
        disabledDate={(current) => current && current < dayjs().startOf('day')}
        placeholder="Select date"
        style={{ width: '100%' }}
        // Let Popover control the mounting; avoid forcing DatePicker to be always open
      />
      <div className="mt-3 flex justify-end">
        <Button 
          size="small" 
          onClick={() => setIsDatePickerVisible(false)}
          type="text"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <UICard 
      className={`cursor-grab hover:shadow-lg transition-all duration-200
                  bg-card border-border hover:bg-accent ${
                    isDragging ? 'opacity-50' : ''
                  }`}
      onClick={handleCardClick}
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

        {/* Task Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map((labelType) => {
              const labelDef = getLabelByType(labelType);
              return labelDef ? (
                <span
                  key={labelType}
                  className="inline-block px-2 py-0.5 rounded-md text-xs font-medium text-white"
                  style={{ backgroundColor: labelDef.color }}
                >
                  {labelDef.name}
                </span>
              ) : null;
            })}
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          {card.priority && card.priority !== 'none' && (
            <div
              className={`w-2 h-2 rounded-full ${priorityColors[card.priority]} flex-shrink-0`}
              title={`Priority: ${priorityNames[card.priority]}`}
            />
          )}
          <h4 className="text-card-foreground font-medium text-sm leading-tight">
            {card.title}
          </h4>
        </div>

        {/* Card Description */}
        {card.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {card.description}
          </p>
        )}
        
        {/* Due Date Display */}
        {card.dueDate && (
          <div className="mb-2 flex items-center justify-between">
            <span className={`text-xs ${getDueDateColor(card.dueDate)}`}>
              📅 Due {formatDueDate(card.dueDate)}
            </span>
            <button
              onClick={handleRemoveDate}
              className="text-xs text-gray-400 hover:text-red-500 ml-2 transition-colors"
              title="Remove due date"
            >
              <CloseOutlined style={{ fontSize: '10px' }} />
            </button>
          </div>
        )}

        {/* Assignee Display */}
        {card.assignee && (
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">
              👤 {card.assignee}
            </span>
          </div>
        )}

        {/* Card Meta Info */}
        {(card.attachments || card.comments) && (
          <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
            {card.attachments && card.attachments > 0 && (
              <span>📎 {card.attachments}</span>
            )}
            {card.comments && card.comments > 0 && (
              <span>💬 {card.comments}</span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Popover
            content={datePickerContent}
            title={null}
            trigger="click"
            // Let Popover control visibility to avoid style registration during unmount
            onOpenChange={handlePopoverVisibleChange}
            placement="bottomLeft"
            overlayClassName="date-picker-popover"
            getPopupContainer={() => document.body}
          >
            <div 
              className="task-due-date cursor-pointer hover:bg-accent rounded-md px-1 py-0.5 transition-colors flex items-center"
              title={card.dueDate ? "Click to change date" : "Click to set due date"}
              onClick={handleDateClick}
              style={{
                fontSize: "10px",
                color: "rgb(136, 136, 136)",
                marginRight: "8px",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <CalendarOutlined style={{ fontSize: '10px', marginRight: '4px' }} />
              {card.dueDate ? "Change date" : "No due date"}
            </div>
          </Popover>
          
          <button
            onClick={handleAddAssignee}
            className="w-5 h-5 rounded-md border border-dashed flex items-center justify-center
            transition-colors duration-200
            border-border hover:border-muted-foreground hover:bg-accent text-muted-foreground"
            title={card.assignee ? "Change assignee" : "Add assignee"}
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
  );
};