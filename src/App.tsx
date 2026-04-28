import { SupabaseProvider } from "@/components/auth/SupabaseProvider";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import TouristRegistration from "@/pages/TouristRegistration";
import Profile from "@/pages/Profile";
import Emergency from "@/pages/Emergency";
import Itinerary from "@/pages/Itinerary";
import LocationShare from "@/pages/LocationShare";
import Notifications from "@/pages/Notifications";
import Translator from "@/pages/Translator";
import AdminFabric from "@/pages/AdminFabric";
import HighAuthority from "@/pages/HighAuthority";
import AlertDetail from "@/pages/AlertDetail";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotFound from "@/pages/NotFound";

// Removed Convex client initialization

export default function App() {
    return (
        <SupabaseProvider>
            <BrowserRouter>
                <Toaster richColors position="top-right" />
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/register" element={<TouristRegistration />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/emergency" element={<Emergency />} />
                    <Route path="/itinerary" element={<Itinerary />} />
                    <Route path="/location" element={<LocationShare />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/translator" element={<Translator />} />
                    <Route path="/fabric-admin" element={<AdminFabric />} />
                    <Route
                        path="/alert/:id"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "tourism_official"]}>
                                <AlertDetail />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/admin/fabric"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminFabric />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/high-authority"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "tourism_official"]}>
                                <HighAuthority />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </SupabaseProvider>
    );
}
