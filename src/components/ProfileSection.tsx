// src/components/ProfileSection.tsx
import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  message,
  Upload,
  Descriptions,
  Switch,
  Select,
} from "antd";
import Card from "antd/es/card";
import Avatar from "antd/es/avatar";
import Typography from "antd/es/typography";
import Divider from "antd/es/divider";
import {
  UserOutlined,
  EditOutlined,
  CloseOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  updateProfile,
  type Auth,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebaseConfig";
import { themeColors } from "../config/theme";

const { Title, Text } = Typography;
const { Option } = Select;

interface ProfileSectionProps {
  currentUser: User;
  auth: Auth;
  themeColors: typeof themeColors;
  kycStatus: string;
  onNavigateToKyc: () => void;
  onProfileUpdate?: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  currentUser,
  themeColors,
  kycStatus,
  onNavigateToKyc,
  onProfileUpdate,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.photoURL || "");
  const [displayName, setDisplayName] = useState<string>(currentUser.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState({
    mt5AccountId: "",
    mt5Server: "",
    mt5Password: "",
    brokerEmail: "",
    brokerPassword: "",
    is2FAEnabled: false,
    clientName: "",
    mobileNumber: "",
    dob: "",
    city: "",
    serviceName: "",
    kycStatus: "pending",

    // ✅ NEW FIELD
    clientApiCode: "",
  });

  // ✅ FETCH PROFILE
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      try {
        const userProfileRef = doc(db, "userProfiles", currentUser.uid);
        const docSnap = await getDoc(userProfileRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData((prev) => ({
            ...prev,
            mt5AccountId: data.mt5AccountId || "",
            mt5Server: data.mt5Server || "",
            mt5Password: data.mt5Password || "",
            brokerEmail: data.brokerEmail || "",
            brokerPassword: data.brokerPassword || "",
            is2FAEnabled: data.is2FAEnabled || false,
            clientName: data.clientName || "",
            mobileNumber: data.mobileNumber || "",
            dob: data.dob || "",
            city: data.city || "",
            serviceName: data.serviceName || "",
            kycStatus: data.kycStatus || "pending",

            // ✅ LOAD EXISTING API CODE
            clientApiCode: data.clientApiCode || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  // ✅ SAVE PROFILE
  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile(currentUser, { displayName });

      await setDoc(
        doc(db, "userProfiles", currentUser.uid),
        {
          displayName,
          ...userData,
        },
        { merge: true }
      );

      message.success("Profile updated");
      setIsEditing(false);
      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async ({ file }: any) => {
    const storageRef = ref(storage, `avatars/${currentUser.uid}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    await updateProfile(currentUser, { photoURL: downloadUrl });
    await setDoc(doc(db, "userProfiles", currentUser.uid), {
      photoURL: downloadUrl,
    }, { merge: true });

    setAvatarUrl(downloadUrl);
    message.success("Profile picture updated");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDisplayName(currentUser.displayName || "");
  };

  return (
    <Card
      title="Profile Information"
      bordered={false}
      style={{ background: themeColors.cardBackground }}
      actions={
        !isEditing
          ? [
              <Button
                key="edit"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                style={{
                  background: themeColors.buttonPrimary,
                  borderColor: themeColors.buttonPrimary,
                }}
              >
                Edit Profile
              </Button>,
            ]
          : [
              <Button
                key="cancel"
                icon={<CloseOutlined />}
                onClick={handleCancelEdit}
                style={{
                  borderColor: themeColors.border,
                  color: themeColors.textSecondary,
                }}
              >
                Cancel
              </Button>,
              <Button
                key="save"
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleUpdateProfile}
                loading={isLoading}
                disabled={isLoading}
                style={{
                  background: themeColors.buttonPrimary,
                  borderColor: themeColors.buttonPrimary,
                }}
              >
                Save Changes
              </Button>,
            ]
      }
    >
      {/* Avatar Section */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Avatar
          size={120}
          src={avatarUrl || undefined}
          icon={!avatarUrl ? <UserOutlined /> : undefined}
          style={{
            backgroundColor: themeColors.primary,
            fontSize: 48,
            marginBottom: 16,
            border: `2px solid ${themeColors.borderLight}`,
          }}
        />
        <div style={{ marginBottom: 12 }}>
          <Upload showUploadList={false} customRequest={handleAvatarUpload} accept="image/*">
            <Button icon={<UploadOutlined />}>Upload DP</Button>
          </Upload>
        </div>

        {isEditing ? (
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{
              maxWidth: 300,
              margin: "0 auto 8px",
              color: themeColors.textPrimary,
              background: themeColors.backgroundLight,
            }}
            placeholder="Enter your name"
          />
        ) : (
          <Title level={4} style={{ marginBottom: 4, color: themeColors.textPrimary }}>
            {displayName || currentUser.email || "User"}
          </Title>
        )}

        <Text style={{ display: "block", marginBottom: 16, color: themeColors.textSecondary }}>
          UID: {currentUser.uid}
        </Text>
      </div>

      {/* ACCOUNT DETAILS */}
      <Divider orientation="left" plain>
        Account Details
      </Divider>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Email">{currentUser.email}</Descriptions.Item>

        {/* ✅ API CODE FIELD ADDED */}
        <Descriptions.Item label="Client API Code">
          {isEditing ? (
            <Input
              value={userData.clientApiCode}
              onChange={(e) =>
                setUserData({ ...userData, clientApiCode: e.target.value })
              }
              placeholder="Enter your API code"
            />
          ) : (
            userData.clientApiCode || "Not Set"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Password">
          {isEditing ? (
            <Input.Password
              value={userData.mt5Password}
              onChange={(e) =>
                setUserData({ ...userData, mt5Password: e.target.value })
              }
            />
          ) : (
            "********"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="MT5 Account ID">
          {isEditing ? (
            <Input
              value={userData.mt5AccountId}
              onChange={(e) =>
                setUserData({ ...userData, mt5AccountId: e.target.value })
              }
            />
          ) : (
            userData.mt5AccountId || "Not Set"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="MT5 Server">
          {isEditing ? (
            <Input
              value={userData.mt5Server}
              onChange={(e) =>
                setUserData({ ...userData, mt5Server: e.target.value })
              }
            />
          ) : (
            userData.mt5Server || "Not Set"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Broker Email ID">
          {isEditing ? (
            <Input
              value={userData.brokerEmail}
              onChange={(e) =>
                setUserData({ ...userData, brokerEmail: e.target.value })
              }
            />
          ) : (
            userData.brokerEmail || "Not Set"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Broker Password">
          {isEditing ? (
            <Input.Password
              value={userData.brokerPassword}
              onChange={(e) =>
                setUserData({ ...userData, brokerPassword: e.target.value })
              }
            />
          ) : userData.brokerPassword ? (
            "********"
          ) : (
            "Not Set"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="KYC Status">
          {isEditing ? (
            <Select
              value={userData.kycStatus}
              onChange={(value) =>
                setUserData({ ...userData, kycStatus: value })
              }
              style={{ width: 200 }}
            >
              <Option value="pending">Pending</Option>
              <Option value="verified">Verified</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          ) : (
            userData.kycStatus
          )}
        </Descriptions.Item>

        <Descriptions.Item label="2FA Enabled">
          {isEditing ? (
            <Switch
              checked={userData.is2FAEnabled}
              onChange={(checked) =>
                setUserData({ ...userData, is2FAEnabled: checked })
              }
            />
          ) : userData.is2FAEnabled ? "Yes" : "No"}
        </Descriptions.Item>
      </Descriptions>

      {/* CLIENT PERSONAL DETAILS */}
      <Divider orientation="left" plain>
        Client Details
      </Divider>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Client Name">{userData.clientName || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Mobile Number">{userData.mobileNumber || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Date of Birth">{userData.dob || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="City">{userData.city || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Service Name">{userData.serviceName || "N/A"}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ProfileSection;
