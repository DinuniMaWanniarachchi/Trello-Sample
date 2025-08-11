// components/board/BoardHeader.tsx
"use client";

import { MainHeader } from '@/components/common/MainHeader';
import { BoardSubHeader } from '@/components/board/BoardSubHeader';

interface BoardHeaderProps {
  title: string;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ title }) => {
  return (
    <>
      <MainHeader />
      <BoardSubHeader title={title} />
    </>
  );
};