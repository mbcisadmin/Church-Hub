import type { Plugin, Chart } from 'chart.js';

export const centerTextPlugin: Plugin<'doughnut'> = {
  id: 'centerText',
  afterDraw(chart: Chart<'doughnut'>) {
    const total = chart.data.datasets[0].data.reduce((sum: number, v) => sum + (v as number), 0);
    const ctx = chart.ctx;
    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillStyle = getComputedStyle(chart.canvas).color || '#252525';
    ctx.fillText(total.toLocaleString(), centerX, centerY - 10);

    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = getComputedStyle(chart.canvas).color || '#6b7280';
    ctx.globalAlpha = 0.6;
    ctx.fillText('TOTAL', centerX, centerY + 18);

    ctx.restore();
  },
};
