import type { Meta, StoryObj } from "@storybook/react";
import EmptyState from "./EmptyState";
import { Button } from "./Button";
import {
  Plus,
  Search,
  FileBox,
  Inbox,
  Settings,
  FolderPlus,
} from "lucide-react";

const meta: Meta<typeof EmptyState> = {
  title: "UI/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Empty state component for displaying when no content is available.",
      },
    },
  },
  argTypes: {
    heading: {
      control: "text",
      description: "Main heading text",
    },
    message: {
      control: "text",
      description: "Descriptive message text",
    },
    action: {
      control: "object",
      description: "Action element (button, link, etc.)",
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof EmptyState>;

// Basic empty state
export const Basic: Story = {
  args: {
    heading: "No items found",
    message: "Get started by creating your first item.",
  },
};

// With action button
export const WithAction: Story = {
  args: {
    heading: "No projects yet",
    message: "Create your first project to get started.",
    action: (
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Create Project
      </Button>
    ),
  },
};

// Search results empty state
export const SearchResults: Story = {
  args: {
    heading: "No results found",
    message: "Try adjusting your search terms or filters.",
    action: (
      <div className="flex flex-col items-center space-y-4">
        <Search className="h-12 w-12 text-gray-400" />
        <Button variant="secondary">Clear Filters</Button>
      </div>
    ),
  },
};

// File upload empty state
export const FileUpload: Story = {
  args: {
    heading: "No files uploaded",
    message: "Drag and drop files here or click to upload.",
    action: (
      <div className="text-center">
        <FileBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <Button variant="outline">Select Files</Button>
      </div>
    ),
  },
};

// Empty inbox state
export const EmptyInbox: Story = {
  args: {
    heading: "Your inbox is empty",
    message: "Messages you receive will appear here.",
    action: (
      <div className="text-center">
        <Inbox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-500">
          When you receive new messages, they'll appear here
        </p>
      </div>
    ),
  },
};

// Settings empty state
export const EmptySettings: Story = {
  args: {
    heading: "No custom settings",
    message: "You haven't configured any custom settings yet.",
    action: (
      <div className="space-y-4">
        <Settings className="mx-auto h-12 w-12 text-gray-400" />
        <Button variant="outline">Configure Settings</Button>
      </div>
    ),
  },
};

// Empty folder state
export const EmptyFolder: Story = {
  args: {
    heading: "Empty folder",
    message: "This folder has no items yet.",
    action: (
      <div className="space-y-4 text-center">
        <FolderPlus className="mx-auto h-12 w-12 text-gray-400" />
        <div className="space-x-3">
          <Button variant="outline">Upload Files</Button>
          <Button variant="secondary">Create New</Button>
        </div>
      </div>
    ),
  },
};

// With secondary message
export const WithSecondaryMessage: Story = {
  args: {
    heading: "No notifications",
    message: "When you receive notifications, they will appear here.",
    action: (
      <div className="space-y-3 text-center">
        <p className="text-sm text-gray-500">
          You can configure your notification preferences in settings
        </p>
        <Button variant="secondary">Go to Settings</Button>
      </div>
    ),
  },
};

// Loading state
export const Loading: Story = {
  args: {
    heading: "Loading content",
    message: "Please wait while we fetch your data...",
    action: (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    ),
  },
};

// Error state
export const Error: Story = {
  args: {
    heading: "Unable to load data",
    message: "An error occurred while fetching your content.",
    action: (
      <div className="space-y-3 text-center">
        <p className="text-sm text-red-600">Error: Network connection failed</p>
        <Button variant="outline">Retry</Button>
      </div>
    ),
  },
};

// First time user
export const FirstTimeUser: Story = {
  args: {
    heading: "Welcome to the App!",
    message: "Complete these steps to get started with your workspace.",
    action: (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-sm">
              1
            </div>
            <span className="text-sm text-gray-600">Set up your profile</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-sm">
              2
            </div>
            <span className="text-sm text-gray-600">
              Create your first project
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-sm">
              3
            </div>
            <span className="text-sm text-gray-600">Invite team members</span>
          </div>
        </div>
        <Button>Get Started</Button>
      </div>
    ),
  },
};
