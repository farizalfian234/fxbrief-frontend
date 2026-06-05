import {
  ActiveInactiveSplit,
  NewSubscribersPoint,
  ReportVolumePoint,
  RevenuePoint
} from '../models/admin.models';

const NAVY_600 = '#1B4F72';
const NAVY_400 = '#4f7fab';
const ACCENT = '#2563eb';
const GRID = '#e2e8f0';
const TEXT = '#173f5c';

interface ChartConfig {
  data: unknown;
  options: unknown;
}

function baseOptions(extra: Record<string, unknown> = {}): unknown {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: TEXT, font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: GRID },
        ticks: { color: TEXT, font: { size: 11 }, precision: 0 }
      }
    },
    ...extra
  };
}

export function revenueChart(points: RevenuePoint[]): ChartConfig {
  return {
    data: {
      labels: points.map((p) => p.month),
      datasets: [
        {
          data: points.map((p) => p.revenue),
          backgroundColor: NAVY_600,
          borderRadius: 6,
          maxBarThickness: 28
        }
      ]
    },
    options: baseOptions({
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: { parsed: { y: number } }) => `$${ctx.parsed.y.toFixed(2)}`
          }
        }
      }
    })
  };
}

export function newSubscribersChart(points: NewSubscribersPoint[]): ChartConfig {
  return {
    data: {
      labels: points.map((p) => p.month),
      datasets: [
        {
          data: points.map((p) => p.count),
          backgroundColor: ACCENT,
          borderRadius: 6,
          maxBarThickness: 28
        }
      ]
    },
    options: baseOptions()
  };
}

export function activeInactiveChart(split: ActiveInactiveSplit): ChartConfig {
  return {
    data: {
      labels: ['Active', 'Inactive'],
      datasets: [
        {
          data: [split.active, split.inactive],
          backgroundColor: [NAVY_600, NAVY_400],
          borderRadius: 6,
          maxBarThickness: 64
        }
      ]
    },
    options: baseOptions()
  };
}

export function reportVolumeChart(points: ReportVolumePoint[]): ChartConfig {
  return {
    data: {
      labels: points.map((p) => p.forexMarketDate.slice(5)),
      datasets: [
        {
          data: points.map((p) => p.count),
          borderColor: NAVY_600,
          backgroundColor: 'rgba(27, 79, 114, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    },
    options: baseOptions()
  };
}
