// components/Providers.tsx
"use client";

import React from 'react';
import { ProjectProvider } from '@/contexts/ProjectContext';
// Import your existing ThemeProvider if you have one
// import { ThemeProvider } from '@/contexts/ThemeContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    // If you have a ThemeProvider, wrap ProjectProvider with it
    // <ThemeProvider>
      <ProjectProvider>
        {children}
      </ProjectProvider>
    // </ThemeProvider>
  );
}