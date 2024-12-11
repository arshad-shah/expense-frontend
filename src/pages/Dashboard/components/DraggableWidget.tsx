import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetType } from '../types';

interface DraggableWidgetProps {
  widget: WidgetType;
  children: React.ReactNode;
  className?: string;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  children,
  className
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        className,
        'group relative',
        isDragging && 'z-50'
      )}
    >
      <div className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100',
        'transition-shadow duration-200',
        isDragging ? 'shadow-lg' : 'hover:shadow-md',
        'relative'
      )}>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            'absolute top-3 right-3 p-1.5 rounded-lg cursor-grab',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'hover:bg-gray-100'
          )}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {children}
      </div>
    </div>
  );
};