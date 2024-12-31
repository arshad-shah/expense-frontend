import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

// Tab Root Component
const Tabs = ({
  variant = "default",
  items,
  value,
  onChange,
}: {
  variant?: "default" | "filled" | "outlined";
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <TabsPrimitive.Root value={value} onValueChange={onChange}>
    <TabsList variant={variant}>
      {items.map((item) => (
        <TabsTrigger key={item.value} value={item.value}>
          {item.label}
        </TabsTrigger>
      ))}
    </TabsList>
  </TabsPrimitive.Root>
);

// TabsList Component
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant: string;
  }
>(({ variant, className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg p-1",
      variant === "filled"
        ? "bg-background text-foreground"
        : variant === "outlined"
          ? "border border-background text-background"
          : "text-muted-foreground",
      "text-muted-foreground",
      className,
    )}
    {...props}
  />
));

TabsList.displayName = TabsPrimitive.List.displayName;

// TabsTrigger Component
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className,
    )}
    {...props}
  />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// TabsContent Component
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));

TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
