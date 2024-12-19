import React from "react";
import type { Meta, StoryFn } from "@storybook/react";
import { Button } from "./Button";
import { Mail } from "lucide-react";

// Define the prop types for clarity
type ButtonProps = React.ComponentProps<typeof Button>;

// Main metadata for the story
const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "outline",
        "danger",
        "success",
        "warning",
        "info",
        "link",
        "ghost",
      ],
      description: "The visual style of the button",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
      description: "The size of the button",
    },
    isLoading: {
      control: "boolean",
      description: "Whether the button is in a loading state",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    fullWidth: {
      control: "boolean",
      description: "Whether the button should take up the full width",
    },
  },
};

export default meta;

// Template for basic button stories
const Template: StoryFn<typeof Button> = (args) => <Button {...args} />;

// Basic variants
export const Primary: StoryFn<ButtonProps> = Template.bind({});
Primary.args = {
  children: "Primary Button",
  variant: "primary",
};

export const Secondary: StoryFn<ButtonProps> = Template.bind({});
Secondary.args = {
  children: "Secondary Button",
  variant: "secondary",
};

export const Outline: StoryFn<ButtonProps> = Template.bind({});
Outline.args = {
  children: "Outline Button",
  variant: "outline",
};

export const Danger: StoryFn<ButtonProps> = Template.bind({});
Danger.args = {
  children: "Danger Button",
  variant: "danger",
};

// States
export const Loading: StoryFn<ButtonProps> = Template.bind({});
Loading.args = {
  children: "Loading",
  isLoading: true,
};

export const Disabled: StoryFn<ButtonProps> = Template.bind({});
Disabled.args = {
  children: "Disabled",
  disabled: true,
};

// Sizes
export const Small: StoryFn<ButtonProps> = Template.bind({});
Small.args = {
  children: "Small Button",
  size: "sm",
};

export const Large: StoryFn<ButtonProps> = Template.bind({});
Large.args = {
  children: "Large Button",
  size: "lg",
};

// With icons
export const WithIcon: StoryFn<ButtonProps> = Template.bind({});
WithIcon.args = {
  children: (
    <>
      <Mail className="mr-2 h-4 w-4" />
      Email
    </>
  ),
};

export const IconOnly: StoryFn<ButtonProps> = Template.bind({});
IconOnly.args = {
  children: <Mail className="h-4 w-4" />,
  size: "icon",
  "aria-label": "Send email",
};

// Complex examples using render function
export const ButtonGroup: StoryFn = () => (
  <div className="flex gap-2">
    <Button variant="primary">Save</Button>
    <Button variant="secondary">Cancel</Button>
    <Button variant="outline">Reset</Button>
  </div>
);

export const LoadingStates: StoryFn = () => (
  <div className="flex flex-wrap gap-4">
    <Button isLoading variant="primary">
      Primary
    </Button>
    <Button isLoading variant="secondary">
      Secondary
    </Button>
    <Button isLoading variant="danger">
      Danger
    </Button>
  </div>
);

export const AllVariants: StoryFn = () => (
  <div className="grid grid-cols-3 gap-4">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="danger">Danger</Button>
    <Button variant="success">Success</Button>
    <Button variant="warning">Warning</Button>
    <Button variant="info">Info</Button>
    <Button variant="link">Link</Button>
    <Button variant="ghost">Ghost</Button>
  </div>
);

export const Responsive: StoryFn = () => (
  <Button className="w-full sm:w-auto">
    <span className="block sm:hidden">Menu</span>
    <span className="hidden sm:block">Open Menu</span>
  </Button>
);
