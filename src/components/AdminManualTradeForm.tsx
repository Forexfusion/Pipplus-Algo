// src/components/AdminManualTradeForm.tsx
import React, { useState, useEffect } from "react";
import { Button, Form, Input, Select, DatePicker, message, Card } from "antd";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import dayjs from "dayjs";

const { Option } = Select;

const AdminManualTradeForm: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "userProfiles"));
      const fetchedClients: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedClients.push({ uid: doc.id, ...doc.data() });
      });
      setClients(fetchedClients);
    };

    fetchClients();
  }, []);

  const onFinish = async (values: any) => {
    const {
      uid,
      date,
      symbol,
      tradeType,
      quantity,
      entry,
      exit,
    } = values;

    const profit = ((exit - entry) * quantity).toFixed(2);

    const trade = {
      date: dayjs(date).format("YYYY-MM-DD"),
      symbol,
      tradeType,
      quantity,
      entry,
      exit,
      profit: parseFloat(profit),
    };

    setLoading(true);
    try {
      const tradeId = `${Date.now()}`;
      await setDoc(doc(db, `userTrades/${uid}/trades`, tradeId), trade);
      message.success("Trade added successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to add trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Manual Trade Entry" style={{ marginTop: 24 }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="uid" label="Select Client" rules={[{ required: true }]}> 
          <Select placeholder="Select a client">
            {clients.map((client) => (
              <Option key={client.uid} value={client.uid}>
                {client.clientName || client.emailId}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="date" label="Trade Date" rules={[{ required: true }]}> 
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="symbol" label="Segment" rules={[{ required: true }]}> 
          <Input placeholder="e.g. XAUUSD or EURUSD" />
        </Form.Item>

        <Form.Item name="tradeType" label="Type" rules={[{ required: true }]}> 
          <Select>
            <Option value="BUY">BUY</Option>
            <Option value="SELL">SELL</Option>
          </Select>
        </Form.Item>

        <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}> 
          <Input type="number" placeholder="Enter quantity" />
        </Form.Item>

        <Form.Item name="entry" label="Entry Price" rules={[{ required: true }]}> 
          <Input type="number" step="0.01" />
        </Form.Item>

        <Form.Item name="exit" label="Exit Price" rules={[{ required: true }]}> 
          <Input type="number" step="0.01" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Trade
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AdminManualTradeForm;
