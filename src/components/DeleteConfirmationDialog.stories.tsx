import type { Meta, StoryObj } from "@storybook/react";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { useState } from "react";
import { Button } from "./Button";

const meta: Meta<typeof DeleteConfirmationDialog> = {
  title: "UI/DeleteConfirmationDialog",
  component: DeleteConfirmationDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A reusable confirmation dialog for delete operations.",
      },
    },
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controls the visibility of the dialog",
    },
    entityName: {
      control: "text",
      description: "Name of the entity being deleted",
    },
    description: {
      control: "text",
      description: "Additional description text (optional)",
    },
    isDeleting: {
      control: "boolean",
      description: "Controls the loading state of the delete button",
    },
    onClose: {
      action: "closed",
      description: "Called when the dialog is closed",
    },
    onConfirm: {
      action: "confirmed",
      description: "Called when deletion is confirmed",
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DeleteConfirmationDialog>;

export default meta;
type Story = StoryObj<typeof DeleteConfirmationDialog>;

// Basic example
export const Basic: Story = {
  args: {
    isOpen: true,
    entityName: "User Account",
    onClose: () => {},
    onConfirm: () => {},
  },
};

// With description
export const WithDescription: Story = {
  args: {
    isOpen: true,
    entityName: "Project",
    description:
      "All associated data, including files and settings, will also be deleted.",
    onClose: () => {},
    onConfirm: () => {},
  },
};

// Loading state
export const Deleting: Story = {
  args: {
    isOpen: true,
    entityName: "Document",
    isDeleting: true,
    onClose: () => {},
    onConfirm: () => {},
  },
};

// Interactive example
export const Interactive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
      setIsDeleting(true);
      // Simulate deletion
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsDeleting(false);
      setIsOpen(false);
    };

    return (
      <div className="space-y-4">
        <Button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Delete Item
        </Button>

        <DeleteConfirmationDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={handleConfirm}
          entityName="Important Item"
          description="This is a simulated deletion with a 2-second delay."
          isDeleting={isDeleting}
        />
      </div>
    );
  },
};

// Different entity types
export const DeletingAccount: Story = {
  args: {
    isOpen: true,
    entityName: "Personal Account",
    description:
      "Your profile, settings, and all associated data will be permanently removed.",
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const DeletingPost: Story = {
  args: {
    isOpen: true,
    entityName: "Blog Post",
    description: "All comments and reactions will also be deleted.",
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const DeletingWorkspace: Story = {
  args: {
    isOpen: true,
    entityName: "Development Workspace",
    description:
      "This will remove all projects, environments, and team access within this workspace.",
    onClose: () => {},
    onConfirm: () => {},
  },
};

// Long entity name and description
export const LongContent: Story = {
  args: {
    isOpen: true,
    entityName:
      "Very Long Project Name That Might Need To Wrap Onto Multiple Lines",
    description:
      "This is a very long description that contains detailed information about what will happen when this item is deleted. It includes multiple consequences and important details that the user should be aware of before proceeding with the deletion.",
    onClose: () => {},
    onConfirm: () => {},
  },
};

// Multiple dialogs example
export const MultipleDialogs: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [openDialogs, setOpenDialogs] = useState({
      file: false,
      user: false,
      project: false,
    });

    return (
      <div className="space-y-4">
        <div className="space-x-4">
          <Button
            onClick={() => setOpenDialogs((prev) => ({ ...prev, file: true }))}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete File
          </Button>
          <Button
            onClick={() => setOpenDialogs((prev) => ({ ...prev, user: true }))}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete User
          </Button>
          <Button
            onClick={() =>
              setOpenDialogs((prev) => ({ ...prev, project: true }))
            }
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Project
          </Button>
        </div>

        <DeleteConfirmationDialog
          isOpen={openDialogs.file}
          onClose={() => setOpenDialogs((prev) => ({ ...prev, file: false }))}
          onConfirm={() => setOpenDialogs((prev) => ({ ...prev, file: false }))}
          entityName="Important File"
          description="This file will be moved to trash."
        />

        <DeleteConfirmationDialog
          isOpen={openDialogs.user}
          onClose={() => setOpenDialogs((prev) => ({ ...prev, user: false }))}
          onConfirm={() => setOpenDialogs((prev) => ({ ...prev, user: false }))}
          entityName="User Account"
          description="All user data will be permanently deleted."
        />

        <DeleteConfirmationDialog
          isOpen={openDialogs.project}
          onClose={() =>
            setOpenDialogs((prev) => ({ ...prev, project: false }))
          }
          onConfirm={() =>
            setOpenDialogs((prev) => ({ ...prev, project: false }))
          }
          entityName="Project"
          description="All project files and settings will be removed."
        />
      </div>
    );
  },
};
