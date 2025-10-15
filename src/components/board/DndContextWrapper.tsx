// components/board/DndContextWrapper.tsx
'use client';

import React from 'react';

interface DndContextWrapperProps {
  children: React.ReactNode;
  items: Array<string | number>;
  onDragEnd: (activeId: string, overId: string | null, activeListId: string, overListId: string) => void;
}

export function DndContextWrapper({ children }: DndContextWrapperProps) {
  return <>{children}</>;
}