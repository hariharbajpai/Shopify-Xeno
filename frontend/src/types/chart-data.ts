// types/chart-data.ts
export interface TimePoint {
  timestamp: number;
  value: number;
  date?: string;
}

export interface CategoryPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MultiSeriesPoint {
  date: string;
  timestamp: number;
  [key: string]: number | string;
}

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
}