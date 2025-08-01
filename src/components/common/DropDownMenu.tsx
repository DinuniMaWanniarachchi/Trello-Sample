// components/common/DropdownMenu.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';

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

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
          });
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps & { isOpen?: boolean; setIsOpen?: (open: boolean) => void }> = ({ 
  children, 
  isOpen, 
  setIsOpen 
}) => {
  const handleClick = () => {
    setIsOpen?.(!isOpen);
  };

  if (React.isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }
  return <>{children}</>;
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps & { isOpen?: boolean; setIsOpen?: (open: boolean) => void }> = ({ 
  align = 'start', 
  className = '', 
  children, 
  isOpen,
  setIsOpen 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen?.(false);
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
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(child as React.ReactElement<any>, {
            setIsOpen,
          });
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps & { setIsOpen?: (open: boolean) => void }> = ({ 
  onClick, 
  className = '', 
  children, 
  setIsOpen 
}) => {
  const handleClick = () => {
    onClick?.();
    setIsOpen?.(false);
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
};