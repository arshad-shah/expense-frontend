import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";
import {
  Mail,
  Lock,
  Search as SearchIcon,
  AlertCircle,
  User,
} from "lucide-react";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    label: {
      control: "text",
      description: "Label text for the input",
    },
    error: {
      control: "text",
      description: "Error message to display",
    },
    helperText: {
      control: "text",
      description: "Helper text to display below the input",
    },
    icon: {
      control: "select",
      options: ["mail", "lock", "search", "alert", "user", "none"],
      mapping: {
        mail: <Mail className="h-5 w-5" />,
        lock: <Lock className="h-5 w-5" />,
        search: <SearchIcon className="h-5 w-5" />,
        alert: <AlertCircle className="h-5 w-5" />,
        user: <User className="h-5 w-5" />,
        none: null,
      },
      description: "Icon to display in the input",
    },
    variant: {
      control: "select",
      options: ["default", "filled", "outline", "minimal"],
      description: "Visual variant of the input",
    },
    inputSize: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the input",
    },
    isLoading: {
      control: "boolean",
      description: "Loading state of the input",
    },
    fullWidth: {
      control: "boolean",
      description: "Whether the input should take full width",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic input variations
export const Default: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
  },
};

export const WithIcon: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
    icon: <Mail className="h-5 w-5" />,
  },
};

// Size variations
export const Small: Story = {
  args: {
    label: "Small Input",
    placeholder: "Small size",
    inputSize: "sm",
    icon: <SearchIcon className="h-4 w-4" />,
  },
};

export const Large: Story = {
  args: {
    label: "Large Input",
    placeholder: "Large size",
    inputSize: "lg",
    icon: <SearchIcon className="h-6 w-6" />,
  },
};

// Variant examples
export const Filled: Story = {
  args: {
    label: "Filled Input",
    placeholder: "Filled variant",
    variant: "filled",
    icon: <User className="h-5 w-5" />,
  },
};

export const Outline: Story = {
  args: {
    label: "Outline Input",
    placeholder: "Outline variant",
    variant: "outline",
    icon: <User className="h-5 w-5" />,
  },
};

export const Minimal: Story = {
  args: {
    label: "Minimal Input",
    placeholder: "Minimal variant",
    variant: "minimal",
    icon: <User className="h-5 w-5" />,
  },
};

// State variations
export const WithError: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter password",
    icon: <Lock className="h-5 w-5" />,
    error: "Password must be at least 8 characters",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Username",
    placeholder: "Choose a username",
    helperText: "Username must be unique and between 3-20 characters",
    icon: <User className="h-5 w-5" />,
  },
};

export const Loading: Story = {
  args: {
    label: "Loading Input",
    placeholder: "Loading state...",
    isLoading: true,
    icon: <Mail className="h-5 w-5" />,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "This input is disabled",
    disabled: true,
    icon: <Lock className="h-5 w-5" />,
  },
};

// Special cases
export const ReadOnly: Story = {
  args: {
    label: "Read Only Input",
    value: "This is read-only content",
    readOnly: true,
    icon: <Lock className="h-5 w-5" />,
  },
};

export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    icon: <Lock className="h-5 w-5" />,
  },
};

export const Search: Story = {
  args: {
    label: "Search",
    type: "search",
    placeholder: "Search...",
    icon: <SearchIcon className="h-5 w-5" />,
    variant: "filled",
  },
};

// Form example with multiple inputs
export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Full Name"
        placeholder="John Doe"
        icon={<User className="h-5 w-5" />}
      />
      <Input
        label="Email"
        type="email"
        placeholder="john@example.com"
        icon={<Mail className="h-5 w-5" />}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter password"
        icon={<Lock className="h-5 w-5" />}
        helperText="Must be at least 8 characters"
      />
    </div>
  ),
};
