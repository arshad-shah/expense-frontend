import React from "react";
import { AlertCircle } from "lucide-react";
import Alert from "./Alert";  // Adjust the import path as needed

interface ErrorStateProps {
  /** The error message to display */
  message: string;
  /** Optional callback function to handle retry attempts */
  onRetry?: () => void;
  /** Optional title for the error message */
  title?: string;
  /** Optional support message to show below the alert */
  supportMessage?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  title = "Oops! Something went wrong",
  supportMessage = "If this problem persists, please contact support"
}) => {
  const handleRefresh = React.useCallback((): void => {
    window.location.reload();
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="rounded-full bg-red-100 p-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Alert */}
        <Alert
          variant="error"
          title={title}
          className="w-full shadow-xl border-2"
          actions={[
            {
              label: "Try Again",
              onClick: onRetry || (() => {}),
              variant: "primary"
            },
            {
              label: "Refresh Page",
              onClick: handleRefresh,
              variant: "secondary"
            }
          ]}
        >
          <p className="text-base">{message}</p>
        </Alert>

        {/* Support Message */}
        {supportMessage && (
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">{supportMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;