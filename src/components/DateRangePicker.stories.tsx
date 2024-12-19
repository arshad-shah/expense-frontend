import type { Meta, StoryFn } from "@storybook/react";
import { DateRangePicker } from "./DateRangePicker";
import { useState } from "react";

const meta: Meta<typeof DateRangePicker> = {
  title: "UI/DateRangePicker",
  component: DateRangePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A date range picker component for selecting start and end dates.",
      },
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Label text for the date range picker",
    },
    error: {
      control: "text",
      description: "Error message to display",
    },
    helperText: {
      control: "text",
      description: "Helper text to display below the picker",
    },
    disabled: {
      control: "boolean",
      description: "Whether the date range picker is disabled",
    },
    onChange: {
      action: "changed",
      description: "Callback when date range changes",
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateRangePicker>;

export default meta;

// Basic Date Range Picker
export const Basic: StoryFn = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });

  return (
    <DateRangePicker
      label="Select Date Range"
      dateRange={dateRange}
      onChange={setDateRange}
    />
  );
};

// With Predefined Range
export const WithPredefinedRange: StoryFn = () => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  const [dateRange, setDateRange] = useState({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  return (
    <DateRangePicker
      label="Week Range"
      dateRange={dateRange}
      onChange={setDateRange}
      helperText="Showing a week-long range"
    />
  );
};

// With Error State
export const WithError: StoryFn = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });

  return (
    <DateRangePicker
      label="Invalid Range"
      dateRange={dateRange}
      onChange={setDateRange}
      error="End date must be after start date"
    />
  );
};

// Disabled State
export const Disabled: StoryFn = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });

  return (
    <DateRangePicker
      label="Disabled Picker"
      dateRange={dateRange}
      onChange={setDateRange}
      disabled={true}
      helperText="This date range picker is disabled"
    />
  );
};

// With Helper Text
export const WithHelperText: StoryFn = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });

  return (
    <DateRangePicker
      label="Date Range with Helper"
      dateRange={dateRange}
      onChange={setDateRange}
      helperText="Select a date range to view transaction history"
    />
  );
};

// Interactive Example
export const Interactive: StoryFn = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });

  return (
    <div className="space-y-4">
      <DateRangePicker
        label="Interactive Range"
        dateRange={dateRange}
        onChange={setDateRange}
      />
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Selected Range:</p>
        <p className="font-medium">
          Start: {new Date(dateRange.startDate).toLocaleDateString()}
        </p>
        <p className="font-medium">
          End: {new Date(dateRange.endDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

// With Validation
export const WithValidation: StoryFn = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });
  const [error, setError] = useState<string | undefined>();

  const handleChange = (newRange: { startDate: string; endDate: string }) => {
    const start = new Date(newRange.startDate);
    const end = new Date(newRange.endDate);

    if (start > end) {
      setError("Start date cannot be after end date");
    } else if (end.getTime() - start.getTime() > 90 * 24 * 60 * 60 * 1000) {
      setError("Date range cannot exceed 90 days");
    } else {
      setError(undefined);
    }

    setDateRange(newRange);
  };

  return (
    <DateRangePicker
      label="Date Range with Validation"
      dateRange={dateRange}
      onChange={handleChange}
      error={error}
      helperText="Maximum range: 90 days"
    />
  );
};

// Different Formats
export const DifferentFormats: StoryFn = () => {
  const [dateRange1, setDateRange1] = useState({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });

  const [dateRange2, setDateRange2] = useState({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });

  return (
    <div className="space-y-6">
      <DateRangePicker
        label="Short Format"
        dateRange={dateRange1}
        onChange={setDateRange1}
        helperText="Using short date format"
      />

      <DateRangePicker
        label="Full Format"
        dateRange={dateRange2}
        onChange={setDateRange2}
        helperText="Using full date format"
      />
    </div>
  );
};
