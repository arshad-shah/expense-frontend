import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

const meta: Meta<typeof Footer> = {
  title: "Components/Footer",
  component: Footer,
  parameters: {
    // Use a dark background to properly display the footer
    backgrounds: {
      default: "dark",
    },
    // Ensure the footer has enough space to display
    layout: "fullscreen",
    // Add a minimum height to the story container
    docs: {
      story: {
        inline: false,
        iframeHeight: 400,
      },
    },
  },
  // The Footer doesn't accept any props, but we'll document that
  argTypes: {},
  // Wrap all stories with MemoryRouter for Link components
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic story showing the default footer
export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-[400px] flex flex-col justify-end">
        <Story />
      </div>
    ),
  ],
};

// Story showing the footer in a full page layout
export const InPageLayout: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 bg-gray-50 p-4">
          <div className="h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-500">Page Content</span>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates how the footer appears when used in a full page layout with content above it.",
      },
    },
  },
};

// Story showing the footer with a dark theme
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-[400px] flex flex-col justify-end bg-gray-900">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story:
          "The footer naturally adapts to dark backgrounds due to its built-in gradient and color scheme.",
      },
    },
  },
};
