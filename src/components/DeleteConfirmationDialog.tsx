import React from "react";
import { Dialog } from "@/components/Dialog";
import { Button } from "@/components/Button";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string; // Name of the entity being deleted (e.g., account, budget)
  description?: string; // Optional additional description
  isDeleting?: boolean;
}

export const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({ isOpen, onClose, onConfirm, entityName, description, isDeleting }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Confirm Delete">
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Are you sure you want to delete <strong>{entityName}</strong>? This
          action cannot be undone.
        </p>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isDeleting}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
