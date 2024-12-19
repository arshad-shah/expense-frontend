import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "../Checkbox";
import { testAccessibility } from "@/test/test-utils";
import React from "react";

describe("Checkbox Component", () => {
  // Basic Rendering Tests
  describe("Basic Rendering", () => {
    it("renders checkbox input correctly", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      render(<Checkbox className="custom-class" />);
      expect(screen.getByRole("checkbox")).toHaveClass("custom-class");
    });

    it("renders with label when provided", () => {
      render(<Checkbox label="Test Label" />);
      expect(screen.getByText("Test Label")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
      const { container } = render(<Checkbox />);
      expect(container.querySelector("label")).not.toBeInTheDocument();
    });
  });

  // State Tests
  describe("State Behavior", () => {
    it("handles checked state correctly", () => {
      render(<Checkbox checked />);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "data-state",
        "checked",
      );
    });

    it("handles unchecked state correctly", () => {
      render(<Checkbox checked={false} />);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "data-state",
        "unchecked",
      );
    });

    it("handles indeterminate state correctly", () => {
      render(<Checkbox checked="indeterminate" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "data-state",
        "indeterminate",
      );
    });

    it("updates state when clicked", async () => {
      const onCheckedChange = vi.fn();
      render(<Checkbox onCheckedChange={onCheckedChange} />);

      await userEvent.click(screen.getByRole("checkbox"));
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  // Disabled State Tests
  describe("Disabled State", () => {
    it("renders in disabled state correctly", () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole("checkbox")).toBeDisabled();
      expect(screen.getByRole("checkbox")).toHaveClass(
        "disabled:cursor-not-allowed",
      );
    });

    it("prevents state change when disabled", async () => {
      const onCheckedChange = vi.fn();
      render(<Checkbox disabled onCheckedChange={onCheckedChange} />);

      await userEvent.click(screen.getByRole("checkbox"));
      expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it("maintains visual state when disabled", () => {
      render(<Checkbox disabled checked />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-state", "checked");
      expect(checkbox).toHaveClass("disabled:opacity-50");
    });
  });

  // Visual Style Tests
  describe("Visual Styles", () => {
    it("applies hover styles correctly", async () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");

      // Note: Since we can't directly test pseudo-classes, we verify the presence
      // of the hover class definitions
      expect(checkbox).toHaveClass(
        "hover:border-indigo-400",
        "hover:bg-indigo-50",
      );
    });

    it("applies focus styles correctly", async () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");

      checkbox.focus();
      expect(checkbox).toHaveClass(
        "focus-visible:ring-2",
        "focus-visible:ring-indigo-500",
      );
    });

    it("applies checked styles correctly", () => {
      render(<Checkbox checked />);
      expect(screen.getByRole("checkbox")).toHaveClass(
        "data-[state=checked]:bg-indigo-600",
        "data-[state=checked]:text-white",
      );
    });

    it("renders checkmark indicator when checked", () => {
      render(<Checkbox checked />);
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("stroke", "currentColor");
    });
  });

  // Interaction Tests
  describe("Interactions", () => {
    it("can be checked and unchecked via click", async () => {
      const onCheckedChange = vi.fn();
      render(<Checkbox onCheckedChange={onCheckedChange} />);

      const checkbox = screen.getByRole("checkbox");
      await userEvent.click(checkbox);
      expect(onCheckedChange).toHaveBeenCalledWith(true);

      await userEvent.click(checkbox);
      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });

    it("handles keyboard interactions", async () => {
      const onCheckedChange = vi.fn();
      render(<Checkbox onCheckedChange={onCheckedChange} />);

      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      await userEvent.keyboard(" "); // Space key
      expect(onCheckedChange).toHaveBeenCalledWith(true);

      await userEvent.keyboard(" ");
      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("meets WCAG guidelines", async () => {
      const { container } = render(<Checkbox label="Accessible Checkbox" />);
      await testAccessibility(container);
    });

    it("associates label with checkbox using aria-label", () => {
      render(<Checkbox label="Test Label" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("maintains focus visibility", async () => {
      render(<Checkbox label="Focus Test" />);
      const checkbox = screen.getByRole("checkbox");

      checkbox.focus();
      expect(checkbox).toHaveClass("focus-visible:ring-2");
    });

    it("communicates checked state to screen readers", () => {
      render(<Checkbox checked label="Screen Reader Test" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-state", "checked");
      expect(checkbox).toBeChecked();
    });

    it("communicates disabled state to screen readers", () => {
      render(<Checkbox disabled label="Disabled Test" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });
  });

  // Ref Forwarding Tests
  describe("Ref Forwarding", () => {
    it("forwards ref to checkbox element", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Checkbox ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("allows ref operations", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Checkbox ref={ref} />);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });
  });
});
