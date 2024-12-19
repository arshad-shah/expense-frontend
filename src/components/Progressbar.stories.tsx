import type { Meta, StoryObj } from "@storybook/react";

import { ProgressBar } from "./Progressbar";

const meta: Meta<typeof ProgressBar> = {
  component: ProgressBar,
  title: "UI/ProgressBar", // Optional title for organization in Storybook
  argTypes: {
    value: { control: "number", defaultValue: 50 }, // Default value for value prop
    max: { control: "number", defaultValue: 100 },
    variant: {
      control: "radio",
      options: ["default", "success", "warning", "danger", "info"],
      defaultValue: "default",
    },
    showPercentage: { control: "boolean", defaultValue: false },
    animated: { control: "boolean", defaultValue: false },
    size: { control: "radio", options: ["sm", "md", "lg"], defaultValue: "md" },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50, // Set the default value for the progress bar
  },
};

export const Success: Story = {
  args: {
    value: 80,
    variant: "success",
    showPercentage: true,
  },
};

export const Warning: Story = {
  args: {
    value: 60,
    variant: "warning",
    showPercentage: true,
  },
};

export const Danger: Story = {
  args: {
    value: 40,
    variant: "danger",
    showPercentage: true,
  },
};

export const Animated: Story = {
  args: {
    value: 75,
    animated: true,
    showPercentage: true,
  },
};

export const Small: Story = {
  args: {
    value: 30,
    size: "sm",
    showPercentage: true,
  },
};

export const Large: Story = {
  args: {
    value: 90,
    size: "lg",
    showPercentage: true,
  },
};
