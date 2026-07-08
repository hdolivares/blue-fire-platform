import Link from "next/link";
import { LogoMark } from "./brand/assets";

interface AuthShellProps {
  /** Short mono kicker suffix, e.g. "ACCESS", "CREATE ACCOUNT". */
  kicker?: string;
  children: React.ReactNode;
}

/**
 * Brand atmosphere around the auth forms: logo lockup, a numbered kicker, and
 * a mono footer line, over the app's static navy field. The form card is
 * passed as children (logic untouched).
 */
export function AuthShell({ kicker = "ACCESS", children }: AuthShellProps) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* faint brand glow behind the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 16%, transparent), transparent 62%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-16">
        <Link href="/" className="flex flex-col items-center gap-4" aria-label="BlueFire — home">
          <LogoMark gid="bfAuthMark" className="h-11 w-11" />
          <span
            className="font-display text-lg uppercase tracking-[0.2em] text-text-primary"
            style={{ fontStretch: "116%", fontWeight: 740 }}
          >
            BlueFire
          </span>
        </Link>

        <p className="kicker">
          <b>◇</b> {kicker}
        </p>

        {children}

        <p className="mono-label text-center !tracking-[0.18em]">
          Pure water, out of thin air
        </p>
      </div>
    </main>
  );
}
