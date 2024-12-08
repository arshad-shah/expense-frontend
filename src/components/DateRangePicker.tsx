import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  label?: string;
  dateRange: DateRange;
  onChange: (updatedDateRange: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label = "Date Range",
  dateRange,
  onChange,
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

  return (
    <div className="space-y-6">
      {label && (
        <label className="block text-base font-semibold text-gray-800">
          {label}
        </label>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Start Date
          </label>
          <DatePicker
            selected={new Date(dateRange.startDate)}
            onChange={(date) => handleStartDateChange(date)}
            className="w-full h-12 rounded-lg border border-gray-300 px-4 py-2 text-base shadow focus:border-indigo-600 focus:ring-indigo-600"
            dateFormat="yyyy-MM-dd"
            calendarClassName="custom-calendar"
            dayClassName={() =>
              "hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
            }
            popperClassName="custom-popper"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            End Date
          </label>
          <DatePicker
            selected={new Date(dateRange.endDate)}
            onChange={(date) => handleEndDateChange(date)}
            className="w-full h-12 rounded-lg border border-gray-300 px-4 py-2 text-base shadow focus:border-indigo-600 focus:ring-indigo-600"
            dateFormat="yyyy-MM-dd"
            calendarClassName="custom-calendar"
            dayClassName={() =>
              "hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
            }
            popperClassName="custom-popper"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
