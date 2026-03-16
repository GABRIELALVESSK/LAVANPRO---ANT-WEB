"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabase";

// ---- Shared types ----
const ROLES = ["Administrador", "Gerente", "Atendente", "Estoquista"] as const;

type PermissionKey = "orders" | "customers" | "finance" | "stock" | "reports" | "team" | "settings" | "labels" | "dashboard" | "services" | "chat";
type RoleName = (typeof ROLES)[number];
type PermissionMatrix = Record<RoleName, Record<PermissionKey, boolean>>;

const DEFAULT_MATRIX: PermissionMatrix = {
    Administrador: { orders: true, customers: true, finance: true, stock: true, reports: true, team: true, settings: true, labels: true, dashboard: true, services: true, chat: true },
    Gerente: { orders: true, customers: true, finance: true, stock: true, reports: true, team: true, settings: false, labels: true, dashboard: true, services: true, chat: true },
    Atendente: { orders: true, customers: true, finance: false, stock: false, reports: false, team: false, settings: false, labels: true, dashboard: true, services: true, chat: false },
    Estoquista: { orders: false, customers: false, finance: false, stock: true, reports: false, team: false, settings: false, labels: false, dashboard: false, services: false, chat: false },
};

const ROUTE_PERMISSION_MAP: Record<string, PermissionKey> = {
    "/dashboard": "dashboard",
    "/orders": "orders",
    "/customers": "customers",
    "/finance": "finance",
    "/stock": "stock",
    "/reports": "reports",
    "/team": "team",
    "/settings": "settings",
    "/labels": "labels",
    "/services": "services",
    "/chat": "chat",
};

const ALWAYS_ALLOWED_ROUTES = ["/login"];

function normaliseRole(role: string | null | undefined): RoleName {
    if (!role) return "Atendente";
    const r = role.trim().toLowerCase();
    if (r === "administrador" || r === "admin" || r === "owner") return "Administrador";
    if (r === "gerente" || r === "gerente geral") return "Gerente";
    if (r === "estoquista" || r === "operador de máquinas" || r === "motorista") return "Estoquista";
    if (r === "atendente") return "Atendente";
    console.warn("[usePermissions] Unknown role:", role, "→ defaulting to Atendente");
    return "Atendente";
}

export function usePermissions() {
    const { user, loading: authLoading } = useAuth();

    const [matrix, setMatrix] = useState<PermissionMatrix>(DEFAULT_MATRIX);
    const [staffRole, setStaffRole] = useState<RoleName | "owner" | null>(null);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [staffUnit, setStaffUnit] = useState<string | null>(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { setDataLoaded(true); return; }

        let cancelled = false;

        async function loadAll() {
            try {
                // ── 1. Load staff record for current user ─────────────────────
                // First try RPC (server-side, bypasses RLS issues)
                let staffRole: string | null = null;
                let staffOwnerId: string | null = null;
                let currentStaffUnit: string | null = null;

                const { data: rpcData, error: rpcError } = await supabase
                    .rpc("get_my_staff_role");

                if (rpcError) {
                    console.error("[usePermissions] RPC get_my_staff_role error:", rpcError);
                    // Fallback: direct query by user_id
                    const { data: directData } = await supabase
                        .from("staff")
                        .select("role, owner_id, unit")
                        .eq("user_id", user!.id)
                        .maybeSingle();
                    
                    staffRole = directData?.role || null;
                    staffOwnerId = directData?.owner_id || null;
                    currentStaffUnit = directData?.unit || null;
                } else {
                    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
                    console.log("[usePermissions] RPC result:", row);
                    staffRole = row?.role || null;
                    staffOwnerId = row?.owner_id || null;
                    currentStaffUnit = row?.unit || null;
                }

                if (!cancelled) {
                    setOwnerId(staffOwnerId);
                    setStaffUnit(currentStaffUnit);

                    // Determine if user is the owner:
                    // - owner_id matches their own user id, OR
                    // - they are an Administrador with no owner (legacy), OR
                    // - metadata says is_owner
                    const isOwnerUser = 
                        (staffOwnerId === user!.id) ||
                        (user!.user_metadata?.is_owner === true) ||
                        (!staffOwnerId && staffRole === 'Administrador');

                    if (isOwnerUser) {
                        setStaffRole("owner");
                    } else {
                        setStaffRole(normaliseRole(staffRole));
                    }
                }

                // ── 2. Load permission matrix ─────────────────────────────────
                const { data: settingsData, error: settingsError } = await supabase
                    .from("app_settings")
                    .select("value")
                    .eq("key", "permissions_matrix")
                    .maybeSingle();

                if (!cancelled) {
                    if (settingsError) console.error("[usePermissions] Error loading matrix:", settingsError);

                    if (settingsData?.value) {
                        const parsed = settingsData.value as PermissionMatrix;
                        setMatrix(parsed);
                    }
                }
            } catch (err) {
                console.error("[usePermissions] Unexpected error:", err);
            } finally {
                if (!cancelled) setDataLoaded(true);
            }
        }

        loadAll();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, authLoading]);

    const userRole = staffRole;
    const isOwner = userRole === "owner";
    const isAdmin = isOwner || userRole === "Administrador" || userRole === "Gerente";

    const hasPermission = (permission: PermissionKey): boolean => {
        if (!dataLoaded || !user) return false;
        if (isOwner) return true;
        if (!userRole) return false;
        
        const rolePerms = matrix[userRole as RoleName];
        if (!rolePerms) {
            console.warn(`[usePermissions] No permissions found for role: ${userRole}`);
            return false;
        }

        // Suporte para formato de array (master_schema.sql)
        if (Array.isArray(rolePerms)) {
            const allowed = (rolePerms as unknown as string[]).includes(permission);
            if (!allowed) console.log(`[usePermissions] Access denied to ${permission} for ${userRole} (Array format)`);
            return allowed;
        }

        // Suporte para formato de objeto (DEFAULT_MATRIX)
        const allowed = (rolePerms as Record<string, boolean>)[permission] ?? false;
        if (!allowed) console.log(`[usePermissions] Access denied to ${permission} for ${userRole} (Object format)`);
        return allowed;
    };

    const canAccessRoute = (route: string): boolean => {
        if (!dataLoaded || !user) return false;
        if (isOwner) return true;
        if (ALWAYS_ALLOWED_ROUTES.includes(route)) return true;
        const permKey = ROUTE_PERMISSION_MAP[route];
        if (!permKey) return true;
        return hasPermission(permKey);
    };

    const getAccessibleRoutes = (): string[] => {
        if (isOwner) return [...ALWAYS_ALLOWED_ROUTES, ...Object.keys(ROUTE_PERMISSION_MAP)];
        const routes = [...ALWAYS_ALLOWED_ROUTES];
        for (const [route, perm] of Object.entries(ROUTE_PERMISSION_MAP)) {
            if (hasPermission(perm)) routes.push(route);
        }
        return routes;
    };

    return {
        userRole,
        isOwner,
        isAdmin,
        ownerId,
        staffUnit,
        loading: authLoading || !dataLoaded,
        hasPermission,
        canAccessRoute,
        getAccessibleRoutes,
        matrix,
    };
}

export { ROUTE_PERMISSION_MAP, ALWAYS_ALLOWED_ROUTES, DEFAULT_MATRIX, ROLES };
export type { PermissionKey, RoleName, PermissionMatrix };
