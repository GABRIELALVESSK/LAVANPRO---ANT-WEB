"use client";

import { usePermissions, type PermissionKey } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

interface AccessGuardProps {
    permission: PermissionKey;
    children: React.ReactNode;
}

/**
 * Wraps a page's content and blocks access if the user doesn't have
 * the required permission based on their role and the permissions matrix.
 * Automatically redirects unauthorized users to /dashboard.
 */
export function AccessGuard({ permission, children }: AccessGuardProps) {
    const { hasPermission, loading, isOwner, getAccessibleRoutes } = usePermissions();
    const router = useRouter();

    const allowed = loading || isOwner || hasPermission(permission);

    useEffect(() => {
        if (!loading && !allowed) {
            // Find a safe place to redirect (not the current route)
            const routes = getAccessibleRoutes();
            const fallback = routes.find(r => r !== "/login") || "/login";
            
            const timer = setTimeout(() => {
                router.replace(fallback);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [loading, allowed, router, getAccessibleRoutes]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="size-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!allowed) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md px-8">
                    <div className="size-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <ShieldAlert className="size-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-brand-text">Acesso Restrito</h2>
                    <p className="text-sm text-brand-muted">
                        Você não possui permissão para acessar este módulo. Fale com o administrador do sistema para
                        solicitar acesso.
                    </p>
                    <p className="text-xs text-brand-muted/60">Redirecionando para o painel principal...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
