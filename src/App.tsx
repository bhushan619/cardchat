import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminRoleProvider } from "@/contexts/AdminRoleContext";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Customer App
import CustomerAuth from "./pages/customer/CustomerAuth";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerChat from "./pages/customer/CustomerChat";
import CustomerContacts from "./pages/customer/CustomerContacts";
import CustomerMe from "./pages/customer/CustomerMe";
import CustomerGuide from "./pages/customer/CustomerGuide";
import AgentProfile from "./pages/customer/AgentProfile";
import CustomerRewards from "./pages/customer/CustomerRewards";
import CustomerRanking from "./pages/customer/CustomerRanking";

// Admin Panel
import AdminLogin from "./pages/admin/AdminLogin";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminChatView from "./pages/admin/AdminChatView";
import AdminCardRates from "./pages/admin/AdminCardRates";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminNairaRate from "./pages/admin/AdminNairaRate";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminApiConfig from "./pages/admin/AdminApiConfig";
import AdminBroadcast from "./pages/admin/AdminBroadcast";
import AdminGuide from "./pages/admin/AdminGuide";
import AdminIpRestrictions from "./pages/admin/AdminIpRestrictions";
import AdminCustomerGuide from "./pages/admin/AdminCustomerGuide";
import AdminSensitiveWords from "./pages/admin/AdminSensitiveWords";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminWallets from "./pages/admin/AdminWallets";
import AdminTeamChat from "./pages/admin/AdminTeamChat";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Customer App */}
            <Route path="/customer/auth" element={<CustomerAuth />} />
            <Route path="/customer" element={<CustomerHome />} />
            <Route path="/customer/chat" element={<CustomerChat />} />
            <Route path="/customer/contacts" element={<CustomerContacts />} />
            <Route path="/customer/me" element={<CustomerMe />} />
            <Route path="/customer/guide" element={<CustomerGuide />} />
            <Route path="/customer/agent/:id" element={<AgentProfile />} />
            <Route path="/customer/rewards" element={<CustomerRewards />} />
            <Route path="/customer/ranking" element={<CustomerRanking />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Panel - wrapped in role provider */}
            <Route path="/admin/*" element={
              <AdminRoleProvider>
                <Routes>
                  <Route path="" element={<AdminMessages />} />
                  <Route path="chat/:id" element={<AdminChatView />} />
                  <Route path="card-rates" element={<AdminCardRates />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="naira-rate" element={<AdminNairaRate />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="team" element={<AdminTeam />} />
                  <Route path="api-config" element={<AdminApiConfig />} />
                  <Route path="broadcast" element={<AdminBroadcast />} />
                  <Route path="guide" element={<AdminGuide />} />
                  <Route path="ip-restrictions" element={<AdminIpRestrictions />} />
                  <Route path="customer-guide" element={<AdminCustomerGuide />} />
                  <Route path="sensitive-words" element={<AdminSensitiveWords />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="wallets" element={<AdminWallets />} />
                  <Route path="team-chat" element={<AdminTeamChat />} />
                </Routes>
              </AdminRoleProvider>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
