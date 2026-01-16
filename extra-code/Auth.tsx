// Auth page with sign up part as well

import React, { useState } from "react";
import { auth } from "../config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Form, Input, Button, Card, Tabs, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { themeColors } from "../config/theme"; // <- Import theme

interface AuthProps {
  onLoginSuccess: (userId: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      let userCredential;
      if (activeTab === "login") {
        userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
      }
      if (userCredential.user) {
        onLoginSuccess(userCredential.user.uid);
        message.success(
          `Successfully ${activeTab === "login" ? "logged in" : "signed up"}!`
        );
      }
    } catch (err: any) {
      message.error(err.message);
      console.error(err);
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
        }}
        bodyStyle={{ padding: "2rem" }}
      >
        {/* Logo at Top */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2>Forex Algo</h2>
          <h2 style={{ color: themeColors.textPrimary, marginBottom: 0 }}>
            Welcome
          </h2>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          tabBarStyle={{ color: themeColors.textSecondary }}
          items={[
            {
              key: "login",
              label: (
                <span style={{ color: themeColors.textSecondary }}>
                  <LoginOutlined />
                  Login
                </span>
              ),
            },
            {
              key: "signup",
              label: (
                <span style={{ color: themeColors.textSecondary }}>
                  <UserAddOutlined />
                  Sign Up
                </span>
              ),
            },
          ]}
        />

        <Form
          name="auth_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          style={{ marginTop: "1rem" }}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              style={{
                backgroundColor: themeColors.backgroundLighter,
                borderColor: themeColors.border,
                color: themeColors.textPrimary,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
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
              icon={
                activeTab === "login" ? <LoginOutlined /> : <UserAddOutlined />
              }
              style={{
                backgroundColor: themeColors.primary,
                borderColor: themeColors.primary,
              }}
            >
              {activeTab === "login" ? "Log in" : "Sign up"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Auth;
