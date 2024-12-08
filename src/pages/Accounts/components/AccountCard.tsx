import React, { useState } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import type { Account } from "@/types";
import EditAccountModal from "./EditAccountModal";
import { deleteAccount } from "@/services/AccountService";
import { Dialog } from "@/components/Dialog";
import { Button } from "@/components/Button"; // Your custom Button component
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

interface AccountCardProps {
  account: Account;
  icon: React.FC<{ className?: string }>;
  onUpdate: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, icon: Icon, onUpdate }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteAccount(account.id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (showDropdown) {
      setShowDropdown(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="p-2 bg-teal-50 rounded-lg">
                <Icon className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                <p className="text-sm text-gray-500">{account.bankName}</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="p-2 hover:bg-gray-50 rounded-lg"
                aria-label="Account options"
              >
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>
              {showDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowEditModal(true);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Account
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowDeleteDialog(true);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-900">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: account.currency,
              }).format(account.balance)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {account.lastSync
                ? `Last updated: ${new Date(account.lastSync).toLocaleDateString()}`
                : "No sync data available"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Account Modal */}
      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        account={account}
        onSave={onUpdate}
      />

      <DeleteConfirmationDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={handleDelete} entityName={account.name} />
    </>
  );
};

export default AccountCard;
