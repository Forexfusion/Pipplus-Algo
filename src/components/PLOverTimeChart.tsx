import React from "react";
import { Line } from "react-chartjs-2";
import type { Trade } from "../types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { themeColors, chartColors } from "../config/theme";

// Utility function to format as "MMM YYYY"
const formatMonth = (date: Date): string =>
  date.toLocaleString("default", { month: "short", year: "numeric" });

interface PLOverTimeChartProps {
  trades: Trade[];
}

const PLOverTimeChart: React.FC<PLOverTimeChartProps> = ({ trades }) => {
  // Group trades by month
  const monthlyPL: { [month: string]: number } = {};

  trades.forEach((trade) => {
    const date = new Date(trade.tradeDate);
    const month = formatMonth(date);

    const profit = trade.profit || 0;

    if (!monthlyPL[month]) {
      monthlyPL[month] = 0;
    }

    monthlyPL[month] += profit;
  });

  // Sort months
  const sortedMonths = Object.keys(monthlyPL).sort((a, b) => {
    const [aMonth, aYear] = a.split(" ");
    const [bMonth, bYear] = b.split(" ");
    const dateA = new Date(`${aMonth} 1, ${aYear}`);
    const dateB = new Date(`${bMonth} 1, ${bYear}`);
    return dateA.getTime() - dateB.getTime();
  });

  const labels: string[] = [];
  const profitData: number[] = [];
  sortedMonths.forEach((month) => {
  labels.push(month);
  profitData.push(parseFloat(monthlyPL[month].toFixed(2)));
});


  if (labels.length === 0) {
    return <div style={{ color: "white" }}>No data to show</div>;
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Monthly P/L",
        data: profitData,
        borderColor: "lime",
        backgroundColor: "rgba(0,255,0,0.1)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: chartColors.point,
        pointBorderColor: chartColors.pointBorder,
        pointRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: themeColors.textSecondary,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "P/L Over Time",
        color: themeColors.textPrimary,
        font: {
          size: 16,
          weight: "500",
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: themeColors.backgroundLight,
        titleColor: themeColors.textPrimary,
        bodyColor: themeColors.textSecondary,
        borderColor: themeColors.border,
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: themeColors.border,
          drawBorder: false,
        },
        ticks: {
          color: themeColors.textTertiary,
        },
      },
      y: {
        grid: {
          color: themeColors.border,
          drawBorder: false,
        },
        ticks: {
          color: themeColors.textTertiary,
        },
      },
    },
  };

  return (
    <div
      className="graph-card"
      style={{
        height: "400px",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: themeColors.chartBackground,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      <Line options={options} data={data} />
    </div>
  );
};

export default PLOverTimeChart;
