'use client';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Card } from './ui/Card';

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
  // Simple date utilities without external dependencies
  const startOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

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
    <Card variant="frosted" className="p-6 h-full">
      <h3 className="text-xl font-bold mb-4">Production Schedule</h3>
      <div className="flex justify-center">
        <DayPicker
          mode="range"
          disabled={disabledDays}
          selected={selectedRange}
          month={firstAvailableDay}
          showOutsideDays
          fixedWeeks
          className="text-white"
        />
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2 bg-gray-300" /> 
          <span className="text-secondary">Already Purchased</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2 bg-gradient-accent" /> 
          <span className="text-secondary">Your Potential Purchase</span>
        </div>
      </div>
    </Card>
  );
};