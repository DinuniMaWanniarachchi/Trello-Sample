"use client";

import React, { useState, useEffect } from 'react';
// Import only the Ant Design components and styles you need
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Card, badgeColors } from '@/types/kanban';
import { formatDueDate, getDueDateColor } from '@/utils/dateUtils';
import { DatePicker, Popover, Button } from 'antd';
import { CalendarOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { DatePickerProps } from 'antd/es/date-picker';

interface BoardCardProps {
  card: Card;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
  onUpdateCard?: (cardId: string, updates: Partial<Card>) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ 
  card, 
  isDragging = false, 
  onDragStart, 
  onClick,
  onUpdateCard
}) => {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    card.dueDate ? dayjs(card.dueDate) : null
  );

  // Update selectedDate when card.dueDate changes
  useEffect(() => {
    setSelectedDate(card.dueDate ? dayjs(card.dueDate) : null);
  }, [card.dueDate]);

  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDatePickerVisible(true);
  };

  const handleDateChange: DatePickerProps['onChange'] = (date) => {
    if (date && onUpdateCard) {
      const formattedDate = date.format('YYYY-MM-DD');
      onUpdateCard(card.id, { dueDate: formattedDate });
      setSelectedDate(date);
    }
    setIsDatePickerVisible(false);
  };

  const handleRemoveDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateCard) {
      onUpdateCard(card.id, { dueDate: undefined });
      setSelectedDate(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCardClick = (e: React.MouseEvent) => {
    if (!isDatePickerVisible) {
      onClick();
    }
  };

  const handlePopoverVisibleChange = (visible: boolean) => {
    setIsDatePickerVisible(visible);
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
        autoFocus
        open={true}
        getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
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
      className={`cursor-move hover:shadow-lg transition-all duration-200
                  bg-card border-border hover:bg-accent ${
                    isDragging ? 'opacity-50' : ''
                  }`}
      draggable
      onDragStart={onDragStart}
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
        
        <h4 className="text-card-foreground font-medium text-sm leading-tight mb-2">
          {card.title}
        </h4>
        
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
        
        <div className="flex items-center justify-between">
          <Popover
            content={datePickerContent}
            title={null}
            trigger="click"
            open={isDatePickerVisible}
            onOpenChange={handlePopoverVisibleChange}
            placement="bottomLeft"
            overlayClassName="date-picker-popover"
          >
            <div 
              className="task-due-date cursor-pointer hover:bg-accent rounded px-1 py-0.5 transition-colors flex items-center"
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
  );
};