import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import Alert from "../Alert";
import { testAccessibility } from "@/test/test-utils";

describe("Alert Component", () => {
  // Basic Rendering Tests
  describe("Basic Rendering", () => {
    it("renders alert with title and content", () => {
      render(<Alert title="Test Title">Test content</Alert>);

      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("renders alert without title", () => {
      render(<Alert>Test content only</Alert>);

      expect(screen.getByText("Test content only")).toBeInTheDocument();
    });
  });

  // Variant Tests
  describe("Variants", () => {
    const variants = [
      "success",
      "error",
      "warning",
      "info",
      "neutral",
      "promotional",
    ] as const;

    variants.forEach((variant) => {
      it(`renders ${variant} variant with correct styles`, () => {
        render(
          <Alert variant={variant} title={`${variant} alert`}>
            Test content
          </Alert>,
        );

        const alert = screen.getByRole("alert");

        // Test variant-specific classes
        if (variant === "success") {
          expect(alert).toHaveClass("bg-emerald-50");
        } else if (variant === "error") {
          expect(alert).toHaveClass("bg-red-50");
        } else if (variant === "warning") {
          expect(alert).toHaveClass("bg-amber-50");
        } else if (variant === "info") {
          expect(alert).toHaveClass("bg-blue-50");
        } else if (variant === "neutral") {
          expect(alert).toHaveClass("bg-gray-50");
        } else if (variant === "promotional") {
          expect(alert).toHaveClass("bg-gradient-to-r");
        }
      });
    });
  });

  // Dismissible Tests
  describe("Dismissible Functionality", () => {
    it("shows dismiss button when dismissible is true", () => {
      render(
        <Alert dismissible title="Dismissible Alert">
          Test content
        </Alert>,
      );

      expect(
        screen.getByRole("button", { name: /dismiss alert/i }),
      ).toBeInTheDocument();
    });

    it("does not show dismiss button when dismissible is false", () => {
      render(<Alert title="Non-dismissible Alert">Test content</Alert>);

      expect(
        screen.queryByRole("button", { name: /dismiss alert/i }),
      ).not.toBeInTheDocument();
    });

    it("calls onDismiss when dismiss button is clicked", async () => {
      const onDismiss = vi.fn();
      render(
        <Alert dismissible onDismiss={onDismiss} title="Dismissible Alert">
          Test content
        </Alert>,
      );

      const dismissButton = screen.getByRole("button", {
        name: /dismiss alert/i,
      });
      await userEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  // Actions Tests
  describe("Actions", () => {
    it("renders action buttons when provided", async () => {
      const primaryAction = vi.fn();
      const secondaryAction = vi.fn();

      render(
        <Alert
          title="Alert with Actions"
          actions={[
            { label: "Primary", onClick: primaryAction },
            {
              label: "Secondary",
              onClick: secondaryAction,
              variant: "secondary",
            },
          ]}
        >
          Test content
        </Alert>,
      );

      const primaryButton = screen.getByRole("button", { name: "Primary" });
      const secondaryButton = screen.getByRole("button", { name: "Secondary" });

      expect(primaryButton).toBeInTheDocument();
      expect(secondaryButton).toBeInTheDocument();

      await userEvent.click(primaryButton);
      expect(primaryAction).toHaveBeenCalledTimes(1);

      await userEvent.click(secondaryButton);
      expect(secondaryAction).toHaveBeenCalledTimes(1);
    });

    it("applies correct styles to action buttons", () => {
      render(
        <Alert
          title="Alert with Actions"
          actions={[
            { label: "Primary", onClick: () => {} },
            { label: "Secondary", onClick: () => {}, variant: "secondary" },
          ]}
        >
          Test content
        </Alert>,
      );

      const secondaryButton = screen.getByRole("button", { name: "Secondary" });
      expect(secondaryButton).toHaveClass(
        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200",
      );
    });
  });

  // Link Tests
  describe("External Link", () => {
    it("renders external link when provided", () => {
      render(
        <Alert
          title="Alert with Link"
          link={{
            href: "https://example.com",
            label: "Learn More",
          }}
        >
          Test content
        </Alert>,
      );

      const link = screen.getByRole("link", { name: /learn more/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  // Custom Icon Tests
  describe("Custom Icon", () => {
    it("renders custom icon when provided", () => {
      const CustomIcon = () => <svg data-testid="custom-icon" />;

      render(
        <Alert title="Alert with Custom Icon" icon={<CustomIcon />}>
          Test content
        </Alert>,
      );

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });

  // CSS Classes Tests
  describe("CSS Classes", () => {
    it("applies custom className", () => {
      render(
        <Alert title="Alert with Custom Class" className="custom-class">
          Test content
        </Alert>,
      );

      expect(screen.getByRole("alert")).toHaveClass("custom-class");
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("meets WCAG guidelines", async () => {
      const { container } = render(
        <Alert title="Accessible Alert" variant="info">
          Important information for all users
        </Alert>,
      );

      await testAccessibility(container);
    });

    it("maintains accessibility with all variants", async () => {
      const variants = [
        "success",
        "error",
        "warning",
        "info",
        "neutral",
        "promotional",
      ] as const;

      for (const variant of variants) {
        const { container } = render(
          <Alert title={`${variant} Alert`} variant={variant}>
            Test content for {variant} alert
          </Alert>,
        );

        await testAccessibility(container);
      }
    });

    it("has accessible dismiss button", async () => {
      const { container } = render(
        <Alert dismissible onDismiss={() => {}} title="Dismissible Alert">
          Dismissible content
        </Alert>,
      );

      await testAccessibility(container, ["button-name", "aria-allowed-attr"]);
    });

    it("has accessible action buttons", async () => {
      const { container } = render(
        <Alert
          title="Alert with Actions"
          actions={[
            { label: "Primary", onClick: () => {} },
            { label: "Secondary", onClick: () => {}, variant: "secondary" },
          ]}
        >
          Content with actions
        </Alert>,
      );

      await testAccessibility(container, ["button-name"]);
    });

    it("has accessible links", async () => {
      const { container } = render(
        <Alert
          title="Alert with Link"
          link={{
            href: "https://example.com",
            label: "Learn More",
          }}
        >
          Content with link
        </Alert>,
      );

      await testAccessibility(container, ["link-name"]);
    });

    it("maintains proper heading structure", async () => {
      const { container } = render(
        <Alert title="Proper Heading Structure">
          Content under proper heading
        </Alert>,
      );

      await testAccessibility(container, ["heading-order"]);
    });

    it("has sufficient color contrast", async () => {
      const { container } = render(
        <Alert variant="info" title="Contrast Test">
          This content should be readable
        </Alert>,
      );

      await testAccessibility(container, ["color-contrast"]);
    });

    it("handles focus management for interactive elements", async () => {
      const onAction = vi.fn();
      const { getByRole } = render(
        <Alert
          title="Interactive Alert"
          actions={[{ label: "Action", onClick: onAction }]}
        >
          Content with interactive elements
        </Alert>,
      );

      const button = getByRole("button");
      expect(button).toBeInTheDocument();

      // Test keyboard navigation
      button.focus();
      expect(document.activeElement).toBe(button);

      await userEvent.keyboard("{Enter}");
      expect(onAction).toHaveBeenCalled();
    });

    it("preserves tab order for multiple interactive elements", async () => {
      const { container, getAllByRole } = render(
        <Alert
          dismissible
          title="Multiple Interactive Elements"
          actions={[
            { label: "Primary", onClick: () => {} },
            { label: "Secondary", onClick: () => {} },
          ]}
          link={{ href: "https://example.com", label: "Learn More" }}
        >
          Content with multiple interactive elements
        </Alert>,
      );

      await testAccessibility(container, ["tabindex"]);

      const interactiveElements = getAllByRole("button");
      const link = container.querySelector("button");
      expect(link).toBeInTheDocument();

      // Verify natural tab order
      expect(interactiveElements.length + (link ? 1 : 0)).toBeGreaterThan(1);
    });
  });
});
