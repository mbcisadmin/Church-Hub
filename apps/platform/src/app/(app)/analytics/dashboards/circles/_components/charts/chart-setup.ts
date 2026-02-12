import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

// Disable all Chart.js data animations so charts render instantly.
// Without this, bars grow from the y-axis and doughnut segments sweep
// in, which looks like "sliding in from the left" when tabs with
// display:none charts first become visible.
ChartJS.defaults.animation = { duration: 0 };
(ChartJS.defaults.transitions as Record<string, unknown>).resize = {
  animation: { duration: 0 },
};

export { ChartJS };
