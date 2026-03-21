// src/components/Auth.tsx
import React, { useState } from "react";
import { auth } from "../config/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined
} from "@ant-design/icons";
import { themeColors } from "../config/theme";

const { Title, Text } = Typography;

interface AuthProps {
  onLoginSuccess: (userId: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
if (userCredential.user) {
  await createProfileIfNotExists(userCredential.user.uid, userCredential.user.email || "");
  message.success("Successfully logged in!");
  onLoginSuccess(userCredential.user.uid);
}
    } catch (err: any) {
      let friendlyMessage = "Login failed. Please check your credentials.";
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          friendlyMessage = "Invalid email or password.";
          break;
        case "auth/invalid-email":
          friendlyMessage = "The email address is not valid.";
          break;
        case "auth/too-many-requests":
          friendlyMessage =
            "Too many failed attempts. Try again later or reset password.";
          break;
        default:
          friendlyMessage = err.message || friendlyMessage;
      }
      console.error("Firebase Auth Error:", err);
      message.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: themeColors.background,
        padding: "2rem",
      }}
    >
      <Card
        style={{
          width: 400,
          backgroundColor: themeColors.cardBackground,
          border: `1px solid ${themeColors.border}`,
          color: themeColors.textPrimary,
          boxShadow: `0 10px 30px -15px ${themeColors.primary}30`,
        }}
        bodyStyle={{ padding: "2rem" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Title level={2} style={{ color: themeColors.textPrimary }}>
            Forex Algo
          </Title>
          <Text style={{ color: themeColors.textSecondary }}>
            Login to access your Dashboard
          </Text>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label={
              <Text style={{ color: themeColors.textLabel }}>
                Email Address
              </Text>
            }
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: themeColors.textSecondary }} />}
              placeholder="you@example.com"
              size="large"
              style={{
                backgroundColor: themeColors.backgroundLighter,
                borderColor: themeColors.border,
                color: themeColors.textPrimary,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <Text style={{ color: themeColors.textLabel }}>
                Password
              </Text>
            }
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: themeColors.textSecondary }} />}
              placeholder="••••••••"
              size="large"
              style={{
                backgroundColor: themeColors.backgroundLighter,
                borderColor: themeColors.border,
                color: themeColors.textPrimary,
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              icon={<LoginOutlined />}
              style={{
                backgroundColor: themeColors.buttonPrimary,
                borderColor: themeColors.buttonPrimary,
                color: themeColors.textPrimary,
                fontWeight: "bold",
              }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Auth;
