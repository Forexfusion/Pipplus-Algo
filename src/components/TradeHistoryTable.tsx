import React, { useState, useEffect } from "react";
import { Table, DatePicker, Input, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { useAuth } from "../hooks/useAuth";

// ✅ Directly import JSON file for admin
import tradesJsonData from "../data/trades.json";

const { RangePicker } = DatePicker;
dayjs.extend(isToday);

interface Trade {
  date: string;
  symbol: string;
  entry: number;
  exit: number;
  profit: number;
  clientName?: string;
}

const TradeHistoryTable: React.FC = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredDates, setFilteredDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [clientFilter, setClientFilter] = useState<string>("");

  const today = dayjs();
  const adminEmail = "admin@pipplustechnology.com";

  useEffect(() => {
    const loadTrades = async () => {
      setLoading(true);
      try {
        let loadedTrades = [];

        if (user?.email === adminEmail) {
          loadedTrades = tradesJsonData.map((trade, index) => ({
            ...trade,
            key: index,
          }));
        } else if (user?.uid) {
          const file = await import(`../data/trades/${user.uid}.json`);
          loadedTrades = file.default.map((trade: any, index: number) => ({
            ...trade,
            key: index,
          }));
        }

        setTrades(loadedTrades);
      } catch (err) {
        console.error("❌ Error loading trades:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, [user]);

  const filteredTrades = trades.filter((trade) => {
    const tradeDate = dayjs(trade.date, "YYYY-MM-DD");
    const matchesDate = !filteredDates[0] || !filteredDates[1]
      ? tradeDate.isSame(today, "day")
      : tradeDate.isAfter(filteredDates[0].subtract(1, "day")) && tradeDate.isBefore(filteredDates[1].add(1, "day"));
    const matchesClient = clientFilter.trim() === "" || (trade.clientName || "").toLowerCase().includes(clientFilter.toLowerCase());
    return matchesDate && matchesClient;
  });

  const totalProfit = filteredTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);

  const columns: ColumnsType<Trade> = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Segment", dataIndex: "symbol", key: "symbol" },
    {
      title: "Entry Price",
      dataIndex: "entry",
      key: "entry",
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      title: "Exit Price",
      dataIndex: "exit",
      key: "exit",
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      title: "Profit",
      dataIndex: "profit",
      key: "profit",
      render: (value: number) => (
        <span style={{ color: value >= 0 ? "lightgreen" : "#ff4d4f" }}>
          ${value.toFixed(2)}
        </span>
      )
    },
    { title: "Client", dataIndex: "clientName", key: "clientName" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Trade History</h2>

      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <RangePicker
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setFilteredDates([dates[0], dates[1]]);
            } else {
              setFilteredDates([null, null]);
            }
          }}
          format="YYYY-MM-DD"
        />

        <Input.Search
          allowClear
          placeholder="Filter by Client Name"
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          style={{ width: 250 }}
        />

        <div style={{ fontSize: "16px", fontWeight: 600 }}>
          Total Profit:{" "}
          <span style={{ color: totalProfit >= 0 ? "lightgreen" : "#ff4d4f" }}>
            ${totalProfit.toFixed(2)}
          </span>
        </div>
      </div>

      {(!filteredDates[0] || !filteredDates[1]) && (
        <p style={{ color: "#aaa", marginBottom: "8px" }}>
          Showing today's trades. Use date filter to view more.
        </p>
      )}

      {loading ? <Spin /> : (
        <Table
          columns={columns}
          dataSource={filteredTrades}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      )}
    </div>
  );
};

export default TradeHistoryTable;
