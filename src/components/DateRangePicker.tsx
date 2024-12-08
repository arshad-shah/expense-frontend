import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays } from "lucide-react";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  label?: string;
  dateRange: DateRange;
  onChange: (updatedDateRange: DateRange) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label = "Date Range",
  dateRange,
  onChange,
  error,
  helperText,
  disabled = false,
}) => {
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      onChange({
        ...dateRange,
        startDate: date.toISOString(),
      });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      onChange({
        ...dateRange,
        endDate: date.toISOString(),
      });
    }
  };

  const CustomInput = React.forwardRef<HTMLDivElement, any>(
    ({ value, onClick }, ref) => (
      <div
        ref={ref}
        onClick={disabled ? undefined : onClick}
        className={`
          relative flex h-10 w-full cursor-pointer items-center rounded-lg 
          border border-gray-200 bg-white px-3.5 py-2 shadow-sm
          hover:border-indigo-400 hover:bg-gray-50/50
          focus-within:border-indigo-500 focus-within:ring-2 
          focus-within:ring-indigo-500/20 
          disabled:cursor-not-allowed disabled:opacity-50
          disabled:hover:border-gray-200
          ${error ? "border-red-500 ring-red-500/20" : ""}
          transition duration-200 ease-out
        `}
      >
        <span className="text-gray-400 mr-2">
          <CalendarDays className="h-4 w-4" />
        </span>
        <span className="flex-1 text-sm text-gray-900">{value}</span>
      </div>
    )
  );

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Date Pickers Container */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm text-gray-600">
            Start Date
          </label>
          <DatePicker
            selected={new Date(dateRange.startDate)}
            onChange={handleStartDateChange}
            customInput={<CustomInput label="Start Date" />}
            dateFormat="MMM dd, yyyy"
            disabled={disabled}
            wrapperClassName="w-full"
            calendarClassName="shadow-xl border border-gray-200 rounded-lg"
            popperClassName="z-50"
            dayClassName={date =>
              `hover:bg-indigo-50 rounded-md transition-colors mx-0.5
              ${date.toISOString().split('T')[0] === dateRange.startDate.split('T')[0]
                ? 'bg-indigo-100 text-indigo-900'
                : ''}`
            }
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm text-gray-600">
            End Date
          </label>
          <DatePicker
            selected={new Date(dateRange.endDate)}
            onChange={handleEndDateChange}
            customInput={<CustomInput label="End Date" />}
            dateFormat="MMM dd, yyyy"
            disabled={disabled}
            wrapperClassName="w-full"
            calendarClassName="shadow-xl border border-gray-200 rounded-lg"
            popperClassName="z-50"
            dayClassName={date =>
              `hover:bg-indigo-50 rounded-md transition-colors mx-0.5
              ${date.toISOString().split('T')[0] === dateRange.endDate.split('T')[0]
                ? 'bg-indigo-100 text-indigo-900'
                : ''}`
            }
            minDate={new Date(dateRange.startDate)}
          />
        </div>
      </div>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <div className="mt-1.5">
          {error ? (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}

      {/* Custom CSS for DatePicker styling */}
      <style>{`
        .react-datepicker {
          font-family: inherit;
        }
        .react-datepicker__header {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          padding-top: 1rem;
        }
        .react-datepicker__day-name {
          color: #6b7280;
          font-weight: 500;
        }
        .react-datepicker__day {
          padding: 0.3rem;
          margin: 0.2rem;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #818cf8;
          color: white;
        }
        .react-datepicker__day--selected {
          background-color: #6366f1;
          color: white;
        }
        .react-datepicker__day--in-range {
          background-color: #e0e7ff;
          color: #4f46e5;
        }
        .react-datepicker__triangle {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;