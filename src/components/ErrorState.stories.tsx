import type { Meta, StoryObj } from "@storybook/react";
import ErrorState from "./ErrorState";

const meta: Meta<typeof ErrorState> = {
  title: "UI/ErrorState",
  component: ErrorState,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    message: {
      control: "text",
      description: "The error message to display",
    },
    onRetry: {
      description: "Callback function to handle retry attempts",
    },
    title: {
      control: "text",
      description: "Optional title for the error message",
    },
    supportMessage: {
      control: "text",
      description: "Optional support message to show below the alert",
    },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "Something went wrong while loading the data.",
    onRetry: () => console.log("Retry clicked"),
  },
};

export const WithCustomTitle: Story = {
  args: {
    title: "Database Connection Error",
    message: "Unable to establish connection with the database.",
    onRetry: () => console.log("Retry clicked"),
  },
};

export const WithSupportMessage: Story = {
  args: {
    title: "API Error",
    message: "Failed to fetch user data from the API.",
    supportMessage:
      "If this problem persists, please contact our support team at support@example.com",
    onRetry: () => console.log("Retry clicked"),
  },
};

export const LoadingError: Story = {
  args: {
    title: "Loading Failed",
    message:
      "Unable to load your account information. Please check your internet connection.",
    supportMessage: "Error Code: NET_ERR_CONNECTION_TIMED_OUT",
    onRetry: () => console.log("Retry clicked"),
  },
};

export const WithoutRetry: Story = {
  args: {
    title: "Access Denied",
    message: "You do not have permission to access this resource.",
    supportMessage: "Please contact your administrator for access.",
  },
};
