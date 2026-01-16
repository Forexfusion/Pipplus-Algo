import React from "react";
import MetricCard from "./MetricCard";
import PLOverTimeChart from "./PLOverTimeChart";

function Overview({ trades, capital }) {
  const totalProfit = trades.reduce((acc, trade) => acc + trade.profit, 0);
  const totalTrades = trades.length;
  const roi =
    capital > 0 ? ((totalProfit / capital) * 100).toFixed(2) : "0.00";

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Profit/Loss"
          value={totalProfit.toFixed(2)}
          icon="💰"
        />
        <MetricCard
          label="Overall ROI"
          value={`${roi} %`}
          icon="📈"
        />
        <MetricCard
          label="Capital"
          value={capital.toLocaleString()}
          icon="🏦"
        />
        <MetricCard
          label="Total Trades"
          value={totalTrades}
          icon="📊"
        />
      </div>

      {trades.length === 0 ? (
        <div className="bg-[#1c1e3a] p-6 rounded-lg text-center text-white">
          No trades yet to display charts. Add some trades in the 'Trades' section.
        </div>
      ) : (
        <PLOverTimeChart data={trades} />
      )}
    </div>
  );
}

export default Overview;
