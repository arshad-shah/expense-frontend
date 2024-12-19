import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";
import { testAccessibility } from "@/test/test-utils";

describe("Button Component", () => {
  // Basic Rendering Tests
  describe("Basic Rendering", () => {
    it("renders children correctly", () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole("button", { name: "Click me" }),
      ).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      render(<Button className="custom-class">Button</Button>);
      expect(screen.getByRole("button")).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });

  // Variant Tests
  describe("Variants", () => {
    const variants = [
      "primary",
      "secondary",
      "outline",
      "danger",
      "success",
      "warning",
      "info",
      "link",
      "ghost",
    ] as const;

    variants.forEach((variant) => {
      it(`renders ${variant} variant with correct styles`, () => {
        render(<Button variant={variant}>Button</Button>);
        const button = screen.getByRole("button");

        // Test variant-specific classes
        if (variant === "primary") {
          expect(button).toHaveClass("from-indigo-600", "to-indigo-700");
        } else if (variant === "secondary") {
          expect(button).toHaveClass("from-gray-100", "to-gray-200");
        } else if (variant === "outline") {
          expect(button).toHaveClass("border-2", "border-indigo-600");
        } else if (variant === "danger") {
          expect(button).toHaveClass("from-red-600", "to-red-700");
        } else if (variant === "success") {
          expect(button).toHaveClass("from-emerald-600", "to-emerald-700");
        } else if (variant === "warning") {
          expect(button).toHaveClass("from-amber-500", "to-amber-600");
        } else if (variant === "info") {
          expect(button).toHaveClass("from-cyan-500", "to-cyan-600");
        } else if (variant === "link") {
          expect(button).toHaveClass("text-indigo-600", "hover:underline");
        } else if (variant === "ghost") {
          expect(button).toHaveClass("bg-transparent", "hover:bg-gray-100");
        }
      });
    });

    it("uses primary variant as default", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("from-indigo-600", "to-indigo-700");
    });
  });

  // Size Tests
  describe("Sizes", () => {
    const sizes = {
      sm: { height: "h-8", text: "text-sm" },
      md: { height: "h-10", text: "text-base" },
      lg: { height: "h-12", text: "text-lg" },
      icon: { height: "h-10", width: "w-10" },
    } as const;

    Object.entries(sizes).forEach(([size, classes]) => {
      it(`renders ${size} size with correct dimensions`, () => {
        render(<Button size={size as keyof typeof sizes}>Button</Button>);
        const button = screen.getByRole("button");
        expect(button).toHaveClass(classes.height);
        if (size === "icon" && "width" in classes) {
          expect(button).toHaveClass(classes.width);
        } else {
          if ("text" in classes) {
            expect(button).toHaveClass(classes.text);
          }
        }
      });
    });

    it("uses md size as default", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10", "text-base");
    });
  });

  // Loading State Tests
  describe("Loading State", () => {
    it("shows loading spinner when isLoading is true", () => {
      render(<Button isLoading>Button</Button>);
      expect(screen.getByRole("button")).toContainElement(
        document.querySelector(".animate-spin"),
      );
    });

    it("hides children content when loading", () => {
      render(<Button isLoading>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-transparent");
      expect(button.querySelector(".opacity-0")).toBeInTheDocument();
    });

    it("disables button when loading", () => {
      render(<Button isLoading>Button</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  // Width Tests
  describe("Width Behavior", () => {
    it("applies full width when fullWidth is true", () => {
      render(<Button fullWidth>Button</Button>);
      expect(screen.getByRole("button")).toHaveClass("w-full");
    });

    it("maintains default width when fullWidth is false", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).not.toHaveClass("w-full");
    });
  });

  // Disabled State Tests
  describe("Disabled State", () => {
    it("renders in disabled state correctly", () => {
      render(<Button disabled>Button</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
      expect(screen.getByRole("button")).toHaveClass("disabled:opacity-50");
    });

    it("prevents click events when disabled", async () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Button
        </Button>,
      );

      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Event Handler Tests
  describe("Event Handlers", () => {
    it("calls onClick handler when clicked", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("handles mouse events correctly", async () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();

      render(
        <Button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          Button
        </Button>,
      );

      const button = screen.getByRole("button");
      await userEvent.hover(button);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      await userEvent.unhover(button);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  // Visual Effects Tests
  describe("Visual Effects", () => {
    it("has ripple effect styles when not loading or link variant", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("after:content-['']", "after:absolute");
    });

    it("does not have ripple effect when loading", () => {
      render(<Button isLoading>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("after:content-['']");
    });

    it("does not have ripple effect with link variant", () => {
      render(<Button variant="link">Button</Button>);
      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("after:content-['']");
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("meets WCAG guidelines", async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      await testAccessibility(container);
    });

    it("maintains accessibility with icon variant", async () => {
      const { container } = render(
        <Button size="icon" aria-label="Menu">
          <svg data-testid="icon" />
        </Button>,
      );
      await testAccessibility(container);
    });

    it("is keyboard navigable", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole("button");
      button.focus();
      expect(document.activeElement).toBe(button);

      await userEvent.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalled();

      await userEvent.keyboard(" ");
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it("has sufficient color contrast", async () => {
      const { container } = render(
        <>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
        </>,
      );
      await testAccessibility(container, ["color-contrast"]);
    });

    it("communicates loading state to screen readers", () => {
      render(
        <Button isLoading aria-label="Submit">
          Button
        </Button>,
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Submit");
      expect(button).toBeDisabled();
    });
  });
});
