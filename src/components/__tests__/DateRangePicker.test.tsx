import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { DateRangePicker } from "../DateRangePicker";
import { testAccessibility } from "@/test/test-utils";

const defaultProps = {
  dateRange: {
    startDate: "2024-01-01T00:00:00.000Z",
    endDate: "2024-01-31T00:00:00.000Z",
  },
  onChange: vi.fn(),
};

describe("DateRangePicker Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Basic Rendering Tests
  describe("Basic Rendering", () => {
    it("renders both date inputs", () => {
      render(<DateRangePicker {...defaultProps} />);
      expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
      expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    });

    it("renders with initial date values", () => {
      render(<DateRangePicker {...defaultProps} />);
      expect(screen.getByText("Jan 01, 2024")).toBeInTheDocument();
      expect(screen.getByText("Jan 31, 2024")).toBeInTheDocument();
    });

    it("renders label when provided", () => {
      render(<DateRangePicker {...defaultProps} label="Date Range" />);
      expect(screen.getByText("Date Range")).toBeInTheDocument();
    });

    it("renders calendar icons", () => {
      render(<DateRangePicker {...defaultProps} />);
      const calendarIcons = screen.getAllByTestId(/Calender-icon/i);
      expect(calendarIcons).toHaveLength(2);
    });
  });

  // Calendar Popup Tests
  describe.skip("Calendar Popup Behavior", () => {
    it("opens start date calendar on click", async () => {
      render(<DateRangePicker {...defaultProps} />);
      await userEvent.click(screen.getByLabelText("Start Date"));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/January 2024/i)).toBeInTheDocument();
    });

    it("closes start date calendar when clicking outside", async () => {
      render(<DateRangePicker {...defaultProps} />);

      await userEvent.click(screen.getByLabelText("Start Date"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click outside
      fireEvent.click(document.body);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes start calendar when opening end calendar", async () => {
      render(<DateRangePicker {...defaultProps} />);

      await userEvent.click(screen.getByLabelText("Start Date"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText("End Date"));
      // Should now show end date calendar
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getAllByRole("dialog")).toHaveLength(1);
    });
  });

  // Date Selection Tests
  describe.skip("Date Selection", () => {
    it("calls onChange when selecting start date", async () => {
      render(<DateRangePicker {...defaultProps} />);

      await userEvent.click(screen.getByLabelText("Start Date"));

      // Find and click a date
      const dateButton = screen.getByRole("button", {
        name: /January 15, 2024/i,
      });
      await userEvent.click(dateButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.dateRange,
        startDate: expect.stringContaining("2024-01-15"),
      });
    });

    it("calls onChange when selecting end date", async () => {
      render(<DateRangePicker {...defaultProps} />);

      await userEvent.click(screen.getByLabelText("End Date"));

      const dateButton = screen.getByRole("button", {
        name: /January 20, 2024/i,
      });
      await userEvent.click(dateButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.dateRange,
        endDate: expect.stringContaining("2024-01-20"),
      });
    });

    it("prevents selecting end date before start date", async () => {
      render(<DateRangePicker {...defaultProps} />);

      await userEvent.click(screen.getByLabelText("End Date"));

      const beforeStartDate = screen.getByRole("button", {
        name: new RegExp(defaultProps.dateRange.startDate.split("T")[0], "i"),
      });
      expect(beforeStartDate).toBeDisabled();
    });
  });

  // Custom Header Tests
  describe("Custom Header", () => {
    it("renders month navigation buttons", async () => {
      render(<DateRangePicker {...defaultProps} />);

      await userEvent.click(screen.getAllByTestId("Calender-icon")[0]);

      expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();
    });

    it.skip("navigates to previous month when clicking previous button", async () => {
      render(<DateRangePicker {...defaultProps} />);

      await userEvent.click(screen.getAllByTestId("Calender-icon")[0]);
      await userEvent.click(screen.getByLabelText(/previous month/i));

      expect(screen.getByText(/December 2023/i)).toBeInTheDocument();
    });

    it.skip("navigates to next month when clicking next button", async () => {
      render(<DateRangePicker {...defaultProps} />);

      await userEvent.click(screen.getAllByTestId("Calender-icon")[0]);
      await userEvent.click(screen.getByLabelText(/next month/i));

      expect(screen.getByText(/February 2024/i)).toBeInTheDocument();
    });
  });

  // Disabled State Tests
  describe("Disabled State", () => {
    it.skip("renders in disabled state correctly", () => {
      render(<DateRangePicker {...defaultProps} disabled />);

      expect(screen.getByLabelText("Start Date")).toBeDisabled();
      expect(screen.getByLabelText("End Date")).toBeDisabled();
    });

    it("prevents calendar from opening when disabled", async () => {
      render(<DateRangePicker {...defaultProps} disabled />);

      await userEvent.click(screen.getByLabelText("Start Date"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  // Error and Helper Text Tests
  describe("Error and Helper Text", () => {
    it("displays error message when provided", () => {
      const errorMessage = "Invalid date range";
      render(<DateRangePicker {...defaultProps} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toHaveClass("font-medium");
    });

    it("displays helper text when provided", () => {
      const helperText = "Select a date range";
      render(<DateRangePicker {...defaultProps} helperText={helperText} />);

      expect(screen.getByText(helperText)).toBeInTheDocument();
      expect(screen.getByText(helperText)).toHaveClass("text-gray-500");
    });

    it("prioritizes error over helper text", () => {
      render(
        <DateRangePicker
          {...defaultProps}
          error="Error message"
          helperText="Helper text"
        />,
      );

      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
    });
  });

  // Animation Tests
  describe.skip("Animation Behavior", () => {
    it("animates error message appearance", async () => {
      const { rerender } = render(<DateRangePicker {...defaultProps} />);

      rerender(<DateRangePicker {...defaultProps} error="Error message" />);

      const errorMessage = screen.getByText("Error message");
      expect(errorMessage).toHaveClass("motion-initial");

      await waitFor(() => {
        expect(errorMessage).toHaveClass("motion-animate");
      });
    });
  });

  // Accessibility Tests
  describe.skip("Accessibility", () => {
    it("meets WCAG guidelines", async () => {
      const { container } = render(<DateRangePicker {...defaultProps} />);
      await testAccessibility(container);
    });

    it("handles keyboard navigation", async () => {
      render(<DateRangePicker {...defaultProps} />);

      const startDateInput = screen.getByLabelText("Start Date");
      startDateInput.focus();
      expect(document.activeElement).toBe(startDateInput);

      // Tab to end date
      await userEvent.tab();
      expect(document.activeElement).toBe(screen.getByLabelText("End Date"));
    });

    it("announces date changes to screen readers", async () => {
      render(<DateRangePicker {...defaultProps} />);

      await userEvent.click(screen.getByLabelText("Start Date"));
      const dateButton = screen.getByRole("button", {
        name: /January 15, 2024/i,
      });
      await userEvent.click(dateButton);

      expect(screen.getByText("Jan 15, 2024")).toHaveAttribute(
        "aria-live",
        "polite",
      );
    });

    it("has proper ARIA labels", () => {
      render(<DateRangePicker {...defaultProps} />);

      expect(screen.getByLabelText("Start Date")).toHaveAttribute(
        "aria-label",
        "Start Date",
      );
      expect(screen.getByLabelText("End Date")).toHaveAttribute(
        "aria-label",
        "End Date",
      );
    });
  });
});
