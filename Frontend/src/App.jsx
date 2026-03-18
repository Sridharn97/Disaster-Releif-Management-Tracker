import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import UserReportLayout from "@/components/UserReportLayout";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Disasters from "@/pages/Disasters";
import Centers from "@/pages/Centers";
import Inventory from "@/pages/Inventory";
import Volunteers from "@/pages/Volunteers";
import DispatchPage from "@/pages/DispatchPage";
import MapView from "@/pages/MapView";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading)
        return null;
    if (!isAuthenticated)
        return <Navigate to="/login" replace/>;
    return <AppLayout>{children}</AppLayout>;
}
function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading)
        return null;
    if (isAuthenticated)
        return <Navigate to="/dashboard" replace/>;
    return <>{children}</>;
}
function DisasterRoute() {
    const { isAuthenticated, loading } = useAuth();
    if (loading)
        return null;
    if (isAuthenticated)
        return <AppLayout><Disasters /></AppLayout>;
    return <UserReportLayout><Disasters /></UserReportLayout>;
}
function CentersRoute() {
    const { isAuthenticated, loading } = useAuth();
    if (loading)
        return null;
    if (isAuthenticated)
        return <AppLayout><Centers /></AppLayout>;
    return <UserReportLayout><Centers /></UserReportLayout>;
}
const App = () => (<QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>}/>
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>}/>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
              <Route path="/disasters" element={<DisasterRoute />}/>
              <Route path="/centers" element={<CentersRoute />}/>
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>}/>
              <Route path="/volunteers" element={<ProtectedRoute><Volunteers /></ProtectedRoute>}/>
              <Route path="/dispatch" element={<ProtectedRoute><DispatchPage /></ProtectedRoute>}/>
              <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>}/>
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
              <Route path="*" element={<NotFound />}/>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>);
export default App;
