


'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface ToolbarSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function Toolbar({
  children,
  className,
  ...props
}: ToolbarProps) {
  return (
    <aside
      className={cn(
        'fixed right-8 top-1/2 z-50',
        '-translate-y-1/2',
        'w-[380px]',
        'max-h-[90vh]',
        'overflow-hidden',
        'rounded-[28px]',
        'border border-white/10',
        'bg-[#171717]',
        'shadow-2xl',
        'flex flex-col',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

function ToolbarHeader({
  children,
  className,
  ...props
}: ToolbarSectionProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'px-6 py-5',
        'border-b border-white/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ToolbarBody({
  children,
  className,
  ...props
}: ToolbarSectionProps) {
  return (
    <div
      className={cn(
        'flex-1',
        'overflow-y-auto',
        'px-6 py-5',
        'space-y-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ToolbarFooter({
  children,
  className,
  ...props
}: ToolbarSectionProps) {
  return (
    <div
      className={cn(
        'px-6 py-5',
        'border-t border-white/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Toolbar,
  ToolbarHeader,
  ToolbarBody,
  ToolbarFooter,
};