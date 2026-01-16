import React, { useEffect, useState } from "react";
import { Table, Spin, DatePicker } from "antd";
import { useAuth } from "../hooks/useAuth";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface Trade {
  date: string;
  symbol: string;
  tradeType: string;
  quantity: number;
  entry: number;
  exit: number;
  profit: number;
}

const ClientTradeTable: React.FC = () => {
  const { currentUser } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [filteredDates, setFilteredDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [loading, setLoading] = useState(true);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    const loadClientData = async () => {
      if (!currentUser?.uid) return;

      try {
        const file = await import(`../data/trades/${currentUser.uid}.json`);
        const today = dayjs().format("YYYY-MM-DD");
        const todayTrades = file.default.filter((trade: Trade) => trade.date === today);

        setTrades(file.default);
        setFilteredTrades(todayTrades);
        calculateProfit(todayTrades);
      } catch (err) {
        console.error("Trade file not found for this UID:", err);
        setTrades([]);
        setFilteredTrades([]);
        setTotalProfit(0);
      }

      setLoading(false);
    };

    loadClientData();
  }, [currentUser]);

  const calculateProfit = (data: Trade[]) => {
    const profit = data.reduce((sum, trade) => sum + trade.profit, 0);
    setTotalProfit(profit);
  };

  useEffect(() => {
    if (!filteredDates[0] || !filteredDates[1]) return;

    const [start, end] = filteredDates;
    const filtered = trades.filter((trade) => {
      const tradeDate = dayjs(trade.date, "YYYY-MM-DD");
      return tradeDate.isAfter(start.subtract(1, "day")) && tradeDate.isBefore(end.add(1, "day"));
    });
    setFilteredTrades(filtered);
    calculateProfit(filtered);
  }, [filteredDates, trades]);

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Segment", dataIndex: "symbol", key: "symbol" },
    { title: "Type", dataIndex: "tradeType", key: "tradeType" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Entry Price", dataIndex: "entry", key: "entry" },
    { title: "Exit Price", dataIndex: "exit", key: "exit" },
    {
      title: "Profit",
      dataIndex: "profit",
      key: "profit",
      render: (value: number) => (
        <span style={{ color: value >= 0 ? "lightgreen" : "#ff4d4f" }}>
          ${value.toFixed(2)}
        </span>
      ),
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Client Trade History</h2>
        <h3 style={{ color: "lightgreen" }}>
          Total Profit: ${totalProfit.toFixed(2)}
        </h3>
      </div>

      <div style={{ marginBottom: 16 }}>
        <RangePicker
          format="YYYY-MM-DD"
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setFilteredDates([dates[0], dates[1]]);
            } else {
              setFilteredDates([null, null]);
              setFilteredTrades(trades); // Show all if cleared
              calculateProfit(trades);
            }
          }}
        />
      </div>

      {loading ? (
        <Spin />
      ) : filteredTrades.length > 0 ? (
        <Table dataSource={filteredTrades} columns={columns} pagination={{ pageSize: 5 }} />
      ) : (
        <p>No trade data available for this client.</p>
      )}
    </div>
  );
};

export default ClientTradeTable;
