import type { Meta, StoryFn } from "@storybook/react";
import { Dropdown, type DropdownItemType } from "./Dropdown";
import {
  Settings,
  Trash,
  User,
  Bell,
  LogOut,
  Share,
  Edit,
  Star,
} from "lucide-react";
import { useState, useRef } from "react";

const meta: Meta<typeof Dropdown> = {
  title: "UI/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible dropdown menu component with support for icons, descriptions, and multiple variants.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[400px] flex items-start justify-center p-20">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropdown>;

export default meta;

// Basic example with interactive state
export const Basic: StoryFn<typeof Dropdown> = () => {
  const [show, setShow] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const items: DropdownItemType[] = [
    {
      label: "Edit",
      icon: Edit,
      onClick: () => console.log("Edit clicked"),
    },
    {
      label: "Share",
      icon: Share,
      onClick: () => console.log("Share clicked"),
    },
    {
      label: "Delete",
      icon: Trash,
      onClick: () => console.log("Delete clicked"),
      variant: "danger",
    },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setShow(true)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
      <Dropdown
        show={show}
        onClose={() => setShow(false)}
        items={items}
        alignTo={buttonRef.current}
      />
    </>
  );
};

// With descriptions
export const WithDescriptions: StoryFn<typeof Dropdown> = () => {
  const [show, setShow] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const items: DropdownItemType[] = [
    {
      label: "Account Settings",
      icon: User,
      description: "Manage your account preferences",
      onClick: () => {},
    },
    {
      label: "Notifications",
      icon: Bell,
      description: "Configure your notifications",
      onClick: () => {},
    },
    {
      label: "Delete Account",
      icon: Trash,
      description: "Permanently delete your account",
      onClick: () => {},
      variant: "danger",
    },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setShow(true)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
      <Dropdown
        show={show}
        onClose={() => setShow(false)}
        items={items}
        alignTo={buttonRef.current}
        width="lg"
      />
    </>
  );
};

// Different sizes
export const Sizes: StoryFn<typeof Dropdown> = () => {
  const [activeSize, setActiveSize] = useState<null | "sm" | "md" | "lg">(null);
  const smallButtonRef = useRef<HTMLButtonElement>(null);
  const mediumButtonRef = useRef<HTMLButtonElement>(null);
  const largeButtonRef = useRef<HTMLButtonElement>(null);

  const items: DropdownItemType[] = [
    {
      label: "Edit Profile",
      icon: Edit,
      onClick: () => {},
    },
    {
      label: "Settings",
      icon: Settings,
      onClick: () => {},
    },
    {
      label: "Logout",
      icon: LogOut,
      onClick: () => {},
      variant: "danger",
    },
  ];

  return (
    <div className="flex gap-4">
      <div>
        <button
          ref={smallButtonRef}
          onClick={() => setActiveSize("sm")}
          className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
        >
          Small
        </button>
        <Dropdown
          show={activeSize === "sm"}
          onClose={() => setActiveSize(null)}
          items={items}
          size="sm"
          alignTo={smallButtonRef.current}
        />
      </div>

      <div>
        <button
          ref={mediumButtonRef}
          onClick={() => setActiveSize("md")}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg"
        >
          Medium
        </button>
        <Dropdown
          show={activeSize === "md"}
          onClose={() => setActiveSize(null)}
          items={items}
          size="md"
          alignTo={mediumButtonRef.current}
        />
      </div>

      <div>
        <button
          ref={largeButtonRef}
          onClick={() => setActiveSize("lg")}
          className="px-5 py-2.5 text-lg bg-white border border-gray-200 rounded-lg"
        >
          Large
        </button>
        <Dropdown
          show={activeSize === "lg"}
          onClose={() => setActiveSize(null)}
          items={items}
          size="lg"
          alignTo={largeButtonRef.current}
        />
      </div>
    </div>
  );
};

// Different positions
export const Positions: StoryFn<typeof Dropdown> = () => {
  const [activePosition, setActivePosition] = useState<null | "left" | "right">(
    null,
  );
  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);

  const items: DropdownItemType[] = [
    {
      label: "Edit Profile",
      icon: Edit,
      onClick: () => {},
    },
    {
      label: "Settings",
      icon: Settings,
      onClick: () => {},
    },
  ];

  return (
    <div className="flex gap-48">
      <div>
        <button
          ref={leftButtonRef}
          onClick={() => setActivePosition("left")}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg"
        >
          Left Aligned
        </button>
        <Dropdown
          show={activePosition === "left"}
          onClose={() => setActivePosition(null)}
          items={items}
          position="left"
          alignTo={leftButtonRef.current}
        />
      </div>

      <div>
        <button
          ref={rightButtonRef}
          onClick={() => setActivePosition("right")}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg"
        >
          Right Aligned
        </button>
        <Dropdown
          show={activePosition === "right"}
          onClose={() => setActivePosition(null)}
          items={items}
          position="right"
          alignTo={rightButtonRef.current}
        />
      </div>
    </div>
  );
};

// With disabled items
export const WithDisabledItems: StoryFn<typeof Dropdown> = () => {
  const [show, setShow] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const items: DropdownItemType[] = [
    {
      label: "Available Action",
      icon: Star,
      onClick: () => {},
    },
    {
      label: "Disabled Action",
      icon: Share,
      onClick: () => {},
      disabled: true,
      description: "This action is not available",
    },
    {
      label: "Another Disabled",
      icon: Trash,
      onClick: () => {},
      variant: "danger",
      disabled: true,
    },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setShow(true)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
      <Dropdown
        show={show}
        onClose={() => setShow(false)}
        items={items}
        alignTo={buttonRef.current}
      />
    </>
  );
};
