// In frontend/src/components/StyledInput.tsx
import React from 'react';

// This allows our component to accept all the standard props of an HTML input
type InputProps = React.ComponentProps<'input'>;

export const StyledInput = (props: InputProps) => {
  return (
    <input
      {...props} // This applies all the passed-in props like type, value, etc.
      className="mt-1 block w-full bg-white/20 rounded-md border-white/20 border transition-all duration-200 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/75"
    />
  );
};