// components/board/BoardSubHeader.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Star, Users, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BoardSubHeaderProps {
  title: string;
}

export const BoardSubHeader: React.FC<BoardSubHeaderProps> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <div className="px-6 py-1 border-b border-border bg-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">
            {t(title, { defaultValue: title })}
          </h1>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Users className="h-4 w-4" />
          </Button>
        </div>
                
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};