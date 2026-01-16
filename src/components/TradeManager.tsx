// src/components/TradeManager.tsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Button, Card, Form, InputNumber, Modal, Select, Table, Typography, DatePicker, Space, message } from "antd";
import { format, isToday, isThisMonth } from "date-fns";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const { Option } = Select;

interface Trade {
  id?: string;
  tradeDate: any;
  assetName: string;
  tradeType: "BUY" | "SELL";
  quantity: number;
  pricePerUnit: number;
}

const TradeManager: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "month">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [form] = Form.useForm();

  const fetchTrades = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "trades"));
    const fetchedTrades = snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    })) as Trade[];
    setTrades(fetchedTrades);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const date = trade.tradeDate?.toDate?.() || new Date(trade.tradeDate);
      if (filter === "today") return isToday(date);
      if (filter === "month") return isThisMonth(date);
      return true;
    });
  }, [trades, filter]);

  const totalPL = filteredTrades.reduce((sum, trade) => {
    const value = (trade.pricePerUnit || 0) * (trade.quantity || 0);
    return trade.tradeType === "BUY" ? sum - value : sum + value;
  }, 0);

  const openModal = (record?: Trade) => {
    if (record) {
      setEditingTrade(record);
      form.setFieldsValue({
        ...record,
        tradeDate: record.tradeDate?.toDate?.() || new Date(record.tradeDate),
      });
    } else {
      form.resetFields();
      setEditingTrade(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "trades", id));
    message.success("Trade deleted");
    fetchTrades();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const tradeData = { ...values, tradeDate: values.tradeDate.toDate() || values.tradeDate };
    if (editingTrade && editingTrade.id) {
      await updateDoc(doc(db, "trades", editingTrade.id), tradeData);
      message.success("Trade updated");
    } else {
      await addDoc(collection(db, "trades"), tradeData);
      message.success("Trade added");
    }
    fetchTrades();
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "tradeDate",
      render: (value: any) => format(value?.toDate?.() || new Date(value), "dd MMM yyyy"),
    },
    { title: "Asset", dataIndex: "assetName" },
    { title: "Type", dataIndex: "tradeType" },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Price", dataIndex: "pricePerUnit" },
    {
      title: "Actions",
      render: (_: any, record: Trade) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id!)} />
        </Space>
      ),
    },
  ];

  return (
    <Card title="Trade Manager" extra={
      <Space>
        <Select value={filter} onChange={(val) => setFilter(val)} style={{ width: 140 }}>
          <Option value="all">All</Option>
          <Option value="today">Today</Option>
          <Option value="month">This Month</Option>
        </Select>
        <Button icon={<PlusOutlined />} type="primary" onClick={() => openModal()}>
          Add Trade
        </Button>
      </Space>
    }>
      <Title level={5}>
        Total P/L:{" "}
        <Text type={totalPL >= 0 ? "success" : "danger"}>
          ${totalPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </Text>
      </Title>

      <Table
        dataSource={filteredTrades}
        columns={columns}
        rowKey={(record) => record.id!}
        loading={loading}
        pagination={{ pageSize: 6 }}
      />

      <Modal
        title={editingTrade ? "Edit Trade" : "Add Trade"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="tradeDate" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="assetName" label="Asset" rules={[{ required: true }]}>
            <Select>
              <Option value="XAUUSD">XAUUSD</Option>
              <Option value="US30">US30</Option>
              <Option value="BTCUSD">BTCUSD</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tradeType" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="BUY">BUY</Option>
              <Option value="SELL">SELL</Option>
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="pricePerUnit" label="Price/Unit" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TradeManager;
