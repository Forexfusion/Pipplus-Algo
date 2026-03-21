import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Upload,
  message,
  Table,
  Form,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import * as XLSX from "xlsx";
import { auth, db } from "../config/firebaseConfig";

const AdminPanel = () => {
  const [form] = Form.useForm();
  const [excelData, setExcelData] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ---------------------------------------------
  // CREATE USER MANUALLY
  // ---------------------------------------------
  const handleUserCreate = async (values) => {
    try {
      const { email, password, ...profileData } = values;
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "userProfiles", userCred.user.uid), {
        emailId: email,
        ...profileData,
        mt5AccountId: "",
        mt5Password: "",
        mt5Server: "",
        is2FAEnabled: false,
        displayName: profileData.clientName,

        // ✅ NEW FIELD (Client API code)
        clientApiCode: "",
      });

      message.success("User created successfully!");
      form.resetFields();
    } catch (error) {
      console.error("Error creating user:", error);
      message.error("Failed to create user.");
    }
  };

  // ---------------------------------------------
  // EXCEL UPLOAD HANDLER
  // ---------------------------------------------
  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(jsonData);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  // ---------------------------------------------
  // UPLOAD EXCEL DATA TO FIRESTORE
  // ---------------------------------------------
  const uploadExcelToFirestore = async () => {
    setUploading(true);
    try {
      for (const row of excelData) {
        const userId = row.userId || row.emailId;

        await setDoc(
          doc(db, "userProfiles", userId),
          {
            ...row,

            // ✅ Ensure API code exists even if Excel doesn't have it
            clientApiCode: row.clientApiCode || "",
          },
          { merge: true }
        );
      }
      message.success("Excel data uploaded successfully!");
    } catch (err) {
      console.error(err);
      message.error("Failed to upload excel data");
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------------------------
  // TABLE COLUMNS
  // ---------------------------------------------
  const columns = [
    { title: "Client Name", dataIndex: "clientName" },
    { title: "Email", dataIndex: "emailId" },
    { title: "Mobile", dataIndex: "mobileNumber" },
    { title: "City", dataIndex: "city" },
    { title: "DOB", dataIndex: "dob" },
    { title: "Service", dataIndex: "serviceName" },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* --------------------------------------- */}
      {/* MANUAL USER CREATION */}
      {/* --------------------------------------- */}
      <Card title="Create User Manually" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleUserCreate}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item name="clientName" label="Client Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="mobileNumber" label="Mobile Number">
            <Input />
          </Form.Item>

          <Form.Item name="dob" label="Date of Birth">
            <Input />
          </Form.Item>

          <Form.Item name="city" label="City">
            <Input />
          </Form.Item>

          <Form.Item name="serviceName" label="Service Name">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create User
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* --------------------------------------- */}
      {/* EXCEL UPLOAD SECTION */}
      {/* --------------------------------------- */}
      <Card title="Bulk Upload via Excel" style={{ marginBottom: 24 }}>
        <Upload
          beforeUpload={handleExcelUpload}
          showUploadList={false}
          accept=".xlsx"
        >
          <Button icon={<UploadOutlined />}>Select Excel File</Button>
        </Upload>

        <Button
          type="primary"
          disabled={excelData.length === 0}
          loading={uploading}
          onClick={uploadExcelToFirestore}
          style={{ marginTop: 16 }}
        >
          Upload to Firestore
        </Button>

        <Table
          columns={columns}
          dataSource={excelData}
          rowKey="emailId"
          style={{ marginTop: 24 }}
        />
      </Card>
    </div>
  );
};

export default AdminPanel;
