import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Customer App
import CustomerAuth from "./pages/customer/CustomerAuth";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerChat from "./pages/customer/CustomerChat";
import CustomerContacts from "./pages/customer/CustomerContacts";
import CustomerMe from "./pages/customer/CustomerMe";

// Admin Panel
import AdminMessages from "./pages/admin/AdminMessages";
import AdminChatView from "./pages/admin/AdminChatView";
import AdminCardRates from "./pages/admin/AdminCardRates";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminNairaRate from "./pages/admin/AdminNairaRate";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminApiConfig from "./pages/admin/AdminApiConfig";
import AdminBroadcast from "./pages/admin/AdminBroadcast";

const queryClient = new QueryClient();

const App = () => (
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

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminMessages />} />
          <Route path="/admin/chat/:id" element={<AdminChatView />} />
          <Route path="/admin/card-rates" element={<AdminCardRates />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/naira-rate" element={<AdminNairaRate />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/team" element={<AdminTeam />} />
          <Route path="/admin/api-config" element={<AdminApiConfig />} />
          <Route path="/admin/broadcast" element={<AdminBroadcast />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
