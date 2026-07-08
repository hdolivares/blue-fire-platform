import { LogoMark } from './brand/assets';

/** BlueFire loading mark: a pulsing droplet + mono label. Honors reduced
 *  motion via the CSS animation guard in globals.css. */
export function BrandSpinner({
  label = 'Loading',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <LogoMark gid="bfSpinner" className="h-10 w-10 bf-pulse" />
      {label && (
        <span className="mono-label !tracking-[0.28em] animate-pulse">{label}</span>
      )}
    </div>
  );
}
