import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
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
import NotFound from "@/pages/NotFound";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export default function App() {
    return (
        <ConvexAuthProvider client={convex}>
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
                    <Route path="/admin/fabric" element={<AdminFabric />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ConvexAuthProvider>
    );
}
