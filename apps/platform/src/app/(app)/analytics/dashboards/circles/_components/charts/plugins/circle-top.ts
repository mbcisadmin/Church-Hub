import type { Plugin, Chart } from 'chart.js';
import { getChartPointStyles } from '../../../_data/constants';

function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

export const circleTopPlugin: Plugin<'bar'> = {
  id: 'circleTop',
  afterDraw(chart: Chart<'bar'>) {
    const opts = chart.options.plugins as Record<string, unknown>;
    const circleTopOpts = opts?.circleTop as { enabled?: boolean } | undefined;
    if (!circleTopOpts?.enabled) return;

    const canvas = chart.canvas;
    const container = canvas.parentElement;
    if (!container) return;

    container.querySelectorAll('.chart-circle-icon').forEach((el) => el.remove());

    // Only create icons after animation has completed
    if (canvas.dataset.ready !== '1') return;

    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    const isDark = isDarkMode();
    const pointStyles = getChartPointStyles(isDark);

    const datasets = chart.data.datasets;
    const isStacked =
      chart.options.scales?.x &&
      'stacked' in (chart.options.scales.x as Record<string, unknown>) &&
      (chart.options.scales.x as Record<string, unknown>).stacked;
    const labelCount = chart.data.labels?.length ?? 0;

    for (let index = 0; index < labelCount; index++) {
      const style = pointStyles[index];
      if (!style) continue;

      let x: number;
      let y: number;

      if (isStacked) {
        // Stacked: use top bar position from last dataset
        const meta = chart.getDatasetMeta(datasets.length - 1);
        const bar = meta.data[index];
        x = bar.x;
        y = bar.y;
      } else {
        // Grouped: center above group, above tallest bar
        let minY = Infinity;
        let sumX = 0;
        for (let d = 0; d < datasets.length; d++) {
          const bar = chart.getDatasetMeta(d).data[index];
          sumX += bar.x;
          if (bar.y < minY) minY = bar.y;
        }
        x = sumX / datasets.length;
        y = minY;
      }
      const size = 24;

      const circleEl = document.createElement('div');
      circleEl.className = 'chart-circle-icon';
      circleEl.style.cssText = `
        position: absolute;
        left: ${x - size / 2}px;
        top: ${y - size - 8}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${style.bg};
        border: 2px ${style.dashed ? 'dashed' : 'solid'} ${style.border};
        pointer-events: none;
        opacity: 0;
        transform: translateY(10px);
        animation: circleIconIn 0.3s ease forwards;
      `;

      const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      iconSvg.setAttribute('width', '12');
      iconSvg.setAttribute('height', '12');
      iconSvg.setAttribute('viewBox', '0 0 24 24');
      iconSvg.setAttribute('fill', 'none');
      iconSvg.setAttribute('stroke', style.iconColor);
      iconSvg.setAttribute('stroke-width', '2');
      iconSvg.setAttribute('stroke-linecap', 'round');
      iconSvg.setAttribute('stroke-linejoin', 'round');

      const iconPaths: Record<string, string> = {
        globe:
          '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
        users:
          '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        church:
          '<path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 22V5l-6-3-6 3v17"/><path d="M12 7v5"/><path d="M10 9h4"/>',
        'heart-handshake':
          '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>',
        star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      };

      iconSvg.innerHTML = iconPaths[style.icon] || '';
      circleEl.appendChild(iconSvg);
      container.appendChild(circleEl);
    }
  },
};
