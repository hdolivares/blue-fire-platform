// In frontend/src/components/StyledInput.tsx
import React from 'react';

// This allows our component to accept all the standard props of an HTML input
type InputProps = React.ComponentProps<'input'>;

export const StyledInput = (props: InputProps) => {
  return (
    <input
      {...props} // This applies all the passed-in props like type, value, etc.
      className={`mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted transition-all duration-200 hover:border-border-strong focus-ring ${props.className ?? ''}`}
    />
  );
};