"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/hooks/useSubscription";
import { useBusinessData } from "@/components/business-data-provider";
import { Users, Plus, Edit, Trash2, Key, Search, Lock, AlertTriangle } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface UsersTabProps {
    user: User | null;
    showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function UsersTab({ user, showToast }: UsersTabProps) {
    const { isStarter, isPro, isEnterprise } = useSubscription();
    const { data: businessData } = useBusinessData();
    const units = businessData?.units || [];
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSavingUser, setIsSavingUser] = useState(false);
    const [isDeletingUserId, setIsDeletingUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [resettingUserEmail, setResettingUserEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newUserForm, setNewUserForm] = useState({ name: "", email: "", role: "Atendente", password: "", unit: "Todas as Unidades" });

    useEffect(() => {
        fetchCollaborators();
        
        window.addEventListener("data-synced", fetchCollaborators);
        return () => window.removeEventListener("data-synced", fetchCollaborators);
    }, [user]);

    const fetchCollaborators = async () => {
        if (!user) return;
        setIsLoadingUsers(true);
        try {
            // Usamos RPC para garantir que o owner_id seja resolvido corretamente no servidor
            const { data, error } = await supabase.rpc('get_staff_members');

            if (error) throw error;
            if (data) setCollaborators(data);
        } catch (error) {
            console.error("Error fetching staff:", error);
            showToast("Erro ao carregar colaboradores", "error");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleSaveNewUser = async () => {
        if (!newUserForm.name || !newUserForm.email) {
            showToast("Por favor, preencha nome e e-mail.", "info");
            return;
        }
        setIsSavingUser(true);

        try {
            // Usamos RPC para garantir que o owner_id seja o raiz da organização,
            // mesmo que quem esteja adicionando seja um gerente/administrador.
            const { error } = await supabase.rpc('add_staff_member', {
                p_name: newUserForm.name,
                p_email: newUserForm.email,
                p_role: newUserForm.role,
                p_unit: newUserForm.unit
            });

            if (error) throw error;

            showToast("Colaborador adicionado com sucesso!", "success");
            setNewUserForm({ name: "", email: "", role: "Atendente", password: "", unit: "Todas as Unidades" });
            setIsNewUserModalOpen(false);
            fetchCollaborators();
            window.dispatchEvent(new CustomEvent("data-synced"));
        } catch (error: any) {
            showToast("Erro ao salvar colaborador: " + (error.message || "Erro desconhecido"), "error");
        } finally {
            setIsSavingUser(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setIsSavingUser(true);

        try {
            const { error } = await supabase.rpc('update_staff_member', {
                p_id: selectedUser.id,
                p_name: (document.getElementById("edit-name") as HTMLInputElement).value,
                p_email: (document.getElementById("edit-email") as HTMLInputElement).value,
                p_role: (document.getElementById("edit-role") as HTMLSelectElement).value,
                p_unit: (document.getElementById("edit-unit") as HTMLSelectElement).value,
                p_active: true
            });

            if (error) throw error;

            showToast("Colaborador atualizado com sucesso!", "success");
            setIsEditModalOpen(false);
            setSelectedUser(null);
            fetchCollaborators();
            window.dispatchEvent(new CustomEvent("data-synced"));
        } catch (error: any) {
            showToast("Erro ao atualizar colaborador: " + error.message, "error");
        } finally {
            setIsSavingUser(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setIsDeletingUserId(userToDelete.id);

        try {
            const { error } = await supabase.rpc('delete_staff_member', {
                p_id: userToDelete.id
            });

            if (error) throw error;

            showToast("Colaborador removido com sucesso!", "success");
            fetchCollaborators();
            setIsDeleteModalOpen(false);
            window.dispatchEvent(new CustomEvent("data-synced"));
        } catch (error: any) {
            showToast("Erro ao excluir colaborador: " + error.message, "error");
        } finally {
            setIsDeletingUserId(null);
            setUserToDelete(null);
        }
    };

    const confirmResetPassword = () => {
        showToast(`Senha do usuário ${resettingUserEmail} alterada com sucesso!`, "success");
        setIsResetPasswordModalOpen(false);
        setNewPassword("");
    };

    const filtered = collaborators.filter(
        (c) =>
            c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="size-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Users className="size-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-text">Usuários</h3>
                        <p className="text-sm text-brand-muted">Gerencie o acesso da sua equipe ao sistema</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        const limit = isEnterprise ? Infinity : (isPro ? 5 : 1);
                        // Filter active or all collaborators? Typically all collaborators count.
                        if (collaborators.length >= limit) {
                            setIsUpgradeModalOpen(true);
                        } else {
                            setIsNewUserModalOpen(true);
                        }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20"
                >
                    <Plus className="size-4" />
                    Novo Colaborador
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou e-mail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text placeholder-brand-muted/50"
                />
            </div>

            {/* Users Table */}
            <div className="bg-brand-card rounded-xl border border-brand-darkBorder shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-brand-bg/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">Nome</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">E-mail</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">Cargo</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">Unidade</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-darkBorder">
                            {isLoadingUsers ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-8 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                                            <span className="text-sm text-brand-muted">Carregando colaboradores...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-brand-muted">
                                        <Users className="size-12 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm font-medium">Nenhum colaborador encontrado</p>
                                        <p className="text-xs mt-1">Adicione colaboradores usando o botão acima</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((collaborator) => (
                                    <tr key={collaborator.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xs uppercase">
                                                    {collaborator.name?.substring(0, 2) || "U"}
                                                </div>
                                                <span className="text-sm font-semibold text-brand-text">{collaborator.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">{collaborator.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-brand-bg text-brand-muted rounded-full text-xs font-semibold border border-brand-darkBorder">
                                                {collaborator.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">
                                            {collaborator.unit || "Todas"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-semibold border border-emerald-500/20">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                Ativo
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(collaborator);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setResettingUserEmail(collaborator.email);
                                                        setIsResetPasswordModalOpen(true);
                                                    }}
                                                    className="p-2 text-brand-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                                                    title="Resetar Senha"
                                                >
                                                    <Key className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setUserToDelete(collaborator);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className={`p-2 rounded-lg transition-colors ${isDeletingUserId === collaborator.id
                                                        ? "text-slate-500 cursor-not-allowed"
                                                        : "text-brand-muted hover:text-red-500 hover:bg-red-500/10"
                                                        }`}
                                                    title="Excluir"
                                                    disabled={isDeletingUserId === collaborator.id}
                                                >
                                                    {isDeletingUserId === collaborator.id ? (
                                                        <div className="size-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Trash2 className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== MODALS ===== */}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center">
                            <h3 className="text-xl font-bold text-brand-text">Modificar Colaborador</h3>
                            <button onClick={() => { setIsEditModalOpen(false); setSelectedUser(null); }} className="text-brand-muted hover:text-brand-text transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nome Completo</label>
                                <input id="edit-name" type="text" defaultValue={selectedUser.name} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-brand-text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">E-mail</label>
                                <input id="edit-email" type="email" defaultValue={selectedUser.email} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-brand-text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Cargo</label>
                                <select id="edit-role" defaultValue={selectedUser.role} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-brand-text">
                                    <option value="Atendente">Atendente</option>
                                    <option value="Gerente">Gerente</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Estoquista">Estoquista</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Unidade de Acesso</label>
                                <select id="edit-unit" defaultValue={selectedUser.unit || "Todas as Unidades"} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-brand-text">
                                    <option value="Todas as Unidades">Todas as Unidades</option>
                                    {units.map((u: any) => (
                                        <option key={u.id} value={u.name}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-brand-darkBorder flex justify-end gap-3 bg-brand-bg/50">
                            <button onClick={() => { setIsEditModalOpen(false); setSelectedUser(null); }} className="px-4 py-2 text-sm font-bold text-brand-muted hover:bg-brand-card rounded-lg transition-colors border border-brand-darkBorder">Cancelar</button>
                            <button onClick={handleUpdateUser} disabled={isSavingUser} className="px-4 py-2 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primaryHover rounded-lg transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50">
                                {isSavingUser ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New User Modal */}
            {isNewUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center">
                            <h3 className="text-xl font-bold text-brand-text">Novo Colaborador</h3>
                            <button onClick={() => { setIsNewUserModalOpen(false); setNewUserForm({ name: "", email: "", role: "Atendente", password: "", unit: "Todas as Unidades" }); }} className="text-brand-muted hover:text-brand-text transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nome Completo</label>
                                <input type="text" placeholder="Nome do colaborador" value={newUserForm.name} onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-brand-text placeholder-brand-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">E-mail</label>
                                <input type="email" placeholder="email@exemplo.com" value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-brand-text placeholder-brand-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Cargo</label>
                                <select value={newUserForm.role} onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-brand-text">
                                    <option value="Atendente">Atendente</option>
                                    <option value="Gerente">Gerente</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Estoquista">Estoquista</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Unidade de Acesso</label>
                                <select value={newUserForm.unit} onChange={(e) => setNewUserForm({ ...newUserForm, unit: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-brand-text">
                                    <option value="Todas as Unidades">Todas as Unidades</option>
                                    {units.map((u: any) => (
                                        <option key={u.id} value={u.name}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Senha de Acesso</label>
                                <input type="password" placeholder="Crie uma senha temporária" value={newUserForm.password} onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-brand-text placeholder-brand-muted/50" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-brand-darkBorder flex justify-end gap-3 bg-brand-bg/50">
                            <button onClick={() => { setIsNewUserModalOpen(false); setNewUserForm({ name: "", email: "", role: "Atendente", password: "", unit: "Todas as Unidades" }); }} disabled={isSavingUser} className="px-4 py-2 text-sm font-bold text-brand-muted hover:bg-brand-card rounded-lg transition-colors border border-brand-darkBorder disabled:opacity-50">Cancelar</button>
                            <button onClick={handleSaveNewUser} disabled={isSavingUser || !newUserForm.name || !newUserForm.email} className="px-4 py-2 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primaryHover rounded-lg transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50">
                                {isSavingUser ? "Salvando..." : "Adicionar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center bg-red-500/10">
                            <h3 className="text-xl font-bold text-brand-text flex items-center gap-2">
                                <Trash2 className="size-5 text-red-500" /> Confirmar Exclusão
                            </h3>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="text-brand-muted hover:text-brand-text transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-brand-muted">
                                Deseja realmente excluir o colaborador <span className="text-brand-text font-bold">{userToDelete?.name}</span>? Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="p-6 border-t border-brand-darkBorder flex justify-end gap-3 bg-brand-bg/50">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-brand-muted hover:bg-brand-card rounded-lg transition-colors border border-brand-darkBorder">Cancelar</button>
                            <button onClick={handleDeleteUser} disabled={isDeletingUserId === userToDelete?.id} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50">
                                {isDeletingUserId === userToDelete?.id ? "Excluindo..." : "Confirmar Exclusão"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {isResetPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center bg-amber-500/10">
                            <h3 className="text-xl font-bold text-brand-text flex items-center gap-2">
                                <Key className="size-5 text-amber-500" /> Redefinir Senha
                            </h3>
                            <button onClick={() => setIsResetPasswordModalOpen(false)} className="text-brand-muted hover:text-brand-text transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-brand-muted">
                                Deseja redefinir a senha para <span className="text-brand-text font-bold">{resettingUserEmail}</span>?
                            </p>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nova Senha</label>
                                <input type="password" placeholder="Digite a nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-brand-text placeholder-brand-muted/50" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-brand-darkBorder flex justify-end gap-3 bg-brand-bg/50">
                            <button onClick={() => setIsResetPasswordModalOpen(false)} className="px-4 py-2 text-sm font-bold text-brand-muted hover:bg-brand-card rounded-lg transition-colors border border-brand-darkBorder">Cancelar</button>
                            <button onClick={confirmResetPassword} disabled={!newPassword} className="px-4 py-2 text-sm font-bold text-brand-text bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-lg shadow-amber-600/20 disabled:opacity-50">Redefinir Senha</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Limit Modal */}
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center bg-amber-500/10">
                            <h3 className="text-xl font-bold text-brand-text flex items-center gap-2">
                                <Lock className="size-5 text-amber-500" /> Limite Atingido
                            </h3>
                            <button onClick={() => setIsUpgradeModalOpen(false)} className="text-brand-muted hover:text-brand-text transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="mx-auto size-16 bg-amber-500/10 rounded-full flex items-center justify-center">
                                <AlertTriangle className="size-8 text-amber-500" />
                            </div>
                            <p className="text-sm text-brand-muted text-center font-medium">
                                Você atingiu o limite de colaboradores para o seu plano atual.
                            </p>
                            <p className="text-xs text-brand-muted/70 text-center">
                                {isStarter ? "O plano Starter inclui até 1 usuário. Faça o upgrade para expandir sua equipe." : "O plano Pro inclui até 5 usuários. Faça o upgrade para o Enterprise para equipe ilimitada."}
                            </p>
                        </div>
                        <div className="p-6 border-t border-brand-darkBorder flex flex-col gap-3 bg-brand-bg/50">
                            {/* In a real app we would navigate to a billing page or trigger the PlansModal here */}
                            <button onClick={() => setIsUpgradeModalOpen(false)} className="w-full py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all">Entendi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
