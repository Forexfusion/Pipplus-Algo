import React, { useState } from "react";
import type { Moment } from "moment";
import { db, Timestamp } from "../config/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import type { Trade } from "../types";
import { Form, Input, Button, Select, DatePicker, message } from "antd";
import { TrademarkOutlined } from "@ant-design/icons";
import Card from "antd/es/card";

interface TradeFormProps {
  userId: string;
  onTradeAdded: () => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ userId, onTradeAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const TypedCard = Card as unknown as React.FC<any>;

  interface TradeFormValues {
    assetName: string;
    tradeType: "BUY" | "SELL";
    quantity: number;
    tradeDate: Moment;
    pricePerUnit: number;
    fees?: number;
  }

  const onFinish = async (values: TradeFormValues) => {
    setLoading(true);
    const {
      assetName,
      tradeType,
      quantity,
      pricePerUnit,
      tradeDate,
      fees = 0,
    } = values;

    let totalCost = 0;
    let totalProceeds = 0;

    if (tradeType === "BUY") {
      totalCost = quantity * pricePerUnit + fees;
    } else {
      totalProceeds = quantity * pricePerUnit - fees;
    }

    const newTrade: Omit<Trade, "id"> = {
      userId,
      assetName,
      tradeType,
      quantity,
      pricePerUnit,
      tradeDate: Timestamp.fromDate(tradeDate.toDate()),
      fees,
      totalCost,
      totalProceeds,
    };

    try {
      await addDoc(collection(db, "trades"), newTrade);
      message.success("Trade added successfully!");
      form.resetFields();
      onTradeAdded();
    } catch (error) {
      console.error("Error adding trade: ", error);
      message.error("Error adding trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TypedCard title="Add New Trade" bordered={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ tradeType: "BUY", fees: 0 }}
      >
        <Form.Item
          name="assetName"
          label="Asset Name"
          rules={[{ required: true, message: "Please input asset name!" }]}
        >
          <Input placeholder="e.g., AAPL" prefix={<TrademarkOutlined />} />
        </Form.Item>

        <Form.Item
          name="tradeType"
          label="Trade Type"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: "BUY", label: "BUY" },
              { value: "SELL", label: "SELL" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[{ required: true, message: "Please input quantity!" }]}
        >
          <Input type="number" step="any" />
        </Form.Item>

        <Form.Item
          name="pricePerUnit"
          label="Price per Unit"
          rules={[{ required: true, message: "Please input price!" }]}
        >
          <Input type="number" step="any" />
        </Form.Item>

        <Form.Item
          name="tradeDate"
          label="Trade Date"
          rules={[{ required: true, message: "Please select date!" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="fees" label="Fees (optional)">
          <Input type="number" step="any" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Trade
          </Button>
        </Form.Item>
      </Form>
    </TypedCard>
  );
};

export default TradeForm;
