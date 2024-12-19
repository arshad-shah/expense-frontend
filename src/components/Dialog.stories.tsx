import type { Meta, StoryFn } from "@storybook/react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";
import { useState } from "react";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A modal dialog component for displaying content that requires user attention or interaction.",
      },
    },
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controls the visibility of the dialog",
    },
    title: {
      control: "text",
      description: "Title text displayed at the top of the dialog",
    },
    onClose: {
      action: "closed",
      description: "Callback function when dialog is closed",
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

// Basic Dialog
export const Basic: StoryFn<typeof Dialog> = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Basic Dialog"
      >
        <p className="text-gray-600">
          This is a basic dialog with simple text content.
        </p>
      </Dialog>
    </>
  );
};

// Dialog with Form
export const WithForm: StoryFn<typeof Dialog> = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Form Dialog</Button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Edit Profile"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsOpen(false);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="john@example.com"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

// Confirmation Dialog
export const Confirmation: StoryFn<typeof Dialog> = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete Account
      </Button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setIsOpen(false)}>
              Delete Account
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

// Long Content Dialog
export const LongContent: StoryFn<typeof Dialog> = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>View Terms</Button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Terms of Service"
      >
        <div className="space-y-4">
          <div className="prose max-w-none">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <h4>1. Introduction</h4>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <h4>2. Terms</h4>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur.
            </p>
            <h4>3. Privacy</h4>
            <p>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </p>
            <h4>4. Usage</h4>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

// Dialog with Image
export const WithImage: StoryFn<typeof Dialog> = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>View Image</Button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Preview Image"
      >
        <div className="space-y-4">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src="/api/placeholder/800/450"
              alt="Placeholder"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-sm text-gray-500">
            Image caption or description can go here.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

// Multi-Step Dialog
export const MultiStep: StoryFn<typeof Dialog> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const resetAndClose = () => {
    setIsOpen(false);
    setStep(1);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Start Setup</Button>
      <Dialog
        isOpen={isOpen}
        onClose={resetAndClose}
        title={`Setup Step ${step} of 3`}
      >
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-4">
              <p>Configure your basic settings:</p>
              <input
                type="text"
                placeholder="Username"
                className="w-full rounded-md border p-2"
              />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <p>Choose your preferences:</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>Enable notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>Dark mode</span>
                </label>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <p>Review and confirm your settings:</p>
              <div className="rounded-md bg-gray-50 p-4">
                <p>All settings configured successfully!</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end space-x-3">
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                Previous
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button onClick={resetAndClose}>Finish</Button>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};
