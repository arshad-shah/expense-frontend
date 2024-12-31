import React, { useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  CollisionDetection,
  rectIntersection,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import StatCards from "./components/StatCards";
import SpendingChart from "./components/SpendingChart";
import RecentTransactions from "./components/RecentTransactions";
import BudgetOverview from "./components/BudgetOverview";
import TopCategories from "./components/TopCategories";
import { DraggableWidget } from "./components/DraggableWidget";

interface SpanConstraints {
  min: number;
  max: number;
  default: number;
}

export interface WidgetType {
  id: string;
  type: "spending" | "budget" | "categories" | "transactions";
  spans: {
    mobile: SpanConstraints;
    tablet: SpanConstraints;
    desktop: SpanConstraints;
  };
  title: string;
}

const DEFAULT_WIDGETS: WidgetType[] = [
  {
    id: "spending-chart",
    type: "spending",
    title: "Spending Trends",
    spans: {
      mobile: { min: 1, max: 1, default: 1 },
      tablet: { min: 1, max: 2, default: 2 },
      desktop: { min: 1, max: 2, default: 2 },
    },
  },
  {
    id: "budget-overview",
    type: "budget",
    title: "Budget Overview",
    spans: {
      mobile: { min: 1, max: 1, default: 1 },
      tablet: { min: 1, max: 1, default: 1 },
      desktop: { min: 1, max: 1, default: 1 },
    },
  },
  {
    id: "top-categories",
    type: "categories",
    title: "Top Categories",
    spans: {
      mobile: { min: 1, max: 1, default: 1 },
      tablet: { min: 1, max: 1, default: 1 },
      desktop: { min: 1, max: 1, default: 1 },
    },
  },
  {
    id: "recent-transactions",
    type: "transactions",
    title: "Recent Transactions",
    spans: {
      mobile: { min: 1, max: 1, default: 1 },
      tablet: { min: 2, max: 2, default: 2 },
      desktop: { min: 2, max: 3, default: 2 },
    },
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<WidgetType[]>(DEFAULT_WIDGETS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    zone: string;
  } | null>(null);

  const firstName = user?.firstName
    ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
    : "";
  const lastName = user?.lastName
    ? user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)
    : "";

  // Enhanced sensors with better touch handling
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3, // Reduced distance for easier activation
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Reduced delay for better response
        tolerance: 8,
      },
    }),
  );

  // Custom collision detection that respects span constraints
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const intersections = rectIntersection(args);
      const activeWidget = widgets.find((w) => w.id === args.active.id);

      if (!activeWidget || !intersections.length) return [];

      // Filter out invalid drop targets based on constraints
      return intersections.filter((intersection) => {
        const targetWidget = widgets.find((w) => w.id === intersection.id);
        if (!targetWidget) return false;

        // Check if the swap would violate any constraints
        const canSwap =
          activeWidget.spans.desktop.min <= targetWidget.spans.desktop.max &&
          targetWidget.spans.desktop.min <= activeWidget.spans.desktop.max;
        return canSwap;
      });
    },
    [widgets],
  );

  const getResponsiveClasses = (widget: WidgetType) => {
    const { mobile, tablet, desktop } = widget.spans;

    return cn(
      // Mobile (default)
      `col-span-${mobile.default}`,
      // Tablet
      `md:col-span-${tablet.default}`,
      // Desktop
      `lg:col-span-${desktop.default}`,
      "transition-all duration-300",
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    if (!over) {
      setDropTarget(null);
      return;
    }

    setDropTarget({
      id: over.id.toString(),
      zone: active.id === over.id ? "self" : "other",
    });
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
    setDropTarget(null);
  };

  const renderWidget = (widget: WidgetType) => {
    switch (widget.type) {
      case "spending":
        return <SpendingChart />;
      case "budget":
        return <BudgetOverview />;
      case "categories":
        return <TopCategories />;
      case "transactions":
        return <RecentTransactions />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4 w-full">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {firstName} {lastName}
          </h1>
          <p className="text-gray-600">Here's your financial overview</p>
        </div>
      </div>

      {/* Fixed Stats Grid */}
      <StatCards />

      {/* Enhanced Draggable Widgets Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SortableContext items={widgets} strategy={rectSortingStrategy}>
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={cn(getResponsiveClasses(widget), "relative group")}
              >
                {/* Enhanced Drop Zone Indicator */}
                {activeId && activeId !== widget.id && (
                  <div
                    className={cn(
                      "absolute inset-0 rounded-xl border-2 border-dashed z-10",
                      "transition-all duration-200",
                      dropTarget?.id === widget.id
                        ? "border-indigo-500 bg-indigo-50/50 scale-105"
                        : "border-gray-200 bg-gray-50/50",
                    )}
                  />
                )}

                {/* Widget Content with Enhanced Drag Handle */}
                <DraggableWidget
                  widget={widget}
                  className={cn(
                    "relative z-20 transition-all duration-200",
                    activeId === widget.id
                      ? "opacity-50 scale-105"
                      : "hover:shadow-md",
                    dropTarget?.id === widget.id && "transform scale-95",
                  )}
                >
                  <div className="rounded-t-xl bg-gray-50 px-4 py-2 border-b border-gray-100">
                    <h3 className="font-medium text-gray-700">
                      {widget.title}
                    </h3>
                  </div>
                  {renderWidget(widget)}
                </DraggableWidget>
              </div>
            ))}
          </SortableContext>
        </div>

        {/* Enhanced Drag Overlay */}
        <DragOverlay>
          {activeId && (
            <div
              className={cn(
                "bg-white rounded-xl shadow-xl border border-gray-100",
                getResponsiveClasses(widgets.find((w) => w.id === activeId)!),
                "opacity-90 rotate-2 scale-105",
              )}
            >
              {renderWidget(widgets.find((w) => w.id === activeId)!)}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Dashboard;
