import React, { Component, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Wrapper to use hooks with class component
const ErrorFallback = ({
  error,
  resetError,
}: {
  error: Error | null;
  resetError: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Top accent border with gradient */}
        <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

        <div className="p-6">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Something Went Wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {error?.message ||
                "An unexpected error occurred while rendering this page."}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mx-auto max-w-sm">
              <code className="text-sm text-gray-700 break-all">
                {error?.name}
              </code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                navigate("/");
                resetError();
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={() => resetError()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>

          {/* Support Text */}
          <p className="mt-6 text-center text-sm text-gray-500">
            If this error persists, please contact support
          </p>
        </div>
      </div>
    </div>
  );
};

class PageErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Page Error:", error);
    console.error("Error Info:", errorInfo);

    // You can log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback error={this.state.error} resetError={this.resetError} />
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
