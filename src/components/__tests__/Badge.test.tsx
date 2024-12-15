import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "../Badge";

describe("Badge Component", () => {
  // Basic Rendering Tests
  describe("Basic Rendering", () => {
    it("renders children correctly", () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText("Test Badge")).toBeInTheDocument();
    });

    it("renders with HTML content", () => {
      render(
        <Badge>
          <span data-testid="inner-content">Complex Content</span>
        </Badge>,
      );
      expect(screen.getByTestId("inner-content")).toBeInTheDocument();
    });
  });

  // Variant Tests
  describe("Variants", () => {
    const variants = ["success", "warning", "danger", "neutral"] as const;

    variants.forEach((variant) => {
      it(`renders ${variant} variant with correct styles`, () => {
        render(<Badge variant={variant}>Test Badge</Badge>);
        const badge = screen.getByText("Test Badge");

        // Test variant-specific classes
        if (variant === "success") {
          expect(badge).toHaveClass("bg-green-50", "text-green-600");
        } else if (variant === "warning") {
          expect(badge).toHaveClass("bg-yellow-50", "text-yellow-600");
        } else if (variant === "danger") {
          expect(badge).toHaveClass("bg-red-50", "text-red-600");
        } else if (variant === "neutral") {
          expect(badge).toHaveClass("bg-gray-50", "text-gray-600");
        }
      });
    });

    it("uses neutral variant as default when no variant is provided", () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText("Default Badge");
      expect(badge).toHaveClass("bg-gray-50", "text-gray-600");
    });
  });

  // Styling Tests
  describe("Styling", () => {
    it("applies base styles to all badges", () => {
      render(<Badge>Styled Badge</Badge>);
      const badge = screen.getByText("Styled Badge");

      expect(badge).toHaveClass(
        "inline-flex",
        "items-center",
        "px-3",
        "py-1",
        "rounded-full",
        "text-sm",
        "font-medium",
      );
    });

    it("accepts and applies custom className", () => {
      render(<Badge className="custom-class">Custom Styled Badge</Badge>);
      const badge = screen.getByText("Custom Styled Badge");
      expect(badge).toHaveClass("custom-class");
    });

    it("combines custom className with default classes", () => {
      render(
        <Badge className="custom-class" variant="success">
          Combined Classes Badge
        </Badge>,
      );
      const badge = screen.getByText("Combined Classes Badge");

      expect(badge).toHaveClass("custom-class");
      expect(badge).toHaveClass("bg-green-50", "text-green-600");
      expect(badge).toHaveClass("inline-flex", "items-center");
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("renders with number content", () => {
      render(<Badge>{42}</Badge>);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("renders with multiple children", () => {
      render(
        <Badge>
          <span>First</span>
          <span>Second</span>
        </Badge>,
      );
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });
  });
});
