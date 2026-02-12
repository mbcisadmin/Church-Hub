'use client';

export interface SparklineProps {
  /** Data points (normalized 0-1 or raw values) */
  data: number[];
  /** Width of the SVG */
  width?: number;
  /** Height of the SVG */
  height?: number;
  /** Stroke color (CSS color or Tailwind class won't work here - use actual color) */
  color?: string;
  /** Fill area under the line */
  filled?: boolean;
  /** Fill opacity (0-1) */
  fillOpacity?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Show dot on the last data point */
  showEndDot?: boolean;
  /** Variant: line chart, bar chart, or dots */
  variant?: 'line' | 'bar' | 'dots';
  /** Optional className */
  className?: string;
}

/**
 * Tiny inline SVG sparkline chart.
 * Renders a line, bar, or dot chart from an array of numbers.
 * No external chart library needed.
 *
 * @example
 * ```tsx
 * <Sparkline data={[4, 8, 6, 12, 9, 14, 11]} color="#22c55e" filled />
 * <Sparkline data={[3, 7, 5, 8, 6, 9]} variant="bar" color="#3b82f6" />
 * ```
 */
export function Sparkline({
  data,
  width = 80,
  height = 32,
  color = 'currentColor',
  filled = false,
  fillOpacity = 0.15,
  strokeWidth = 1.5,
  showEndDot = true,
  variant = 'line',
  className,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Padding so dots/bars don't clip
  const padX = 2;
  const padY = 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const normalize = (val: number) => ((val - min) / range) * innerH;

  if (variant === 'bar') {
    const barWidth = Math.max(2, (innerW / data.length) * 0.7);
    const gap = (innerW - barWidth * data.length) / (data.length - 1 || 1);

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        aria-hidden="true"
      >
        {data.map((val, i) => {
          const barH = Math.max(1, normalize(val));
          const x = padX + i * (barWidth + gap);
          const y = height - padY - barH;
          const isLast = i === data.length - 1;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={1}
              fill={color}
              opacity={isLast ? 1 : 0.5}
            />
          );
        })}
      </svg>
    );
  }

  if (variant === 'dots') {
    const stepX = innerW / (data.length - 1);

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        aria-hidden="true"
      >
        {data.map((val, i) => {
          const x = padX + i * stepX;
          const y = height - padY - normalize(val);
          const isLast = i === data.length - 1;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isLast ? 2.5 : 1.5}
              fill={color}
              opacity={isLast ? 1 : 0.4}
            />
          );
        })}
      </svg>
    );
  }

  // Line variant
  const stepX = innerW / (data.length - 1);
  const points = data.map((val, i) => ({
    x: padX + i * stepX,
    y: height - padY - normalize(val),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const fillPath = filled
    ? `${linePath} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`
    : '';

  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      {filled && <path d={fillPath} fill={color} opacity={fillOpacity} />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEndDot && lastPoint && <circle cx={lastPoint.x} cy={lastPoint.y} r={2} fill={color} />}
    </svg>
  );
}
