// components/common/DropdownMenu.tsx
"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'end';
  className?: string;
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

// Create a context to share state between components
interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within DropdownMenu');
  }
  return context;
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
  children, 
  asChild,
}) => {
  const { isOpen, setIsOpen } = useDropdown();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    // Clone the child and add onClick handler
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleClick,
    });
  }

  return (
    <button onClick={handleClick} type="button">
      {children}
    </button>
  );
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  align = 'start', 
  className = '', 
  children,
}) => {
  const { isOpen, setIsOpen } = useDropdown();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const alignmentClass = align === 'end' ? 'right-0' : 'left-0';

  return (
    <div
      ref={ref}
      className={`absolute top-full mt-1 z-50 ${alignmentClass} ${className}`}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  onClick, 
  className = '', 
  children,
}) => {
  const { setIsOpen } = useDropdown();

  const handleClick = () => {
    onClick?.();
    setIsOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      role="menuitem"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
};