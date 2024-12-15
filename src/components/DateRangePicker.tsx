import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  label = "",
  dateRange,
  onChange,
  error,
  helperText,
  disabled = false,
}) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

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
  // Custom header component
  const CustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: any) => (
    <div className="flex items-center justify-between px-4 py-3">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </motion.button>
      
      <h2 className="text-sm font-semibold text-gray-900">
        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </motion.button>
    </div>
  );

  const CustomInput = React.forwardRef<HTMLDivElement, any>(
    ({ value, onClick }, ref) => (
      <motion.div
        ref={ref}
        onClick={disabled ? undefined : onClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          relative flex h-12 w-full cursor-pointer items-center rounded-xl
          border border-gray-200 bg-white px-4 py-2
          hover:border-violet-400 hover:bg-violet-50/30
          focus-within:border-violet-500 focus-within:ring-2 
          focus-within:ring-violet-500/20 
          disabled:cursor-not-allowed disabled:opacity-50
          disabled:hover:border-gray-200
          ${error ? "border-red-500 ring-red-500/20" : ""}
          transition-all duration-200 ease-out
        `}
      >
        <motion.span 
          className="text-violet-500 mr-3"
          whileHover={{ rotate: 15 }}
        >
          <CalendarDays className="h-5 w-5" />
        </motion.span>
        <span className="flex-1 text-sm font-medium text-gray-700">{value}</span>
      </motion.div>
    )
  );

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Label */}
      <AnimatePresence>
        {label && (
          <motion.label
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="block text-base font-semibold text-gray-900"
          >
            {label}
          </motion.label>
        )}
      </AnimatePresence>

      {/* Date Pickers Container */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Start Date
          </label>
          <DatePicker
            selected={new Date(dateRange.startDate)}
            onChange={handleStartDateChange}
            customInput={<CustomInput />}
            dateFormat="MMM dd, yyyy"
            disabled={disabled}
            wrapperClassName="w-full"
            calendarClassName="shadow-2xl border-0 rounded-2xl overflow-hidden"
            popperClassName="z-50"
            renderCustomHeader={CustomHeader}
            open={isStartOpen}
            onCalendarOpen={() => {
              setIsStartOpen(true);
              setIsEndOpen(false);
            }}
            onCalendarClose={() => setIsStartOpen(false)}
            dayClassName={date =>
              `text-sm font-medium hover:bg-violet-50 rounded-lg transition-all mx-0.5 w-9 h-9 flex items-center justify-center
              ${date.toISOString().split('T')[0] === dateRange.startDate.split('T')[0]
                ? 'bg-violet-100 text-violet-900'
                : 'text-gray-900'}`
            }
          >
          </DatePicker>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            End Date
          </label>
          <DatePicker
            selected={new Date(dateRange.endDate)}
            onChange={handleEndDateChange}
            customInput={<CustomInput />}
            dateFormat="MMM dd, yyyy"
            disabled={disabled}
            wrapperClassName="w-full"
            calendarClassName="shadow-2xl border-0 rounded-2xl overflow-hidden"
            popperClassName="z-50"
            renderCustomHeader={CustomHeader}
            open={isEndOpen}
            onCalendarOpen={() => {
              setIsEndOpen(true);
              setIsStartOpen(false);
            }}
            onCalendarClose={() => setIsEndOpen(false)}
            dayClassName={date =>
              `text-sm font-medium hover:bg-violet-50 rounded-lg transition-all mx-0.5 w-9 h-9 flex items-center justify-center
              ${date.toISOString().split('T')[0] === dateRange.endDate.split('T')[0]
                ? 'bg-violet-100 text-violet-900'
                : 'text-gray-700'}`
            }
            minDate={new Date(dateRange.startDate)}
          >
          </DatePicker>
        </div>
      </div>

      {/* Error or Helper Text */}
      <AnimatePresence mode="wait">
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            {error ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-600 flex items-center gap-1.5"
              >
                <svg
                  className="h-4 w-4 flex-shrink-0"
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
                <span className="font-medium">{error}</span>
              </motion.p>
            ) : (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500"
              >
                {helperText}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom CSS for DatePicker styling */}
      <style>{`
        .react-datepicker {
          font-family: inherit;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 1rem;
        }
        
        .react-datepicker__header {
          background-color: white;
          border-bottom: none;
          padding: 0;
        }
        
        .react-datepicker__month-container {
          padding: 0.5rem;
        }

        .react-datepicker__children-container {
          width: 100%;
          margin: 0;
        }
        
        .react-datepicker__day-names {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 0.385rem;
          background-color: #f5f3ff;
          border-radius: 0.8rem;
        }
        
        .react-datepicker__day-name {
          color: #6b7280;
          font-weight: 600;
          font-size: 0.875rem;
          width: 2.25rem;
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
        }
        
        .react-datepicker__month {
          margin: 0;
        }
        
        .react-datepicker__day {
          width: 2.25rem;
          height: 2.25rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        
        .react-datepicker__day:hover {
          background-color: #f5f3ff;
          color: #6d28d9;
        }
        
        .react-datepicker__day--selected {
          background-color: #8b5cf6 !important;
          color: white !important;
          font-weight: 600;
        }
        
        .react-datepicker__day--keyboard-selected {
          background-color: #ddd6fe;
          color: #6d28d9;
        }
        
        .react-datepicker__day--in-range {
          background-color: #f5f3ff;
          color: #6d28d9;
        }
        
        .react-datepicker__day--in-selecting-range {
          background-color: #f5f3ff;
          color: #6d28d9;
        }
        
        .react-datepicker__triangle {
          display: none;
        }
        
        .react-datepicker__current-month {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .react-datepicker__navigation {
          top: 1rem;
        }
        
        .react-datepicker__day--outside-month {
          color: #d1d5db;
        }
      `}</style>
    </motion.div>
  );
};

export default DateRangePicker;