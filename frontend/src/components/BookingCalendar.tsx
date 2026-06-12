'use client';

import { Card } from './ui/Card';
import { useEffect, useMemo } from 'react';
import styles from './BookingCalendar.module.css';
import { StyledDayPicker } from './StyledDayPicker';
import 'react-day-picker/dist/style.css';

interface BookingCalendarProps {
  soldUntilDate?: Date;
  daysToPurchase: number;
  avgDailyWaterProduction?: number;
}

export const BookingCalendar = ({ soldUntilDate, daysToPurchase, avgDailyWaterProduction = 1000 }: BookingCalendarProps) => {

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const today = startOfToday();
  const firstAvailableDay = soldUntilDate && new Date(soldUntilDate) >= today 
    ? addDays(new Date(soldUntilDate), 1) 
    : today;
  
  const selectedRange = useMemo(() => {
    const startDate = new Date(firstAvailableDay);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + daysToPurchase - 1);
    
    return {
      from: startDate,
      to: endDate,
    };
  }, [firstAvailableDay, daysToPurchase]);

  const disabledDays = { before: firstAvailableDay };
  const totalWaterProduction = daysToPurchase * avgDailyWaterProduction;

  // Create a unique key for the DayPicker to force re-render
  const calendarKey = `calendar-${daysToPurchase}-${selectedRange.from.getTime()}-${selectedRange.to.getTime()}`;

  return (
    <Card variant="frosted" className="p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4">Production Schedule</h3>
      
      <div className="mb-6 p-4 bg-surface-muted rounded-lg border border-border">
        <div className="text-center">
          <p className="text-sm text-secondary mb-2">Your Selected Period</p>
          <p className="text-lg font-bold text-text-primary mb-1">
            {formatDate(selectedRange.from)} - {formatDate(selectedRange.to)}
          </p>
          <p className="text-sm text-success font-medium">
            {daysToPurchase} days • ~{totalWaterProduction.toLocaleString()}L total production
          </p>
          <p className="text-xs text-secondary mt-1">
            Avg: {avgDailyWaterProduction.toLocaleString()}L/day
          </p>
        </div>
      </div>
      
      <div className="flex justify-center flex-grow">
        <StyledDayPicker
          key={calendarKey}
          mode="range"
          disabled={disabledDays}
          selected={selectedRange}
          month={firstAvailableDay}
          showOutsideDays
          fixedWeeks
          className={styles.calendar_container}
          classNames={{
            month: styles.month,
            head_cell: styles.head_cell,
            cell: styles.cell,
            day: styles.day,
            day_today: styles.day_today,
            day_outside: styles.day_outside,
            day_disabled: styles.day_disabled,
            day_range_start: styles.day_range_start,
            day_range_end: styles.day_range_end,
            day_range_middle: styles.day_range_middle,
            caption: styles.caption,
            caption_label: styles.caption_label,
            nav_button: styles.nav_button,
          }}
        />
      </div>
      
      <div className="mt-auto pt-6 space-y-3 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2 bg-surface-muted" />
          <span className="text-secondary">Already Purchased</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2 gradient-brand" />
          <span className="text-secondary">Your Potential Purchase</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2 bg-success" />
          <span className="text-secondary">Available for Purchase</span>
        </div>
      </div>
    </Card>
  );
};