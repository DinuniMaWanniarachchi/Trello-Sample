// components/board/BoardHeader.tsx
"use client";

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Star, Users, MoreHorizontal } from 'lucide-react';

interface BoardHeaderProps {
  title: string;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ title }) => {
  return (
    <div className="px-6 py-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
            <Users className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};