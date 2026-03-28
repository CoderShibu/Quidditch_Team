import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";
import CostMonitorPage from "./pages/CostMonitorPage";
import AnomalyDetectionPage from "./pages/AnomalyDetectionPage";
import AlertsPage from "./pages/AlertsPage";
import OptimizationHistoryPage from "./pages/OptimizationHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
 <QueryClientProvider client={queryClient}>
 <TooltipProvider>
 <Sonner />
 <BrowserRouter>
 <Routes>
 <Route path="/"element={<SplashPage />} />
 <Route path="/login"element={<LoginPage />} />
 <Route path="/dashboard"element={<DashboardLayout />}>
 <Route index element={<OverviewPage />} />
 <Route path="cost"element={<CostMonitorPage />} />
 <Route path="anomalies"element={<AnomalyDetectionPage />} />
 <Route path="alerts"element={<AlertsPage />} />
 <Route path="history"element={<OptimizationHistoryPage />} />
 <Route path="settings"element={<SettingsPage />} />
 </Route>
 <Route path="*"element={<NotFound />} />
 </Routes>
 </BrowserRouter>
 </TooltipProvider>
 </QueryClientProvider>
);

export default App;
