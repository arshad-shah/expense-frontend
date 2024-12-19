import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  InfoIcon,
  XCircle,
} from "lucide-react";
import Alert from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile alert component for displaying messages, notifications, and feedback.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "success",
        "error",
        "warning",
        "info",
        "neutral",
        "promotional",
      ],
      description: "The visual style of the alert",
    },
    title: {
      control: "text",
      description: "The title of the alert",
    },
    children: {
      control: "text",
      description: "The main content of the alert",
    },
    dismissible: {
      control: "boolean",
      description: "Whether the alert can be dismissed",
    },
    icon: {
      control: "boolean",
      description: "Custom icon for the alert",
    },
    actions: {
      control: "object",
      description: "Action buttons for the alert",
    },
    onDismiss: {
      action: "dismissed",
      description: "Callback when the alert is dismissed",
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof Alert>;

// Basic variants
export const Success: Story = {
  args: {
    variant: "success",
    title: "Success",
    children: "Operation completed successfully.",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    title: "Error",
    children: "An error occurred while processing your request.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Warning",
    children: "Please review the changes before proceeding.",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    title: "Information",
    children: "Here is some important information you should know.",
  },
};

export const Neutral: Story = {
  args: {
    variant: "neutral",
    title: "Note",
    children: "This is a neutral message.",
  },
};

export const Promotional: Story = {
  args: {
    variant: "promotional",
    title: "Special Offer",
    children: "Get 20% off on your next purchase!",
  },
};

// With custom icon
export const CustomIcon: Story = {
  args: {
    variant: "info",
    title: "New Features",
    children: "Check out the latest updates to your dashboard.",
    icon: <Bell className="h-5 w-5" />,
  },
};

// Dismissible alert
export const Dismissible: Story = {
  args: {
    variant: "info",
    title: "Dismissible Alert",
    children: "Click the X button to dismiss this alert.",
    dismissible: true,
  },
};

// With actions
export const WithActions: Story = {
  args: {
    variant: "warning",
    title: "Unsaved Changes",
    children: "You have unsaved changes. Would you like to save them?",
    actions: [
      {
        label: "Save Changes",
        onClick: () => console.log("Saved"),
        variant: "primary",
      },
      {
        label: "Discard",
        onClick: () => console.log("Discarded"),
        variant: "secondary",
      },
    ],
  },
};

// With link
export const WithLink: Story = {
  args: {
    variant: "info",
    title: "Documentation",
    children: "Learn more about our new features in the documentation.",
    link: {
      href: "https://example.com",
      label: "View Documentation",
    },
  },
};

// Complex example with all features
export const ComplexAlert: Story = {
  args: {
    variant: "warning",
    title: "Account Verification Required",
    children: "Your account needs to be verified to access all features.",
    dismissible: true,
    icon: <AlertCircle className="h-5 w-5" />,
    actions: [
      {
        label: "Verify Now",
        onClick: () => console.log("Verify clicked"),
        variant: "primary",
      },
      {
        label: "Learn More",
        onClick: () => console.log("Learn more clicked"),
        variant: "secondary",
      },
    ],
    link: {
      href: "https://example.com/help",
      label: "Read our verification guide",
    },
  },
};

// Examples in context
export const AlertStack: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-lg">
      <Alert
        variant="error"
        title="Failed to save changes"
        icon={<XCircle className="h-5 w-5" />}
        dismissible
      >
        Unable to save your changes. Please try again later.
      </Alert>

      <Alert
        variant="success"
        title="Profile updated"
        icon={<CheckCircle2 className="h-5 w-5" />}
        dismissible
      >
        Your profile has been successfully updated.
      </Alert>

      <Alert
        variant="info"
        title="System maintenance"
        icon={<InfoIcon className="h-5 w-5" />}
        actions={[
          {
            label: "Learn More",
            onClick: () => console.log("Learn more clicked"),
            variant: "secondary",
          },
        ]}
      >
        Scheduled maintenance will occur on Saturday at 2 AM UTC.
      </Alert>
    </div>
  ),
};

// Different sizes and layouts
export const LayoutVariations: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-lg">
      {/* Compact */}
      <Alert variant="info" className="py-2">
        A compact alert message.
      </Alert>

      {/* Standard */}
      <Alert variant="warning" title="Standard Alert" dismissible>
        A standard alert with title and dismiss button.
      </Alert>

      {/* Expanded */}
      <Alert
        variant="info"
        title="Expanded Alert"
        actions={[{ label: "Action", onClick: () => {}, variant: "primary" }]}
        link={{ href: "#", label: "Learn More" }}
        className="py-6"
      >
        An expanded alert with additional content and actions.
      </Alert>
    </div>
  ),
};
