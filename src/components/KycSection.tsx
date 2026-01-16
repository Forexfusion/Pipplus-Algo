// Inside KycSection.tsx
import React, { useState } from "react";
import { Card, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "../config/firebaseConfig";

const KycSection: React.FC = () => {
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!aadhaarFrontFile || !aadhaarBackFile) {
      message.error("Please upload both front and back of Aadhaar Card.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      setUploading(true);
      const frontRef = ref(storage, `kyc/${user.uid}/aadhaar-front.jpg`);
      const backRef = ref(storage, `kyc/${user.uid}/aadhaar-back.jpg`);

      await uploadBytes(frontRef, aadhaarFrontFile);
      await uploadBytes(backRef, aadhaarBackFile);

      const frontUrl = await getDownloadURL(frontRef);
      const backUrl = await getDownloadURL(backRef);

      console.log("Uploaded URLs:", frontUrl, backUrl);
      message.success("Aadhaar uploaded successfully.");
    } catch (err) {
      console.error(err);
      message.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card title="KYC Upload" style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <p><strong>Upload Aadhaar Front</strong></p>
        <Upload
          beforeUpload={(file) => {
            setAadhaarFrontFile(file);
            return false;
          }}
          showUploadList={{ showRemoveIcon: true }}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Select Aadhaar Front</Button>
        </Upload>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p><strong>Upload Aadhaar Back</strong></p>
        <Upload
          beforeUpload={(file) => {
            setAadhaarBackFile(file);
            return false;
          }}
          showUploadList={{ showRemoveIcon: true }}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Select Aadhaar Back</Button>
        </Upload>
      </div>

      <Button type="primary" loading={uploading} onClick={handleUpload}>
        {uploading ? "Uploading..." : "Submit KYC"}
      </Button>
    </Card>
  );
};

export default KycSection;
