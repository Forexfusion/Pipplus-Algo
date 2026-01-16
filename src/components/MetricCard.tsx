import React from "react";
import { Card, Statistic, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { themeColors, metricCardColors } from "../config/theme";

const { Text } = Typography;

interface MetricCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  icon,
  color = themeColors.primary,
}) => {
  const isNegative = typeof value === "number" && value < 0;
  const formattedValue =
    typeof value === "number" ? Math.abs(value).toFixed(2) : value;

  return (
    <Card
      variant="borderless" // ✅ Updated
      styles={{
        body: { padding: "16px 24px" }, // ✅ Updated
      }}
      style={{
        background: themeColors.cardBackground,
        border: `1px solid ${themeColors.border}`,
        transition: "all 0.3s ease",
      }}
      hoverable
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: metricCardColors.iconBackground(color),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            transition: "all 0.3s ease",
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            style: {
              fontSize: 18,
              color,
              transition: "all 0.3s ease",
            },
          })}
        </div>
        <Text
          style={{
            color: themeColors.textSecondary,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {title}
        </Text>
      </div>
      <Statistic
        value={formattedValue}
        prefix={
          isNegative ? (
            <ArrowDownOutlined
              style={{
                color: metricCardColors.negative,
                marginRight: 4,
              }}
            />
          ) : (
            <ArrowUpOutlined
              style={{
                color: metricCardColors.positive,
                marginRight: 4,
              }}
            />
          )
        }
        suffix={suffix}
        valueStyle={{
          color:
            typeof value === "number" && value < 0
              ? metricCardColors.negative
              : themeColors.textPrimary,
          fontSize: 24,
          fontWeight: 600,
        }}
      />
    </Card>
  );
};

export default MetricCard;
