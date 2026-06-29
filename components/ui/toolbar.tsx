'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';
import {
  motion,
  animate,
  useDragControls,
  useMotionValue,
} from 'motion/react';
import { GripHorizontal } from 'lucide-react';

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
  const controls = useDragControls();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <motion.aside
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={true}
      dragElastic={0.08}
      style={{ x, y }}
      whileDrag={{
        scale: 1.02,
        rotate: 1,
        cursor: 'grabbing',
      }}
      onDragEnd={() => {
        animate(x, 0, {
          type: 'spring',
          stiffness: 450,
          damping: 35,
        });

        animate(y, 0, {
          type: 'spring',
          stiffness: 450,
          damping: 35,
        });
      }}
      className={cn(
        'fixed right-8 top-1/2 z-50',
        '-translate-y-1/2',
        'w-[380px]',
        'max-h-[90vh]',
        'overflow-hidden',
        'rounded-3xl',
        'border border-border',
        'bg-card',
        'shadow-2xl',
        'flex flex-col',
        className
      )}
      {...props}
    >
      {/* Grab Handle */}
      <div
        onPointerDown={(e) => controls.start(e)}
        className="
          flex
          justify-center
          border-b
          border-border
          py-2
          cursor-grab
          active:cursor-grabbing
          select-none
        "
      >
        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Drag
          </span>
        </div>
      </div>

      {children}
    </motion.aside>
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
        'border-b border-border',
        'px-6 py-5',
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
        'flex-1 overflow-y-auto',
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
        'border-t border-border',
        'px-6 py-5',
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