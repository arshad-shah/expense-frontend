import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";
import { CogIcon, HomeIcon, User2Icon } from "lucide-react";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  argTypes: {
    variant: {
      control: "select",
      options: ["filled", "outlined", "minimal", "pills"],
    },
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "neutral",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    fullWidth: { control: "boolean" },
    vertical: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveTemplate = (args: any) => {
  const [activeTab, setActiveTab] = useState(args.value);

  return (
    <Tabs
      {...args}
      value={activeTab}
      onChange={(value: string) => {
        setActiveTab(value);
        console.log("Selected tab:", value);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <InteractiveTemplate {...args} />,
  args: {
    items: [
      { value: "tab1", label: "Tab 1" },
      { value: "tab2", label: "Tab 2" },
      { value: "tab3", label: "Tab 3" },
    ],
    value: "tab1",
    variant: "filled",
    color: "primary",
    size: "md",
    fullWidth: false,
    vertical: false,
    disabled: false,
  },
};

export const WithIcons: Story = {
  render: (args) => <InteractiveTemplate {...args} />,
  args: {
    items: [
      { value: "home", label: "Home", icon: <HomeIcon /> },
      { value: "settings", label: "Settings", icon: <CogIcon /> },
      { value: "profile", label: "Profile", icon: <User2Icon /> },
    ],
    value: "home",
    variant: "outlined",
    color: "secondary",
    size: "lg",
    fullWidth: true,
    vertical: false,
    disabled: false,
  },
};

export const VerticalTabs: Story = {
  render: (args) => <InteractiveTemplate {...args} />,
  args: {
    items: [
      { value: "tab1", label: "Vertical Tab 1" },
      { value: "tab2", label: "Vertical Tab 2" },
      { value: "tab3", label: "Vertical Tab 3" },
    ],
    value: "tab1",
    variant: "pills",
    color: "success",
    size: "sm",
    fullWidth: false,
    vertical: true,
    disabled: false,
  },
};

export const DisabledTabs: Story = {
  render: (args) => <InteractiveTemplate {...args} />,
  args: {
    items: [
      { value: "tab1", label: "Disabled Tab 1", disabled: true },
      { value: "tab2", label: "Tab 2" },
      { value: "tab3", label: "Tab 3" },
    ],
    value: "tab2",
    variant: "minimal",
    color: "danger",
    size: "md",
    fullWidth: true,
    vertical: false,
    disabled: false,
  },
};
