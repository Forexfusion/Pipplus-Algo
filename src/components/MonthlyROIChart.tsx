// src/components/MonthlyROIChart.tsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { format } from "date-fns";
import { themeColors } from "../config/theme";
import type { Trade } from "../types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Props = {
  trades: Trade[];
};

const MonthlyROIChart: React.FC<Props> = ({ trades }) => {
  const monthlyData: {
    [month: string]: { profit: number };
  } = {};

  // Step 1: Group by Month & Sum Profits
  trades.forEach((trade) => {
    const date = new Date(trade.date);
    const month = format(date, "MMM yyyy");

    if (!monthlyData[month]) {
      monthlyData[month] = { profit: 0 };
    }

    monthlyData[month].profit += trade.profit || 0;
  });

  // Step 2: Sort months
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const [aMonth, aYear] = a.split(" ");
    const [bMonth, bYear] = b.split(" ");
    return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
  });

  // Step 3: Calculate ROI on fixed 2000 investment
  const FIXED_INVESTMENT = 2000;
  const labels = sortedMonths;
  const roiValues = sortedMonths.map((month) => {
    const { profit } = monthlyData[month];
    const roi = (profit / FIXED_INVESTMENT) * 100;
    return parseFloat(roi.toFixed(2));
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Monthly ROI (%)",
        data: roiValues,
        backgroundColor: "#00C49F",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: themeColors.textSecondary,
        },
      },
      title: {
        display: true,
        text: "Monthly ROI (%)",
        color: themeColors.textPrimary,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`,
        },
        backgroundColor: themeColors.backgroundLight,
        titleColor: themeColors.textPrimary,
        bodyColor: themeColors.textSecondary,
        borderColor: themeColors.border,
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: { color: themeColors.textSecondary },
        grid: { color: themeColors.border },
      },
      y: {
        ticks: {
          color: themeColors.textSecondary,
          callback: (value: any) => `${value}%`,
        },
        grid: { color: themeColors.border },
      },
    },
  };

  return (
    <div
      className="graph-card"
      style={{
        width: "100%",
        height: "400px",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: themeColors.chartBackground,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      <Bar options={options} data={data} />
    </div>
  );
};

export default MonthlyROIChart;
