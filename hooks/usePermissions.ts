"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabase";

// ---- Shared types (must match access-profiles-tab.tsx) ----
const ROLES = ["Administrador", "Gerente", "Atendente", "Estoquista"] as const;

type PermissionKey = "orders" | "customers" | "finance" | "stock" | "reports" | "team" | "settings" | "labels";
type RoleName = (typeof ROLES)[number];
type PermissionMatrix = Record<RoleName, Record<PermissionKey, boolean>>;

const DEFAULT_MATRIX: PermissionMatrix = {
    Administrador: { orders: true, customers: true, finance: true, stock: true, reports: true, team: true, settings: true, labels: true },
    Gerente: { orders: true, customers: true, finance: true, stock: true, reports: true, team: true, settings: false, labels: true },
    Atendente: { orders: true, customers: true, finance: false, stock: false, reports: false, team: false, settings: false, labels: true },
    Estoquista: { orders: false, customers: false, finance: false, stock: true, reports: false, team: false, settings: false, labels: false },
};

const ROUTE_PERMISSION_MAP: Record<string, PermissionKey> = {
    "/orders": "orders",
    "/customers": "customers",
    "/finance": "finance",
    "/stock": "stock",
    "/reports": "reports",
    "/team": "team",
    "/settings": "settings",
    "/labels": "labels",
};

const ALWAYS_ALLOWED_ROUTES = ["/dashboard"];
const OWNER_EMAIL = "gabriel23900@gmail.com";

function normaliseRole(role: string | null | undefined): RoleName {
    if (!role) return "Atendente";
    const r = role.trim();
    if (r === "Administrador") return "Administrador";
    if (r === "Gerente" || r === "Gerente Geral") return "Gerente";
    if (r === "Estoquista" || r === "Operador de Máquinas" || r === "Motorista") return "Estoquista";
    if (r === "Atendente") return "Atendente";
    return "Atendente";
}

/**
 * Resolve the current user's role from the staff table.
 * Strategy:
 *   1. Try by user_id (UUID) — most reliable after first login
 *   2. Fall back to email match (ilike, case-insensitive) + auto-link user_id
 *   3. Default to "Atendente" if nothing found
 */
async function resolveStaffRole(userId: string, email: string): Promise<RoleName> {
    // ── Step 1: query by user_id (fast & reliable) ──────────────────────────
    const { data: byId, error: idErr } = await supabase
        .from("staff")
        .select("id, role, user_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (idErr) console.error("[usePermissions] Query by user_id error:", idErr);

    if (byId?.role) {
        console.log("[usePermissions] Role resolved via user_id:", byId.role);
        return normaliseRole(byId.role);
    }

    // ── Step 2: fall back to email match + auto-link ─────────────────────────
    const { data: byEmail, error: emailErr } = await supabase
        .from("staff")
        .select("id, role, user_id, email")
        .ilike("email", email)
        .maybeSingle();

    if (emailErr) console.error("[usePermissions] Query by email error:", emailErr);

    if (byEmail?.role) {
        console.log("[usePermissions] Role resolved via email:", byEmail.role, "| staff email:", byEmail.email);

        // Auto-link: store user_id so next lookup is instant
        if (!byEmail.user_id) {
            const { error: linkErr } = await supabase
                .from("staff")
                .update({ user_id: userId })
                .eq("id", byEmail.id);
            if (linkErr) console.warn("[usePermissions] Could not auto-link user_id:", linkErr);
            else console.log("[usePermissions] Auto-linked user_id to staff record.");
        }

        return normaliseRole(byEmail.role);
    }

    // ── Step 3: not found ────────────────────────────────────────────────────
    console.warn("[usePermissions] No staff record found for:", email, "(user_id:", userId + ")");
    return "Atendente"; // safest default — do NOT fall back to stale auth metadata
}

export function usePermissions() {
    const { user, loading: authLoading } = useAuth();

    const [matrix, setMatrix] = useState<PermissionMatrix>(DEFAULT_MATRIX);
    const [staffRole, setStaffRole] = useState<RoleName | "owner" | null>(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setDataLoaded(true);
            return;
        }

        let cancelled = false;

        async function loadAll() {
            try {
                // ── Determine role ────────────────────────────────────────────
                const isOwner = user!.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

                if (isOwner) {
                    if (!cancelled) setStaffRole("owner");
                } else {
                    const role = await resolveStaffRole(user!.id, user!.email ?? "");
                    if (!cancelled) setStaffRole(role);
                }

                // ── Load permission matrix from Supabase ──────────────────────
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
                        localStorage.setItem("lavanpro_permissions", JSON.stringify(parsed));
                        console.log("[usePermissions] Permission matrix loaded from Supabase.");
                    } else {
                        const saved = localStorage.getItem("lavanpro_permissions");
                        if (saved) {
                            try { setMatrix(JSON.parse(saved)); } catch { /* ignore */ }
                            console.log("[usePermissions] Using cached matrix from localStorage.");
                        }
                    }
                }
            } catch (err) {
                console.error("[usePermissions] Unexpected error:", err);
                if (!cancelled && staffRole === null) setStaffRole("Atendente");
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
        if (!rolePerms) return false;
        return rolePerms[permission] ?? false;
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
        loading: authLoading || !dataLoaded,
        hasPermission,
        canAccessRoute,
        getAccessibleRoutes,
        matrix,
    };
}

export { ROUTE_PERMISSION_MAP, ALWAYS_ALLOWED_ROUTES, DEFAULT_MATRIX, ROLES };
export type { PermissionKey, RoleName, PermissionMatrix };
