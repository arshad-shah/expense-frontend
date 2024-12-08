import React from "react";

interface EmptyStateProps {
  heading?: string; // Optional heading
  message: string;  // Message to display
  action?: React.ReactNode; // Optional action (e.g., button or link)
}

const EmptyState: React.FC<EmptyStateProps> = ({ heading, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
      {heading && <p className=" font-semibold text-gray-800 mb-2">{heading}</p>}
      <p className="text-gray-600">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
