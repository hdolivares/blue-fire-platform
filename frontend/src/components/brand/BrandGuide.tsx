'use client';

import { useEffect, useRef, useState, useMemo, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Slider } from '@/components/ui/Slider';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/StatCard';
import { StyledInput } from '@/components/StyledInput';
import { BrandSpinner } from '@/components/BrandSpinner';
import { LogoMark, IconDrop, IconSnow, IconFlame } from '@/components/brand/assets';
import { cssVar, tint, baseLineOptions, valueAxis } from '@/lib/chart-theme';

/* ---- section scaffold ---- */
function Section({
  index,
  label,
  title,
  children,
}: {
  index: string;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="hairline-t py-14">
      <p className="kicker mb-4">
        <b>{index}</b> {label}
      </p>
      <h2 className="display-caps text-3xl md:text-4xl mb-8">{title}</h2>
      {children}
    </section>
  );
}

/* ---- color manifest (token → tailwind utility) ---- */
const COLOR_GROUPS: { group: string; tokens: { name: string; varName: string; util: string }[] }[] = [
  {
    group: 'Surfaces',
    tokens: [
      { name: 'background', varName: '--background', util: 'bg-background' },
      { name: 'surface', varName: '--surface', util: 'bg-surface' },
      { name: 'surface-elevated', varName: '--surface-elevated', util: 'bg-surface-elevated' },
      { name: 'surface-muted', varName: '--surface-muted', util: 'bg-surface-muted' },
    ],
  },
  {
    group: 'Brand',
    tokens: [
      { name: 'brand-primary', varName: '--brand-primary', util: 'bg-brand-primary' },
      { name: 'brand-secondary', varName: '--brand-secondary', util: 'bg-brand-secondary' },
      { name: 'accent', varName: '--accent', util: 'bg-accent' },
    ],
  },
  {
    group: 'Status',
    tokens: [
      { name: 'success', varName: '--success', util: 'text-success' },
      { name: 'warning', varName: '--warning', util: 'text-warning' },
      { name: 'danger', varName: '--danger', util: 'text-danger' },
      { name: 'info', varName: '--info', util: 'text-info' },
    ],
  },
  {
    group: 'Text',
    tokens: [
      { name: 'text-primary', varName: '--text-primary', util: 'text-text-primary' },
      { name: 'text-secondary', varName: '--text-secondary', util: 'text-text-secondary' },
      { name: 'text-muted', varName: '--text-muted', util: 'text-text-muted' },
      { name: 'border', varName: '--border', util: 'border-border' },
    ],
  },
];

function useComputed(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [, force] = useState(0);
  useEffect(() => {
    force((n) => n + 1);
    const obs = new MutationObserver(() => force((n) => n + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  const read = (v: string) =>
    ref.current ? getComputedStyle(ref.current).getPropertyValue(v).trim() : '';
  return { ref, read };
}

function Swatch({
  token,
  read,
}: {
  token: { name: string; varName: string; util: string };
  read: (v: string) => string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="h-16 w-full" style={{ background: `var(${token.varName})` }} />
      <div className="p-3">
        <p className="text-sm text-text-primary font-medium">{token.name}</p>
        <p className="mono-label mt-1 !tracking-[0.06em] normal-case lowercase">{read(token.varName) || token.varName}</p>
        <p className="mono-label mt-0.5 !tracking-[0.06em] normal-case text-text-muted">{token.util}</p>
      </div>
    </div>
  );
}

/* static demo chart using the shared chart-theme */
function ChartSample({ themeKey }: { themeKey: boolean }) {
  const data = useMemo(() => {
    const cyan = cssVar('--brand-primary', '#56d9ff');
    const aqua = cssVar('--brand-secondary', '#19a8e6');
    const ember = cssVar('--accent', '#ff7847');
    const labels = Array.from({ length: 12 }, (_, i) => `D${i + 1}`);
    const wave = (a: number, b: number, c: number) =>
      labels.map((_, i) => +(a + b * Math.sin(i / 1.7 + c) + (i % 3) * 0.4).toFixed(2));
    return {
      labels,
      datasets: [
        { label: 'kWh / L', data: wave(6, 1.4, 0), borderColor: cyan, backgroundColor: tint(cyan, 18), fill: true, yAxisID: 'y' },
        { label: 'Humidity %', data: wave(64, 8, 1), borderColor: aqua, backgroundColor: tint(aqua, 12), borderDash: [5, 4], yAxisID: 'y1' },
        { label: 'Temp °C', data: wave(24, 3, 2), borderColor: ember, backgroundColor: tint(ember, 12), yAxisID: 'y1' },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeKey]);

  const options = useMemo(() => {
    const base = baseLineOptions();
    return { ...base, scales: { ...base.scales, y: valueAxis('kWh / L', 'left', true), y1: valueAxis('Temp / Hum', 'right', false) } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeKey]);

  return <div className="h-72"><Line data={data} options={options} /></div>;
}

export function BrandGuide() {
  const { ref, read } = useComputed([]);
  const [slider, setSlider] = useState(64);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const [replay, setReplay] = useState(0);

  return (
    <div ref={ref} className="min-h-screen pt-24 pb-24">
      <div className="container-main max-w-6xl">
        {/* masthead */}
        <header className="pb-8">
          <div className="flex items-center gap-4 mb-6">
            <LogoMark gid="bfGuide" className="h-12 w-12" />
            <div>
              <p className="kicker"><b>◇</b> Living design system</p>
              <h1 className="display-caps text-4xl md:text-6xl mt-2">BlueFire brand</h1>
            </div>
          </div>
          <p className="serif-italic text-xl text-text-secondary max-w-2xl">
            Water made by heat — a cinematic, thermodynamic identity. Toggle the theme in the
            header to preview every token in both the flagship dark and the ice-paper light.
          </p>
        </header>

        {/* 01 identity */}
        <Section index="01" label="Identity" title="The mark">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-8 flex items-center justify-center bg-[#04070e]">
              <LogoMark gid="bfg1" className="h-20 w-20" />
            </div>
            <div className="rounded-xl border border-border p-8 flex items-center justify-center bg-[#eaf5ff]">
              <LogoMark gid="bfg2" className="h-20 w-20" />
            </div>
            <div className="rounded-xl border border-border p-8 flex flex-col items-center justify-center gap-3 bg-surface">
              <LogoMark gid="bfg3" className="h-10 w-10" />
              <span
                className="font-display uppercase tracking-[0.18em] text-text-primary"
                style={{ fontStretch: '118%', fontWeight: 760 }}
              >
                BlueFire
              </span>
            </div>
          </div>
          <p className="mono-label mt-4 normal-case !tracking-[0.06em] text-text-muted">
            Droplet with a flame at its core. Clearspace = half the mark&apos;s width. Minimum 20px.
          </p>
        </Section>

        {/* 02 color */}
        <Section index="02" label="Color" title="Tokens">
          <div className="space-y-8">
            {COLOR_GROUPS.map((g) => (
              <div key={g.group}>
                <p className="mono-label mb-3">{g.group}</p>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {g.tokens.map((t) => (
                    <Swatch key={t.name} token={t} read={read} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 03 type */}
        <Section index="03" label="Type" title="Typography">
          <div className="space-y-10">
            <div>
              <p className="mono-label mb-3">Display — Archivo, expanded caps</p>
              <p className="display-caps text-5xl md:text-7xl">Pure water</p>
            </div>
            <div>
              <p className="mono-label mb-3">Editorial — Instrument Serif italic</p>
              <p className="serif-italic text-4xl md:text-5xl text-brand-primary">out of thin air</p>
            </div>
            <div>
              <p className="mono-label mb-3">UI — Archivo</p>
              <p className="text-lg text-text-primary max-w-2xl">
                One machine, three utilities. BlueFire condenses drinking water from the air a
                building already moves, then returns the energy as cooling and hot water.
              </p>
            </div>
            <div>
              <p className="mono-label mb-3">Mono — Geist Mono · tabular data</p>
              <p className="font-mono text-2xl tabular-nums text-text-primary tracking-tight">
                10,000 L / DAY&ensp;·&ensp;92.1%&ensp;·&ensp;$72,440
              </p>
            </div>
          </div>
        </Section>

        {/* 04 components */}
        <Section index="04" label="Components" title="Primitives">
          <div className="space-y-10">
            {/* buttons */}
            <div>
              <p className="mono-label mb-4">Buttons</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="error">Error</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>

            {/* badges */}
            <div>
              <p className="mono-label mb-4">Badges</p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="success">Operational</Badge>
                <Badge variant="pending">Seeking funding</Badge>
                <Badge variant="info">Funded</Badge>
                <Badge variant="warning">Review</Badge>
                <Badge variant="error">Closed</Badge>
              </div>
            </div>

            {/* cards */}
            <div>
              <p className="mono-label mb-4">Cards & stats</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Water produced" value="1,600 L/day" icon={<IconDrop className="h-5 w-5" />} trend="▲ 4.2% this week" trendTone="positive" />
                <StatCard title="Heat recovered" value="92.1%" icon={<IconFlame className="h-5 w-5" />} trend="steady" trendTone="neutral" />
                <StatCard title="Cool air" value="32,000 m³/h" icon={<IconSnow className="h-5 w-5" />} trend="▼ 1.1% today" trendTone="negative" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3 mt-4">
                <Card variant="default" className="p-5"><p className="mono-label mb-1">Default</p><p className="text-text-secondary text-sm">Solid surface card.</p></Card>
                <Card variant="frosted" className="p-5"><p className="mono-label mb-1">Frosted</p><p className="text-text-secondary text-sm">Glass over the field.</p></Card>
                <Card variant="gradient" className="p-5"><p className="mono-label mb-1 !text-[color:var(--text-on-brand)] opacity-80">Gradient</p><p className="text-sm">Cyan → aqua, ink text.</p></Card>
              </div>
            </div>

            {/* controls */}
            <div>
              <p className="mono-label mb-4">Controls</p>
              <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
                <div className="space-y-4">
                  <StyledInput placeholder="you@example.com" />
                  <Slider min={0} max={100} value={slider} onChange={setSlider} label="Allocation" showValue />
                </div>
                <div className="space-y-4">
                  <div><p className="mono-label mb-2">Funding — brand</p><ProgressBar value={72} variant="brand" /></div>
                  <div><p className="mono-label mb-2">Uptime — success</p><ProgressBar value={94} variant="success" /></div>
                  <div><p className="mono-label mb-2">Load — accent</p><ProgressBar value={38} variant="accent" /></div>
                </div>
              </div>
            </div>

            {/* empty state */}
            <div>
              <p className="mono-label mb-4">Empty state</p>
              <EmptyState
                title="No positions yet"
                description="Fund a machine to open your first on-chain position."
                icon={<IconDrop className="h-8 w-8" />}
                action={<Button variant="primary">Browse projects</Button>}
              />
            </div>
          </div>
        </Section>

        {/* 05 data */}
        <Section index="05" label="Data" title="Telemetry">
          <Card variant="frosted" className="p-6">
            <p className="kicker mb-4"><b>◇</b> Chart theme</p>
            <ChartSample themeKey={dark} />
          </Card>
          <p className="mono-label mt-4 normal-case !tracking-[0.06em] text-text-muted">
            Cyan is the primary series, aqua is dashed (adjacent hue), ember reads as heat. Mono
            ticks, hairline grid, tabular tooltips.
          </p>
        </Section>

        {/* 06 feedback */}
        <Section index="06" label="Feedback" title="States">
          <div className="space-y-10">
            <div>
              <p className="mono-label mb-4">Toasts</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="success" onClick={() => toast.success('Position claimed — 0.482 ETH')}>Success toast</Button>
                <Button variant="error" onClick={() => toast.error('Transaction reverted')}>Error toast</Button>
                <Button variant="outline" onClick={() => { const id = toast.loading('Depositing revenue…'); setTimeout(() => toast.success('Revenue deposited', { id }), 1600); }}>Loading toast</Button>
              </div>
            </div>
            <div>
              <p className="mono-label mb-4">Loading</p>
              <div className="grid gap-6 sm:grid-cols-2 items-center">
                <div className="flex justify-center rounded-xl border border-border p-8">
                  <BrandSpinner />
                </div>
                <Card variant="default" className="p-6">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-4 h-8 w-40" />
                  <SkeletonText className="mt-4" lines={3} />
                </Card>
              </div>
            </div>
          </div>
        </Section>

        {/* 07 motion */}
        <Section index="07" label="Motion" title="Movement">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => setReplay((n) => n + 1)}>Replay stagger</Button>
            <p className="mono-label normal-case !tracking-[0.06em] text-text-muted">cubic-bezier(0.22, 1, 0.36, 1)</p>
          </div>
          <div key={replay} className="stagger-rise grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Draw', 'Condense', 'Purify', 'Recover', 'Meter', 'Deposit', 'Distribute', 'Claim'].map((s) => (
              <div key={s} className="rounded-lg border border-border bg-surface px-4 py-6 text-center">
                <span className="mono-label">{s}</span>
              </div>
            ))}
          </div>
          <dl className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-2xl">
            {[
              ['UI transitions', '200–300ms'],
              ['Content reveals', '600–1100ms'],
              ['Easing', 'cubic-bezier(0.22, 1, 0.36, 1)'],
              ['Properties', 'opacity + transform only'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between hairline-b pb-2">
                <dt className="mono-label">{k}</dt>
                <dd className="font-mono text-xs text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* 08 voice */}
        <Section index="08" label="Voice" title="Words">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { do: 'Pure water, out of thin air.', dont: '💧 Amazing water from the sky! 🚀' },
              { do: 'One machine, three utilities.', dont: 'Our synergistic solution leverages...' },
              { do: '10,000 L / day', dont: 'Tons and tons of water!!!' },
              { do: 'The cycle returns 92% of its heat.', dont: 'Super eco-friendly and green 🌱' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-px bg-border rounded-lg overflow-hidden border border-border">
                <div className="bg-surface p-4">
                  <p className="mono-label mb-2 text-success">Do</p>
                  <p className="text-sm text-text-primary">{row.do}</p>
                </div>
                <div className="bg-surface p-4">
                  <p className="mono-label mb-2 text-danger">Don&apos;t</p>
                  <p className="text-sm text-text-muted line-through decoration-danger/40">{row.dont}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="serif-italic text-xl text-text-secondary mt-8 max-w-2xl">
            Confident, precise, thermodynamic. Sentence-case in the UI, mono caps for labels. No
            emoji.
          </p>
        </Section>
      </div>
    </div>
  );
}
