'use client';

import { DayPicker, DayPickerProps } from 'react-day-picker';
import { useRef } from 'react';

// Extend props to include DayPicker's own props for type safety
type StyledDayPickerProps = DayPickerProps & {
  className?: string;
};

export const StyledDayPicker = ({ className = '', ...props }: StyledDayPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // This component now acts as a simple wrapper.
  // All styling will be passed via props from BookingCalendar.
  return (
    <div ref={containerRef} className={className}>
      <DayPicker {...props} />
    </div>
  );
}; 