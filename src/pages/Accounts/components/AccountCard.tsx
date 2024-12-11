import React, { useState } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import type { Account } from "@/types";
import EditAccountModal from "./EditAccountModal";
import { deleteAccount } from "@/services/AccountService";
import { Button } from "@/components/Button";
import { Dropdown, DropdownItemType } from "@/components/Dropdown";
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

  const dropdownItems: DropdownItemType[] = [
    {
      icon: Edit2,
      label: "Edit Account",
      onClick: () => {
        setShowDropdown(false);
        setShowEditModal(true);
      },
    },
    {
      icon: Trash2,
      label: "Delete Account",
      onClick: () => {
        setShowDropdown(false);
        setShowDeleteDialog(true);
      },
      variant: "danger",
    }
  ];

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
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                aria-label="Account options"
                size="icon"
                variant="ghost"
                className="hover:bg-gray-100"
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </Button>
              
              <Dropdown
                show={showDropdown}
                onClose={() => setShowDropdown(false)}
                items={dropdownItems}
                position="right"
                size="md"
                width="md"
                className="shadow-xl shadow-gray-200/20"
              />
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

      <DeleteConfirmationDialog 
        isOpen={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)} 
        onConfirm={handleDelete} 
        entityName={account.name}
      />
    </>
  );
};

export default AccountCard;