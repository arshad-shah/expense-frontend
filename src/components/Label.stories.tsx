import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./Label";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "ghost"],
      description: "The visual style variant of the label",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "The size of the label",
    },
    required: {
      control: "boolean",
      description: "Whether to show a required indicator",
    },
    children: {
      control: "text",
      description: "The content of the label",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic label story
export const Default: Story = {
  args: {
    children: "Email address",
  },
};

// Required label story
export const Required: Story = {
  args: {
    children: "Password",
    required: true,
  },
};

// Size variations
export const Small: Story = {
  args: {
    children: "Small Label",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    children: "Medium Label",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    children: "Large Label",
    size: "lg",
  },
};

// Variant examples
export const Secondary: Story = {
  args: {
    children: "Secondary Label",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost Label",
    variant: "ghost",
  },
};

// Combined features
export const RequiredSecondary: Story = {
  args: {
    children: "Required Secondary Label",
    variant: "secondary",
    required: true,
  },
};

// Example with HTML content
export const WithHTMLContent: Story = {
  args: {
    children: (
      <>
        Profile picture <span className="text-gray-500">(optional)</span>
      </>
    ),
  },
};

// Example showing form field association
export const WithFormField: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="username" {...args}>
        Username
      </Label>
      <input
        type="text"
        id="username"
        className="block w-full rounded-lg border border-gray-300 px-3 py-2"
        placeholder="Enter username"
      />
    </div>
  ),
};

// Example with custom className
export const WithCustomClass: Story = {
  args: {
    children: "Custom Styled Label",
    className: "italic underline",
  },
};
