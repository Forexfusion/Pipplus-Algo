// App.tsx
import { useState, useEffect } from "react";
import { auth, db } from "./config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AuthComponent from "./components/AuthComponent";
import TradeManager from "./components/TradeManager";
import tradesJsonData from "./data/trades.json";
import ClientTradeTable from "./components/ClientTradeTable";
import {
  Layout,
  Menu,
  theme,
  Spin,
  message,
  ConfigProvider,
} from "antd";
import {
  DashboardOutlined,
  TrademarkOutlined,
  LogoutOutlined,
  DollarOutlined,
  PieChartOutlined,
  WalletOutlined,
  LineChartOutlined,
  KeyOutlined,
  UserOutlined,
  AppstoreOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import type { Trade, CalculatedMetrics } from "./types";
import { useAuth } from "./hooks/useAuth";
import MetricCard from "./components/MetricCard";
import PLOverTimeChart from "./components/PLOverTimeChart";
import MonthlyROIChart from "./components/MonthlyROIChart";
import TradeHistoryTable from "./components/TradeHistoryTable";
import KycSection from "./components/KycSection";
import ProfileSection from "./components/ProfileSection";
import AdminPanel from "./components/AdminPanel";
import AdminManualTradeForm from "./components/AdminManualTradeForm";

import "./style.css";
import { themeColors } from "./config/theme";

const { Header, Sider, Content } = Layout;

function App() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { currentUser, loading: authLoading, manualSetCurrentUser } = useAuth();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [metrics, setMetrics] = useState<CalculatedMetrics>({
    totalPL: 0,
    totalROI: 0,
    totalInvested: 0,
    totalTrades: 0,
  });
  const [capital, setCapital] = useState(0); // ✅ Capital state
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("1");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const adminEmail = "admin@pipplustechnology.com";

  useEffect(() => {
    const loadTradesAndMetrics = async () => {
      if (!currentUser) return;

      let manualInvestment = 0;
      let tradesData: Trade[] = [];

      try {
        if (currentUser.email === adminEmail) {
          tradesData = tradesJsonData.map((trade: any) => ({
            ...trade,
            tradeDate: trade.date,
            segment: trade.symbol,
            profit: parseFloat(trade.profit || 0),
          }));
          manualInvestment = 2000;
          setCapital(2000); // ✅ static for admin
        } else {
          const profileSnap = await getDoc(doc(db, "userProfiles", currentUser.uid));
          const profileData = profileSnap.exists() ? profileSnap.data() : null;

          const capitalFromFirestore = parseFloat(profileData?.capital || "0");
          manualInvestment = capitalFromFirestore;
          setCapital(capitalFromFirestore); // ✅ dynamic for clients

          const tradeFile = await import(`./data/trades/${currentUser.uid}.json`);
          tradesData = tradeFile.default.map((trade: any) => ({
            ...trade,
            tradeDate: trade.date,
            segment: trade.symbol,
            profit: parseFloat(trade.profit || 0),
          }));
        }

        const totalProfit = tradesData.reduce((acc, trade) => acc + trade.profit, 0);
        const roi = manualInvestment > 0 ? (totalProfit / manualInvestment) * 100 : 0;

        setTrades(tradesData);
        setMetrics({
          totalPL: parseFloat(totalProfit.toFixed(2)),
          totalROI: parseFloat(roi.toFixed(2)),
          totalInvested: parseFloat(manualInvestment.toFixed(2)),
          totalTrades: tradesData.length,
        });
      } catch (error) {
        console.error("❌ Failed to load trades:", error);
        setTrades([]);
        setMetrics({
          totalPL: 0,
          totalROI: 0,
          totalInvested: 0,
          totalTrades: 0,
        });
        setCapital(0);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadTradesAndMetrics();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      message.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out: ", error);
      message.error("Failed to sign out");
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!authLoading && !currentUser) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: themeColors.primary,
            colorBgLayout: themeColors.background,
          },
        }}
      >
        <AuthComponent onLoginSuccess={() => {}} />
      </ConfigProvider>
    );
  }

  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: "Overview" },
    { key: "2", icon: <TrademarkOutlined />, label: "Trade History" },
    { key: "3", icon: <KeyOutlined />, label: "KYC Status" },
    { key: "4", icon: <UserOutlined />, label: "Profile" },
    ...(currentUser?.email === adminEmail
      ? [
          { key: "admin", icon: <AppstoreOutlined />, label: "Admin Panel" },
          { key: "manual-trade", icon: <UploadOutlined />, label: "Manual Trade" },
        ]
      : []),
    { key: "signout", icon: <LogoutOutlined style={{ color: themeColors.error }} />, label: "Log Out", style: { color: themeColors.error } },
  ];

  const getHeaderTitle = () => {
    switch (selectedMenu) {
      case "1": return "Overview";
      case "2": return "Trade Management";
      case "3": return "KYC Verification";
      case "4": return "User Profile";
      case "admin": return "Admin Panel";
      case "manual-trade": return "Manual Trade Upload";
      default: return "Dashboard";
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: themeColors.primary,
          colorBgContainer: themeColors.backgroundLight,
          colorBgLayout: themeColors.background,
          colorText: themeColors.textPrimary,
          colorBorder: themeColors.border,
          colorBorderSecondary: themeColors.borderLight,
          colorTextHeading: themeColors.textPrimary,
          colorTextLabel: themeColors.textSecondary,
          colorLink: themeColors.primary,
          colorLinkHover: themeColors.primaryHover,
        },
        components: {
          Layout: { headerBg: themeColors.headerBackground, siderBg: themeColors.siderBackground, bodyBg: themeColors.background },
          Menu: {
            darkItemBg: themeColors.siderBackground,
            darkItemSelectedBg: themeColors.primary,
            darkItemHoverBg: themeColors.backgroundLighter,
            darkItemColor: themeColors.textSecondary,
            darkItemSelectedColor: themeColors.textPrimary,
          },
          Card: { colorBgContainer: themeColors.cardBackground, colorBorderSecondary: themeColors.border },
          Button: {
            colorPrimary: themeColors.buttonPrimary,
            colorPrimaryHover: themeColors.primaryHover,
            colorError: themeColors.buttonDanger,
            colorErrorHover: "#FF5A8A",
            colorWarning: themeColors.buttonWarning,
            colorSuccess: themeColors.buttonSuccess,
          },
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(value: boolean) => setCollapsed(value)} theme="dark" width={250} style={{ position: "sticky", top: 0, height: "100vh", overflow: "auto", background: themeColors.siderBackground }}>
          <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", color: themeColors.textPrimary, fontSize: collapsed ? 20 : 24, fontWeight: "bold", marginBottom: 16 }}>
            {collapsed ? "FA" : "PipPlus Algo"}
          </div>
          <Menu theme="dark" selectedKeys={[selectedMenu]} mode="inline" onClick={({ key }) => { if (key === "signout") handleSignOut(); else setSelectedMenu(key); }} items={menuItems} style={{ background: themeColors.siderBackground }} />
        </Sider>
        <Layout style={{ background: themeColors.background }}>
          <Header style={{ padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: themeColors.headerBackground, borderBottom: `1px solid ${themeColors.border}` }}>
            <div style={{ fontSize: 18, color: themeColors.textPrimary }}>{getHeaderTitle()}</div>
          </Header>
          <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
            <div style={{ padding: 24, borderRadius: 8, minHeight: "calc(100vh - 112px)" }}>
              {selectedMenu === "1" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                    <MetricCard title="Total Profit/Loss" value={metrics.totalPL} prefix="$" icon={<DollarOutlined />} color={metrics.totalPL >= 0 ? themeColors.success : themeColors.error} />
                    <MetricCard title="Overall ROI" value={metrics.totalROI} suffix="%" icon={<PieChartOutlined />} color={metrics.totalROI >= 0 ? themeColors.success : themeColors.error} />
                    <MetricCard title="Capital" value={capital} prefix="$" icon={<WalletOutlined />} color={themeColors.info} />
                    <MetricCard title="Total Trades" value={metrics.totalTrades} icon={<LineChartOutlined />} color={themeColors.primary} />
                  </div>
                  <div style={{ marginBottom: "24px" }}>
                    {trades.length > 0 ? (
                      <div style={{ display: "grid", gap: "28px" }}>
                        <PLOverTimeChart trades={trades} />
                        <MonthlyROIChart trades={trades} />
                      </div>
                    ) : (
                      <div style={{ padding: "20px", textAlign: "center", background: themeColors.backgroundLight, borderRadius: "8px" }}>
                        <p style={{ color: themeColors.textSecondary }}>No trades yet to display charts. Add some trades in the 'Trades' section.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              {selectedMenu === "2" && (
                currentUser?.email === adminEmail
                  ? <TradeHistoryTable trades={trades} isLoading={isLoadingData} />
                  : <ClientTradeTable />
              )}
              {selectedMenu === "3" && (
                <KycSection
                  currentUser={currentUser}
                  themeColors={themeColors}
                  initialKycStatus="Pending"
                  onKycStatusUpdate={() => {}}
                />
              )}
              {selectedMenu === "4" && (
                <ProfileSection
                  currentUser={currentUser}
                  auth={auth}
                  themeColors={themeColors}
                  kycStatus={userProfile?.kycStatus || "Pending"}
                  onNavigateToKyc={() => setSelectedMenu("3")}
                  onProfileUpdate={() => manualSetCurrentUser(auth.currentUser)}
                />
              )}
              {selectedMenu === "admin" && <AdminPanel />}
              {selectedMenu === "manual-trade" && <AdminManualTradeForm />}
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
