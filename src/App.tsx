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
import AdminSetPassword from "./pages/admin/AdminSetPassword";
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
import AdminProfile from "./pages/admin/AdminProfile";
import AdminRanking from "./pages/admin/AdminRanking";
import AdminRewards from "./pages/admin/AdminRewards";
import AdminScreensGallery from "./pages/admin/AdminScreensGallery";

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
            <Route path="/admin/set-password" element={<AdminSetPassword />} />

            {/* Admin Panel - wrapped in role provider */}
            <Route path="/admin" element={<AdminRoleProvider><AdminMessages /></AdminRoleProvider>} />
            <Route path="/admin/chat/:id" element={<AdminRoleProvider><AdminChatView /></AdminRoleProvider>} />
            <Route path="/admin/card-rates" element={<AdminRoleProvider><AdminCardRates /></AdminRoleProvider>} />
            <Route path="/admin/orders" element={<AdminRoleProvider><AdminOrders /></AdminRoleProvider>} />
            <Route path="/admin/naira-rate" element={<AdminRoleProvider><AdminNairaRate /></AdminRoleProvider>} />
            <Route path="/admin/users" element={<AdminRoleProvider><AdminUsers /></AdminRoleProvider>} />
            <Route path="/admin/team" element={<AdminRoleProvider><AdminTeam /></AdminRoleProvider>} />
            <Route path="/admin/api-config" element={<AdminRoleProvider><AdminApiConfig /></AdminRoleProvider>} />
            <Route path="/admin/broadcast" element={<AdminRoleProvider><AdminBroadcast /></AdminRoleProvider>} />
            <Route path="/admin/guide" element={<AdminRoleProvider><AdminGuide /></AdminRoleProvider>} />
            <Route path="/admin/ip-restrictions" element={<AdminRoleProvider><AdminIpRestrictions /></AdminRoleProvider>} />
            <Route path="/admin/customer-guide" element={<AdminRoleProvider><AdminCustomerGuide /></AdminRoleProvider>} />
            <Route path="/admin/sensitive-words" element={<AdminRoleProvider><AdminSensitiveWords /></AdminRoleProvider>} />
            <Route path="/admin/customers" element={<AdminRoleProvider><AdminCustomers /></AdminRoleProvider>} />
            <Route path="/admin/wallets" element={<AdminRoleProvider><AdminWallets /></AdminRoleProvider>} />
            <Route path="/admin/team-chat" element={<AdminRoleProvider><AdminTeamChat /></AdminRoleProvider>} />
            <Route path="/admin/profile" element={<AdminRoleProvider><AdminProfile /></AdminRoleProvider>} />
            <Route path="/admin/ranking" element={<AdminRoleProvider><AdminRanking /></AdminRoleProvider>} />
            <Route path="/admin/rewards" element={<AdminRoleProvider><AdminRewards /></AdminRoleProvider>} />
            <Route path="/admin/screens" element={<AdminScreensGallery />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
