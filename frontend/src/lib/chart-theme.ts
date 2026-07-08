import type { ChartOptions } from 'chart.js';

/** Read a CSS custom property off :root at call time so charts track theme. */
export const cssVar = (name: string, fallback = ''): string => {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

/** The brand mono stack, resolved live (Geist Mono + fallbacks). */
export const chartFontFamily = (): string =>
  cssVar('--font-geist-mono', 'ui-monospace') + ', ui-monospace, monospace';

/** Translucent fill from a series color. */
export const tint = (color: string, pct = 16): string =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

/**
 * Branded base options for a line chart: mono ticks, hairline grid, and a
 * surface-elevated tooltip. Callers spread this and add scales/series.
 */
export function baseLineOptions(): ChartOptions<'line'> {
  const text = cssVar('--text-secondary', '#94a3b8');
  const muted = cssVar('--text-muted', '#64748b');
  const grid = cssVar('--border', 'rgba(140,190,255,0.13)');
  const surface = cssVar('--surface-elevated', '#0e1c33');
  const primary = cssVar('--brand-primary', '#56d9ff');
  const font = chartFontFamily();

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    elements: {
      line: { tension: 0.35, borderWidth: 2 },
      point: { radius: 0, hoverRadius: 4, hitRadius: 8 },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: text,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 6,
          boxHeight: 6,
          padding: 18,
          font: { family: font, size: 11 },
        },
      },
      tooltip: {
        backgroundColor: surface,
        borderColor: grid,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleColor: text,
        titleFont: { family: font, size: 11, weight: 'normal' },
        bodyColor: cssVar('--text-primary', '#eaf5ff'),
        bodyFont: { family: font, size: 12 },
        footerColor: primary,
        footerFont: { family: font, size: 10 },
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        ticks: { color: muted, font: { family: font, size: 10 }, maxRotation: 0, autoSkipPadding: 24 },
        grid: { color: grid },
        border: { color: grid },
      },
    },
  };
}

/** Axis tick/title/grid styling for a value axis, keyed to the theme. */
export function valueAxis(title: string, position: 'left' | 'right', drawGrid = true) {
  const muted = cssVar('--text-muted', '#64748b');
  const grid = cssVar('--border', 'rgba(140,190,255,0.13)');
  const font = chartFontFamily();
  return {
    type: 'linear' as const,
    display: true,
    position,
    title: {
      display: true,
      text: title.toUpperCase(),
      color: muted,
      font: { family: font, size: 10 },
    },
    ticks: { color: muted, font: { family: font, size: 10 } },
    grid: { color: grid, drawOnChartArea: drawGrid },
    border: { color: grid },
  };
}
