import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Role } from "@/types/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-display font-medium text-muted-foreground uppercase tracking-widest">
                        Synchronizing Security Keys...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to auth page if not logged in
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (allowedRoles && user?.role && !allowedRoles.includes(user.role as Role)) {
        // Redirect to dashboard if user doesn't have required role
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
