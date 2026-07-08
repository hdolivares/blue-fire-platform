/**
 * Generated cross-section of a BlueFire unit. Every element carries a
 * `data-dg` hook so the Process section can choreograph it with GSAP.
 * Rendered fully lit by default (static illustration); the pinned
 * sequence dims/relights groups as the visitor scrolls.
 */
export default function MachineDiagram({ gid = "dg" }: { gid?: string }) {
  const DIM = "#40608c";
  const ICE = "#b7d9f7";
  const CYAN = "#56d9ff";
  const EMBER = "#ff7847";

  return (
    <svg
      viewBox="0 0 768 470"
      fill="none"
      aria-label="Cross-section of the BlueFire machine: air intake, condenser coil, filtration, and heat recovery"
      role="img"
    >
      <defs>
        <linearGradient id={`${gid}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={CYAN} stopOpacity="0.75" />
          <stop offset="1" stopColor="#1467d2" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${gid}-hot`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff9a62" />
          <stop offset="1" stopColor={EMBER} />
        </linearGradient>
        <filter id={`${gid}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>{`
        .${gid}-label {
          font-family: var(--bf-font-mono, monospace);
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          fill: #6d8fbc;
        }
      `}</style>

      {/* chassis */}
      <g data-dg="chassis">
        <rect x="150" y="70" width="430" height="380" rx="16" stroke={DIM} strokeWidth="1.5" fill="rgba(11,27,54,0.35)" />
        <path d="M150 320 H580" stroke={DIM} strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="565" cy="435" r="3" fill={CYAN} data-dg="led" />
      </g>

      {/* intake grille + airflow */}
      <g data-dg="grille" stroke={DIM} strokeWidth="1.5" strokeLinecap="round">
        <path d="M84 160 H136" />
        <path d="M78 184 H136" />
        <path d="M72 208 H136" />
        <path d="M72 232 H136" />
        <path d="M78 256 H136" />
        <path d="M84 280 H136" />
      </g>
      <text className={`${gid}-label`} x="72" y="140" data-dg="labelin">
        Humid air in
      </text>
      <g data-dg="air">
        {[168, 196, 224, 252, 280].map((y, i) => (
          <circle key={y} data-dg="airdot" data-i={i} cx="52" cy={y - 4} r="2.6" fill={ICE} opacity="0.85" />
        ))}
      </g>

      {/* fan */}
      <g data-dg="fan">
        <circle cx="235" cy="222" r="46" stroke={DIM} strokeWidth="1.5" />
        <g data-dg="fanblades" stroke={ICE} strokeWidth="1.5">
          <path d="M235 184c10 14 10 26 0 40c-10-14-10-26 0-40Z" />
          <path d="M235 184c10 14 10 26 0 40c-10-14-10-26 0-40Z" transform="rotate(120 235 222)" />
          <path d="M235 184c10 14 10 26 0 40c-10-14-10-26 0-40Z" transform="rotate(240 235 222)" />
        </g>
        <circle cx="235" cy="222" r="6" fill={ICE} />
      </g>

      {/* condenser cold plate + coil */}
      <rect data-dg="coldplate" x="298" y="108" width="176" height="204" rx="10" fill="rgba(86,217,255,0.05)" stroke={DIM} strokeWidth="1" strokeDasharray="3 5" />
      <text className={`${gid}-label`} x="300" y="98" data-dg="labelcoil">
        Condenser coil
      </text>
      <path
        data-dg="coil"
        d="M312 128 H444 a20 20 0 0 1 0 40 H312 a20 20 0 0 0 0 40 H444 a20 20 0 0 1 0 40 H312 a20 20 0 0 0 0 40 H444"
        stroke={DIM}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* droplets falling off the coil */}
      <g data-dg="drops">
        {[330, 356, 384, 412, 438].map((x, i) => (
          <circle key={x} data-dg="drop" data-i={i} cx={x} cy="318" r="2.6" fill={CYAN} />
        ))}
      </g>

      {/* tank + water */}
      <g data-dg="tank">
        <rect x="300" y="350" width="160" height="62" rx="10" stroke={DIM} strokeWidth="1.5" />
        <rect data-dg="water" x="306" y="356" width="148" height="50" rx="6" fill={`url(#${gid}-water)`} opacity="0.9" />
        <text className={`${gid}-label`} x="302" y="340">
          Tank
        </text>
      </g>

      {/* compressor (top right of the cabinet) */}
      <g data-dg="comp">
        <rect x="492" y="120" width="72" height="70" rx="10" stroke={DIM} strokeWidth="1.5" />
        <circle cx="528" cy="155" r="17" stroke={DIM} strokeWidth="1.5" />
        <circle cx="528" cy="155" r="6" fill="rgba(255,120,71,0.85)" data-dg="compcore" />
        <path d="M492 155 H474" stroke={DIM} strokeWidth="1.5" strokeDasharray="3 4" />
        <text className={`${gid}-label`} x="490" y="110">
          Compressor
        </text>
      </g>

      {/* filtration train */}
      <g data-dg="filters">
        {[482, 510, 538].map((x, i) => (
          <rect key={x} data-dg={`filter${i}`} x={x} y="356" width="20" height="50" rx="6" stroke={DIM} strokeWidth="1.5" fill="rgba(86,217,255,0.06)" />
        ))}
        <text className={`${gid}-label`} x="480" y="340">
          Filtration
        </text>
      </g>

      {/* output runs */}
      <path data-dg="pipecool" pathLength={1} d="M386 108 V80 H628" stroke={ICE} strokeWidth="2.5" strokeLinecap="round" />
      <path data-dg="pipehot" pathLength={1} d="M564 155 H628" stroke={`url(#${gid}-hot)`} strokeWidth="2.5" strokeLinecap="round" />
      <path data-dg="pipewater" pathLength={1} d="M460 383 H628" stroke={CYAN} strokeWidth="2.5" strokeLinecap="round" />

      {/* output glyphs */}
      <g data-dg="glyphcool" stroke={ICE} strokeWidth="1.6" strokeLinecap="round">
        <path d="M664 58 v44 M645 69 l38 22 M645 91 l38 -22" />
        <text className={`${gid}-label`} x="640" y="124" stroke="none">
          Cool dry air
        </text>
      </g>
      <g data-dg="glyphhot" stroke={EMBER} strokeWidth="1.6" strokeLinecap="round">
        <path d="M650 172c0-10 7-14 7-22c3 5 7 9 7 16a7 7 0 0 1-14 6Z" transform="translate(0,-14)" />
        <path d="M672 140 v32 M682 146 v26" />
        <text className={`${gid}-label`} x="640" y="196" stroke="none">
          Hot water 60°C
        </text>
      </g>
      <g data-dg="glyphwater">
        <path
          d="M664 352s-11 12.6-11 20.4a11 11 0 1 0 22 0c0-7.8-11-20.4-11-20.4Z"
          stroke={CYAN}
          strokeWidth="1.6"
          fill="rgba(86,217,255,0.12)"
        />
        <text className={`${gid}-label`} x="638" y="410">
          Drinking water
        </text>
      </g>
    </svg>
  );
}
