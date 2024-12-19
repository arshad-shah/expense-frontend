import React from "react";
import type { Meta, StoryFn } from "@storybook/react";
import { Checkbox, CheckboxProps } from "./Checkbox";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A controlled checkbox component built with Radix UI primitives.",
      },
    },
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "The controlled checked state of the checkbox",
    },
    disabled: {
      control: "boolean",
      description: "Whether the checkbox is disabled",
    },
    label: {
      control: "text",
      description: "Label text to be displayed next to the checkbox",
    },
    onCheckedChange: {
      action: "checked changed",
      description: "Event handler called when the checked state changes",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the checkbox",
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;

// Template for basic checkbox stories
const Template: StoryFn<typeof Checkbox> = (args) => <Checkbox {...args} />;

// Basic Checkbox
export const Default: StoryFn<CheckboxProps> = Template.bind({});
Default.args = {
  label: "Basic Checkbox",
  onCheckedChange: action("checked-changed"),
};

// Checked State
export const Checked: StoryFn<CheckboxProps> = Template.bind({});
Checked.args = {
  label: "Checked Checkbox",
  checked: true,
  onCheckedChange: action("checked-changed"),
};

// Disabled State
export const Disabled: StoryFn<CheckboxProps> = Template.bind({});
Disabled.args = {
  label: "Disabled Checkbox",
  disabled: true,
  onCheckedChange: action("checked-changed"),
};

// Disabled and Checked
export const DisabledChecked: StoryFn<CheckboxProps> = Template.bind({});
DisabledChecked.args = {
  label: "Disabled Checked Checkbox",
  disabled: true,
  checked: true,
  onCheckedChange: action("checked-changed"),
};

// Without Label
export const WithoutLabel: StoryFn<CheckboxProps> = Template.bind({});
WithoutLabel.args = {
  "aria-label": "Checkbox without visible label",
  onCheckedChange: action("checked-changed"),
};

// With Custom Styling
export const CustomStyling: StoryFn<CheckboxProps> = Template.bind({});
CustomStyling.args = {
  label: "Custom Styled Checkbox",
  className: "border-purple-500 data-[state=checked]:bg-purple-500",
  onCheckedChange: action("checked-changed"),
};

// Interactive Example with State Management
export const InteractiveExample: StoryFn = () => {
  const [checked, setChecked] = React.useState(false);
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(checked) =>
        setChecked(checked === "indeterminate" ? false : checked)
      }
      label="Interactive Checkbox"
    />
  );
};

// Multiple Checkboxes Group
export const CheckboxGroup: StoryFn = () => {
  const [checkedItems, setCheckedItems] = React.useState({
    option1: false,
    option2: false,
    option3: false,
  });

  const handleChange =
    (key: keyof typeof checkedItems) =>
    (checked: boolean | "indeterminate") => {
      setCheckedItems((prev) => ({
        ...prev,
        [key]: checked === "indeterminate" ? false : checked,
      }));
    };

  return (
    <div className="space-y-2">
      {Object.entries(checkedItems).map(([key, value]) => (
        <Checkbox
          key={key}
          checked={value}
          onCheckedChange={handleChange(key as keyof typeof checkedItems)}
          label={`Option ${key.slice(-1)}`}
        />
      ))}
      <div className="text-sm text-gray-500 mt-2">
        Selected:{" "}
        {Object.entries(checkedItems)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(", ")}
      </div>
    </div>
  );
};

// Form Example
export const FormExample: StoryFn = () => {
  const [formData, setFormData] = React.useState({
    terms: false,
    newsletter: false,
    notifications: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    action("form-submitted")(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Checkbox
          checked={formData.terms}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              terms: checked === "indeterminate" ? false : checked,
            }))
          }
          label="I accept the terms and conditions"
          required
        />
        <Checkbox
          checked={formData.newsletter}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              newsletter: checked === "indeterminate" ? false : checked,
            }))
          }
          label="Subscribe to newsletter"
        />
        <Checkbox
          checked={formData.notifications}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              notifications: checked === "indeterminate" ? false : checked,
            }))
          }
          label="Enable notifications"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Submit Form
      </button>
    </form>
  );
};

// Indeterminate State Example
export const IndeterminateExample: StoryFn = () => {
  const [parent, setParent] = React.useState<boolean | "indeterminate">(false);
  const [children, setChildren] = React.useState({
    child1: false,
    child2: false,
    child3: false,
  });

  React.useEffect(() => {
    const checkedCount = Object.values(children).filter(Boolean).length;
    if (checkedCount === 0) setParent(false);
    else if (checkedCount === Object.keys(children).length) setParent(true);
    else setParent("indeterminate");
  }, [children]);

  const handleParentChange = (checked: boolean | "indeterminate") => {
    setParent(checked);
    setChildren((prev) =>
      Object.keys(prev).reduce(
        (acc, key) => ({
          ...acc,
          [key]: checked === "indeterminate" ? false : checked,
        }),
        {} as typeof children,
      ),
    );
  };

  return (
    <div className="space-y-2">
      <Checkbox
        checked={parent}
        onCheckedChange={handleParentChange}
        label="Select All"
      />
      <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-4">
        {Object.entries(children).map(([key, value]) => (
          <Checkbox
            key={key}
            checked={value}
            onCheckedChange={(checked) =>
              setChildren((prev) => ({
                ...prev,
                [key]: checked === "indeterminate" ? false : checked,
              }))
            }
            label={`Child Checkbox ${key.slice(-1)}`}
          />
        ))}
      </div>
    </div>
  );
};
