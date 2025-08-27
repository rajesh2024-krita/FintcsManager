import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import SocietyManagement from "./pages/society-management";
import UserManagement from "./pages/user-management";
import MemberManagement from "./pages/member-management";
import LoanManagement from "./pages/loan-management";
import MonthlyDemand from "./pages/monthly-demand";
import VoucherManagement from "./pages/voucher-management";
import Reports from "./pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/societies" component={SocietyManagement} />
      <Route path="/users" component={UserManagement} />
      <Route path="/members" component={MemberManagement} />
      <Route path="/loans" component={LoanManagement} />
      <Route path="/monthly-demand" component={MonthlyDemand} />
      <Route path="/vouchers" component={VoucherManagement} />
      <Route path="/reports" component={Reports} />
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
