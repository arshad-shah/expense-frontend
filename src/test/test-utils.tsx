// src/test/test-utils.tsx
import { render, RenderOptions } from "@testing-library/react";
import { axe, toHaveNoViolations, JestAxeConfigureOptions } from "jest-axe";
import { expect } from "vitest";

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Default axe options
const axeOptions: JestAxeConfigureOptions = {
  rules: {
    // Add specific rule configurations here
    "color-contrast": { enabled: true },
    "aria-allowed-attr": { enabled: true },
    "aria-required-attr": { enabled: true },
    "aria-valid-attr": { enabled: true },
    "button-name": { enabled: true },
  },
};

// Custom render function that includes axe testing capability
const customRender: (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => ReturnType<typeof render> & { axeTest: () => Promise<void> } = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return {
    ...render(ui, options),
    // Add async axe test helper
    async axeTest() {
      const results = await axe(document.body, axeOptions);
      expect(results).toHaveNoViolations();
    },
  };
};

// Helper to test specific accessibility rules
const testAccessibility = async (
  element: Element,
  specificRules?: string[],
) => {
  const options = specificRules
    ? {
        ...axeOptions,
        rules: specificRules.reduce(
          (acc, rule) => ({ ...acc, [rule]: { enabled: true } }),
          {},
        ),
      }
    : axeOptions;

  const results = await axe(element, options);
  expect(results).toHaveNoViolations();
};

export * from "@testing-library/react";
export { customRender as render, testAccessibility };
