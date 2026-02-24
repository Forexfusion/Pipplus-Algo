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
  const [displayName, setDisplayName] = useState<string>(
    currentUser.displayName || ""
  );
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
    clientApiCode: "",
  });

  // FETCH PROFILE
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
            clientApiCode: data.clientApiCode || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  // SAVE PROFILE (BROKER PASSWORD MANDATORY)
  const handleUpdateProfile = async () => {
    if (!userData.brokerPassword || !userData.brokerPassword.trim()) {
      message.error("Broker password is mandatory. Please enter it before saving.");
      return;
    }

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
    await setDoc(
      doc(db, "userProfiles", currentUser.uid),
      { photoURL: downloadUrl },
      { merge: true }
    );

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
              >
                Cancel
              </Button>,
              <Button
                key="save"
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleUpdateProfile}
                loading={isLoading}
                disabled={isLoading || !userData.brokerPassword?.trim()}
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
      {/* REST OF UI SAME AS BEFORE */}
      {/* Broker Password field already present – no UI change needed */}
    </Card>
  );
};

export default ProfileSection;
