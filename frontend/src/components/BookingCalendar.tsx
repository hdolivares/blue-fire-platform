'use client';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { addDays, startOfToday } from 'date-fns';

/**
 * @interface BookingCalendarProps
 * @description Defines the properties our calendar component accepts.
 */
interface BookingCalendarProps {
  soldUntilDate?: Date;
  daysToPurchase: number;
}

/**
 * @component BookingCalendar
 * @description Displays a calendar showing sold-out dates and a user's potential purchase range.
 */
export const BookingCalendar = ({ soldUntilDate, daysToPurchase }: BookingCalendarProps) => {
  // Determine the first available day for purchase
  const today = startOfToday();
  const firstAvailableDay = soldUntilDate && new Date(soldUntilDate) >= today 
    ? addDays(new Date(soldUntilDate), 1) 
    : today;
  
  // Calculate the user's potential purchase range based on the slider
  const selectedRange = {
    from: firstAvailableDay,
    to: addDays(firstAvailableDay, daysToPurchase - 1),
  };

  // Dates before the first available day are disabled
  const disabledDays = { before: firstAvailableDay };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Production Schedule</h3>
      <div className="card-frosted p-2 inline-block">
        <DayPicker
          mode="range"
          disabled={disabledDays}
          selected={selectedRange}
          month={firstAvailableDay}
          showOutsideDays
          fixedWeeks
        />
      </div>
       <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2 bg-gray-600" /> Already Purchased</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2 bg-gradient-accent" /> Your Potential Purchase</div>
      </div>
    </div>
  );
};