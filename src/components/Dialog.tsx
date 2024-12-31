import { X } from "lucide-react";
import { Button } from "./Button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-full">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Dialog panel */}
        <div className="relative z-50 w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
