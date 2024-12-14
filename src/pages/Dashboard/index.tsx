import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import StatCards from './components/StatCards';
import SpendingChart from './components/SpendingChart';
import RecentTransactions from './components/RecentTransactions';
import BudgetOverview from './components/BudgetOverview';
import TopCategories from './components/TopCategories';
import { DraggableWidget } from './components/DraggableWidget';

export interface WidgetType {
  id: string;
  type: 'spending' | 'budget' | 'categories' | 'transactions';
  span: 1 | 2 | 3;
  minSpan?: 1 | 2;
  maxSpan?: 1 | 2 | 3;
}

const DEFAULT_WIDGETS: WidgetType[] = [
  { 
    id: 'spending-chart', 
    type: 'spending', 
    span: 2,
    minSpan: 2 
  },
  { 
    id: 'budget-overview', 
    type: 'budget', 
    span: 1,
    maxSpan: 1 
  },
  { 
    id: 'top-categories', 
    type: 'categories', 
    span: 1,
    maxSpan: 2 
  },
  { 
    id: 'recent-transactions', 
    type: 'transactions', 
    span: 3,
    minSpan: 2 
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<WidgetType[]>(DEFAULT_WIDGETS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const firstName = user?.firstName ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1) : '';
  const lastName = user?.lastName ? user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1) : '';

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const getColumnClasses = (widget: WidgetType) => {
    // Base classes for all widgets
    const classes = ['col-span-1'];

    // Medium screens (md: 768px and up)
    if (widget.span >= 2 || widget.minSpan === 2) {
      classes.push('md:col-span-2');
    }

    // Large screens (lg: 1024px and up)
    if (widget.span === 3 || (widget.span === 2 && !widget.maxSpan)) {
      classes.push('lg:col-span-3');
    } else if (widget.span === 2 || (widget.span === 1 && widget.maxSpan === 2)) {
      classes.push('lg:col-span-2');
    }

    return classes.join(' ');
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id.toString() || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
    setOverId(null);
  };

  const renderWidget = (widget: WidgetType) => {
    switch (widget.type) {
      case 'spending':
        return <SpendingChart />;
      case 'budget':
        return <BudgetOverview />;
      case 'categories':
        return <TopCategories />;
      case 'transactions':
        return <RecentTransactions />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {firstName} {lastName}
          </h1>
          <p className="text-gray-600">Here's your financial overview</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-gray-600">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Fixed Stats Grid */}
      <StatCards />

      {/* Draggable Widgets Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SortableContext items={widgets} strategy={rectSortingStrategy}>
            {widgets.map((widget) => (
              <div 
                key={widget.id}
                className={cn(
                  getColumnClasses(widget),
                  'relative',
                  'transition-all duration-200'
                )}
              >
                {/* Drop Zone Indicator */}
                {activeId && activeId !== widget.id && (
                  <div 
                    className={cn(
                      'absolute inset-0 rounded-xl border-2 border-dashed z-10',
                      'transition-colors duration-200',
                      overId === widget.id 
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-gray-200 bg-gray-50/50'
                    )}
                  />
                )}
                
                {/* Widget Content */}
                <DraggableWidget
                  widget={widget}
                  className={cn(
                    'relative z-20',
                    activeId === widget.id && 'opacity-50'
                  )}
                >
                  {renderWidget(widget)}
                </DraggableWidget>
              </div>
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeId && (
            <div className={cn(
              "bg-white rounded-xl shadow-lg border border-gray-100",
              getColumnClasses(widgets.find(w => w.id === activeId)!)
            )}>
              {renderWidget(widgets.find(w => w.id === activeId)!)}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Dashboard;