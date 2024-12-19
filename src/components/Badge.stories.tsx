import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";
import { Check, AlertTriangle, X, Info } from "lucide-react";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile badge component for status and information display.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "warning", "danger", "neutral"],
      description: "The visual style variant of the badge",
    },
    children: {
      control: "text",
      description: "The content to be displayed within the badge",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the badge",
    },
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Success: Story = {
  args: {
    variant: "success",
    children: "Success",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Warning",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Error",
  },
};

export const Neutral: Story = {
  args: {
    variant: "neutral",
    children: "Neutral",
  },
};

// With icons
export const SuccessWithIcon: Story = {
  args: {
    variant: "success",
    children: (
      <>
        <Check className="w-3 h-3 mr-1" />
        Complete
      </>
    ),
  },
};

export const WarningWithIcon: Story = {
  args: {
    variant: "warning",
    children: (
      <>
        <AlertTriangle className="w-3 h-3 mr-1" />
        Pending
      </>
    ),
  },
};

export const DangerWithIcon: Story = {
  args: {
    variant: "danger",
    children: (
      <>
        <X className="w-3 h-3 mr-1" />
        Failed
      </>
    ),
  },
};

export const NeutralWithIcon: Story = {
  args: {
    variant: "neutral",
    children: (
      <>
        <Info className="w-3 h-3 mr-1" />
        Info
      </>
    ),
  },
};

// Number badges
export const NumberBadge: Story = {
  args: {
    variant: "danger",
    children: "42",
    className: "w-6 h-6 flex items-center justify-center p-0",
  },
};

// Status indicators
export const StatusIndicator: Story = {
  args: {
    variant: "success",
    children: (
      <span className="flex items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
        Online
      </span>
    ),
  },
};

// Badge groups
export const BadgeGroup: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">New</Badge>
      <Badge variant="warning">Updated</Badge>
      <Badge variant="danger">Deleted</Badge>
      <Badge variant="neutral">Draft</Badge>
    </div>
  ),
};

// Complex content
export const ComplexContent: Story = {
  args: {
    variant: "neutral",
    children: (
      <div className="flex items-center gap-1">
        <img
          src="/api/placeholder/20/20"
          alt="User"
          className="w-4 h-4 rounded-full"
        />
        <span>John Doe</span>
      </div>
    ),
  },
};

// Custom styles
export const CustomStyles: Story = {
  args: {
    variant: "neutral",
    children: "Custom",
    className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  },
};

// Multiple sizes example
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge variant="success" className="text-xs px-2 py-0.5">
        Small
      </Badge>
      <Badge variant="success" className="text-sm px-3 py-1">
        Medium
      </Badge>
      <Badge variant="success" className="text-base px-4 py-1.5">
        Large
      </Badge>
    </div>
  ),
};

// Usage examples in context
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-4">
      {/* Status list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">System Status</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span>API</span>
            <Badge variant="success">Operational</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Database</span>
            <Badge variant="warning">Degraded</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Storage</span>
            <Badge variant="danger">Offline</Badge>
          </div>
        </div>
      </div>

      {/* Feature tags */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Features</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">Free</Badge>
          <Badge variant="success">Pro</Badge>
          <Badge variant="warning">Beta</Badge>
          <Badge variant="danger">Deprecated</Badge>
        </div>
      </div>
    </div>
  ),
};
