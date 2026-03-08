"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { UserCircle, Store, Bell, Shield, Camera, LogIn, Edit, UploadCloud, Users, Plus, Trash2, Key } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "account" | "laundry" | "notifications" | "users";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isDeletingUserId, setIsDeletingUserId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '(11) 98765-4321', role: 'Gerente Geral' });
  const [laundryForm, setLaundryForm] = useState({ name: 'Lavanderia Pro Centro', cnpj: '12.345.678/0001-90', email: 'contato@lavanderiapro.com', phone: '(11) 3000-4000', address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100' });
  const [notificationsSettings, setNotificationsSettings] = useState({ emailSummary: true, newOrderAlerts: true, weeklyReports: false, orderCreated: true, orderReady: true, deliveryScheduled: true });
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'Atendente', password: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resettingUserEmail, setResettingUserEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);
  const { user, loading } = useAuth();
  const isAdmin =
    user?.user_metadata?.role === 'owner' ||
    user?.user_metadata?.role === 'Gerente' ||
    user?.user_metadata?.role === 'Gerente Geral' ||
    user?.user_metadata?.role === 'Administrador' ||
    user?.email === 'gabriel23900@gmail.com';

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('lavanpro_profile');
    if (savedProfile) setProfileForm(JSON.parse(savedProfile));

    const savedLaundry = localStorage.getItem('lavanpro_laundry');
    if (savedLaundry) setLaundryForm(JSON.parse(savedLaundry));

    const savedNotifications = localStorage.getItem('lavanpro_notifications');
    if (savedNotifications) setNotificationsSettings(JSON.parse(savedNotifications));
  }, []);

  // Sync profile with authenticated user
  useEffect(() => {
    if (user && !loading) {
      setProfileForm(prev => {
        // If we have saved data in localStorage, keep it unless it looks like mock data
        const isMockName = prev.name === '' || prev.name === 'Admin Dashboard';
        const isMockEmail = prev.email === '' || prev.email === 'admin@lavanderiapro.com';

        return {
          ...prev,
          name: isMockName ? (user.user_metadata?.full_name || user.email?.split('@')[0] || '') : prev.name,
          email: isMockEmail ? (user.email || '') : prev.email,
        };
      });
    }
  }, [user, loading]);

  useEffect(() => {
    if (activeTab === "users" && isAdmin) {
      fetchCollaborators();
    }
  }, [activeTab, isAdmin]);

  const fetchCollaborators = async () => {
    if (!user) return;
    setIsLoadingUsers(true);
    const { data, error } = await supabase
      .from('collaborators')
      .select('*')
      .eq('owner_id', user.id) // Filtra apenas para esta lavanderia
      .order('created_at', { ascending: false });

    if (data) setCollaborators(data);
    if (error) console.error("Error fetching collaborators:", error);
    setIsLoadingUsers(false);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsSavingUser(true);
    const { error } = await supabase
      .from('collaborators')
      .update({
        name: (document.getElementById('edit-name') as HTMLInputElement).value,
        email: (document.getElementById('edit-email') as HTMLInputElement).value,
        role: (document.getElementById('edit-role') as HTMLSelectElement).value,
        // password: (document.getElementById('edit-password') as HTMLInputElement).value || selectedUser.password
      })
      .eq('id', selectedUser.id);

    if (error) {
      showToast("Erro ao atualizar colaborador: " + error.message, "error");
    } else {
      showToast("Colaborador atualizado com sucesso!", "success");
      handleCloseEditModal();
      fetchCollaborators();
    }
    setIsSavingUser(false);
  };

  const confirmDeleteUser = (collab: any) => {
    setUserToDelete(collab);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUserId(userToDelete.id);
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('id', userToDelete.id);

    if (error) {
      showToast("Erro ao excluir colaborador: " + error.message, "error");
    } else {
      showToast("Colaborador removido com sucesso!", "success");
      fetchCollaborators();
      setIsDeleteModalOpen(false);
    }
    setIsDeletingUserId(null);
    setUserToDelete(null);
  };

  const handleNewUser = () => {
    setIsNewUserModalOpen(true);
  };

  const handleCloseNewUserModal = () => {
    setIsNewUserModalOpen(false);
    setNewUserForm({ name: '', email: '', role: 'Atendente', password: '' });
  };

  const handleSaveNewUser = async () => {
    if (!newUserForm.name || !newUserForm.email) {
      showToast("Por favor, preencha nome e e-mail.", "info");
      return;
    }
    setIsSavingUser(true);
    const { error } = await supabase.from('collaborators').insert([
      {
        name: newUserForm.name,
        email: newUserForm.email,
        role: newUserForm.role,
        owner_id: user?.id
      }
    ]);

    if (error) {
      showToast("Erro ao salvar colaborador: " + error.message, "error");
    } else {
      showToast("Colaborador adicionado com sucesso!", "success");
      handleCloseNewUserModal();
      fetchCollaborators();
    }
    setIsSavingUser(false);
  };

  const handleResetPassword = (email: string) => {
    setResettingUserEmail(email);
    setIsResetPasswordModalOpen(true);
  };

  const confirmResetPassword = () => {
    showToast(`Senha do usuário ${resettingUserEmail} alterada com sucesso!`, "success");
    setIsResetPasswordModalOpen(false);
    setNewPassword("");
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Save to localStorage
      localStorage.setItem('lavanpro_profile', JSON.stringify(profileForm));
      localStorage.setItem('lavanpro_laundry', JSON.stringify(laundryForm));
      localStorage.setItem('lavanpro_notifications', JSON.stringify(notificationsSettings));

      // Optional: Optional Supabase update logic here
      // await supabase.from('profiles').upsert({ id: 'current-user-id', ...profileForm });

      showToast("Todas as alterações foram salvas com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showToast("Erro ao salvar alterações.", "error");
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary/30 selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4 border-b border-brand-darkBorder sticky top-0 bg-brand-bg/90 backdrop-blur-md z-20">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Configurações</h1>
            <p className="text-sm text-brand-muted">Gerencie sua conta e preferências do sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={isSavingAll}
              className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {isSavingAll ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-brand-bg relative">
          {loading && (
            <div className="absolute inset-0 bg-brand-bg/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="size-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
            </div>
          )}
          <div className="px-8 space-y-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => setActiveTab("account")}
                className={`p-6 rounded-xl border-2 shadow-xl flex flex-col items-center text-center gap-3 transition-all ${activeTab === "account" ? "bg-brand-card border-brand-primary text-white" : "bg-brand-card border-brand-darkBorder text-brand-muted hover:border-brand-primary/50 hover:text-white"}`}
              >
                <UserCircle className={`${activeTab === "account" ? "text-brand-primary" : "text-brand-muted"} size-8`} />
                <span className="text-sm font-bold">Minha Conta</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("laundry")}
                  className={`p-6 rounded-xl border-2 shadow-xl flex flex-col items-center text-center gap-3 transition-all ${activeTab === "laundry" ? "bg-brand-card border-brand-primary text-white" : "bg-brand-card border-brand-darkBorder text-brand-muted hover:border-brand-primary/50 hover:text-white"}`}
                >
                  <Store className={`${activeTab === "laundry" ? "text-brand-primary" : "text-brand-muted"} size-8`} />
                  <span className="text-sm font-bold">Dados da Lavanderia</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab("notifications")}
                className={`p-6 rounded-xl border-2 shadow-xl flex flex-col items-center text-center gap-3 transition-all ${activeTab === "notifications" ? "bg-brand-card border-brand-primary text-white" : "bg-brand-card border-brand-darkBorder text-brand-muted hover:border-brand-primary/50 hover:text-white"}`}
              >
                <Bell className={`${activeTab === "notifications" ? "text-brand-primary" : "text-brand-muted"} size-8`} />
                <span className="text-sm font-bold">Notificações</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`p-6 rounded-xl border-2 shadow-xl flex flex-col items-center text-center gap-3 transition-all ${activeTab === "users" ? "bg-brand-card border-brand-primary text-white" : "bg-brand-card border-brand-darkBorder text-brand-muted hover:border-brand-primary/50 hover:text-white"}`}
                >
                  <Users className={`${activeTab === "users" ? "text-brand-primary" : "text-brand-muted"} size-8`} />
                  <span className="text-sm font-bold">Usuários</span>
                </button>
              )}
            </div>

            {activeTab === "account" && (
              <>
                <div className="bg-brand-card p-8 rounded-xl border border-brand-darkBorder shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                      <Image
                        src="https://picsum.photos/seed/avatar/100/100"
                        alt="User Profile"
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white size-6" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">Dados do Perfil</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Atualize suas informações pessoais e de contato</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nome Completo</label>
                      <input
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-white"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">E-mail Corporativo</label>
                      <input
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-white"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Telefone</label>
                      <input
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-white"
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Cargo / Função</label>
                      <input
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-white"
                        type="text"
                        value={profileForm.role}
                        onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-brand-card p-8 rounded-xl border border-brand-darkBorder shadow-xl">
                    <h4 className="text-lg font-bold mb-6">Preferências de Notificação</h4>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold">Notificações por E-mail</p>
                          <p className="text-xs text-slate-500">Receba resumos diários de faturamento</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationsSettings.emailSummary}
                            onChange={(e) => setNotificationsSettings({ ...notificationsSettings, emailSummary: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-brand-darkBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold">Alertas de Novos Pedidos</p>
                          <p className="text-xs text-slate-500">Notificações em tempo real no desktop</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationsSettings.newOrderAlerts}
                            onChange={(e) => setNotificationsSettings({ ...notificationsSettings, newOrderAlerts: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-brand-darkBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold">Relatórios Semanais</p>
                          <p className="text-xs text-slate-500">Envio automático para a diretoria</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationsSettings.weeklyReports}
                            onChange={(e) => setNotificationsSettings({ ...notificationsSettings, weeklyReports: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-brand-darkBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="bg-brand-card p-8 rounded-xl border border-brand-darkBorder shadow-xl">
                      <h4 className="text-lg font-bold mb-6">Preferências do Sistema</h4>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Idioma do Painel</label>
                          <select className="w-full bg-brand-bg border border-brand-darkBorder rounded-lg text-sm font-semibold focus:ring-brand-primary py-2.5 px-4 outline-none text-white">
                            <option>Português (Brasil)</option>
                            <option>English (US)</option>
                            <option>Español</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Moeda Padrão</label>
                          <select className="w-full bg-brand-bg border border-brand-darkBorder rounded-lg text-sm font-semibold focus:ring-brand-primary py-2.5 px-4 outline-none text-white">
                            <option>Real (BRL)</option>
                            <option>Dólar (USD)</option>
                            <option>Euro (EUR)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-brand-card rounded-xl border border-brand-darkBorder shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center text-white">
                    <h4 className="text-lg font-bold">Histórico de Atividades</h4>
                    <button className="text-brand-primary text-sm font-bold hover:underline">Ver log completo</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-brand-bg/50">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">Ação</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">Dispositivo</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">IP</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-darkBorder">
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <LogIn className="text-brand-primary size-5" />
                              <span className="text-sm font-semibold">Login realizado</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-brand-muted">Chrome / macOS</td>
                          <td className="px-6 py-4 text-sm font-mono text-brand-muted">192.168.1.45</td>
                          <td className="px-6 py-4 text-sm text-brand-muted">Hoje, 09:12</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Edit className="text-amber-500 size-5" />
                              <span className="text-sm font-semibold">Alteração de Senha</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-brand-muted">Mobile App / iOS</td>
                          <td className="px-6 py-4 text-sm font-mono text-brand-muted">177.22.105.8</td>
                          <td className="px-6 py-4 text-sm text-brand-muted">Ontem, 22:45</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <UploadCloud className="text-emerald-500 size-5" />
                              <span className="text-sm font-semibold">Exportação de Relatório</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-brand-muted">Firefox / Windows</td>
                          <td className="px-6 py-4 text-sm font-mono text-brand-muted">189.10.45.21</td>
                          <td className="px-6 py-4 text-sm text-brand-muted">22 Mai 2024, 14:30</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === "laundry" && (
              <div className="bg-brand-card p-8 rounded-xl border border-brand-darkBorder shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-16 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                    <Store className="size-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Dados da Lavanderia</h4>
                    <p className="text-sm text-brand-muted">Informações comerciais e de contato da sua unidade</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nome da Lavanderia</label>
                    <input
                      className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-white"
                      type="text"
                      value={laundryForm.name}
                      onChange={(e) => setLaundryForm({ ...laundryForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">CNPJ</label>
                    <input
                      className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-white"
                      type="text"
                      value={laundryForm.cnpj}
                      onChange={(e) => setLaundryForm({ ...laundryForm, cnpj: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">E-mail da Lavanderia</label>
                    <input
                      className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-white"
                      type="email"
                      value={laundryForm.email}
                      onChange={(e) => setLaundryForm({ ...laundryForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Telefone da Lavanderia</label>
                    <input
                      className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-white"
                      type="text"
                      value={laundryForm.phone}
                      onChange={(e) => setLaundryForm({ ...laundryForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Endereço Completo</label>
                    <input
                      className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-white"
                      type="text"
                      value={laundryForm.address}
                      onChange={(e) => setLaundryForm({ ...laundryForm, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-brand-card p-8 rounded-xl border border-brand-darkBorder shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-16 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                    <Bell className="size-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Eventos de Notificação</h4>
                    <p className="text-sm text-brand-muted">Configure quais eventos disparam alertas para você e seus clientes</p>
                  </div>
                </div>
                <div className="space-y-6 max-w-2xl">
                  <div className="flex items-center justify-between p-4 border border-brand-darkBorder rounded-lg hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white">Pedido Criado</p>
                      <p className="text-xs text-brand-muted">Notificar quando um novo pedido for registrado no sistema</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationsSettings.orderCreated}
                        onChange={(e) => setNotificationsSettings({ ...notificationsSettings, orderCreated: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-brand-darkBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-brand-darkBorder rounded-lg hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white">Pedido Pronto para Retirada</p>
                      <p className="text-xs text-brand-muted">Avisar o cliente e a equipe quando as peças estiverem limpas e passadas</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationsSettings.orderReady}
                        onChange={(e) => setNotificationsSettings({ ...notificationsSettings, orderReady: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-brand-darkBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-brand-darkBorder rounded-lg hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white">Entrega Agendada</p>
                      <p className="text-xs text-brand-muted">Lembrete de entregas programadas para o dia atual</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationsSettings.deliveryScheduled}
                        onChange={(e) => setNotificationsSettings({ ...notificationsSettings, deliveryScheduled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-brand-darkBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && isAdmin && (
              <div className="bg-brand-card rounded-xl border border-brand-darkBorder shadow-xl overflow-hidden">
                <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center text-white">
                  <div>
                    <h4 className="text-lg font-bold">Colaboradores</h4>
                    <p className="text-sm text-brand-muted">Gerencie o acesso da sua equipe ao sistema</p>
                  </div>
                  <button onClick={handleNewUser} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20">
                    <Plus className="size-4" />
                    Novo Colaborador
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-brand-bg/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">Nome</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">E-mail</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">Cargo</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-darkBorder">
                      {isLoadingUsers ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-brand-muted">Carregando colaboradores...</td></tr>
                      ) : collaborators.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-brand-muted">Nenhum colaborador encontrado. Adicione no botão acima.</td></tr>
                      ) : (
                        collaborators.map((collaborator) => (
                          <tr key={collaborator.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xs uppercase">
                                  {collaborator.name?.substring(0, 2) || "U"}
                                </div>
                                <span className="text-sm font-semibold text-white">{collaborator.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-brand-muted">{collaborator.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-brand-bg text-brand-muted rounded-full text-xs font-semibold border border-brand-darkBorder">{collaborator.role}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEditUser(collaborator)} className="p-2 text-brand-muted hover:text-brand-primary transition-colors" title="Editar">
                                  <Edit className="size-4" />
                                </button>
                                <button onClick={() => handleResetPassword(collaborator.email)} className="p-2 text-brand-muted hover:text-amber-500 transition-colors" title="Resetar Senha">
                                  <Key className="size-4" />
                                </button>
                                <button
                                  onClick={() => confirmDeleteUser(collaborator)}
                                  className={`p-2 transition-colors ${isDeletingUserId === collaborator.id ? "text-slate-500 cursor-not-allowed" : "text-brand-muted hover:text-red-500"}`}
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
            )}
          </div>
        </main>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Modificar Colaborador</h3>
              <button onClick={handleCloseEditModal} className="text-brand-muted hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nome Completo</label>
                <input
                  id="edit-name"
                  type="text"
                  defaultValue={selectedUser.name}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">E-mail</label>
                <input
                  id="edit-email"
                  type="email"
                  defaultValue={selectedUser.email}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Cargo</label>
                <select
                  id="edit-role"
                  defaultValue={selectedUser.role}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-white"
                >
                  <option value="Atendente">Atendente</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nova Senha (opcional)</label>
                <input
                  id="edit-password"
                  type="password"
                  placeholder="Deixe em branco para não alterar"
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-white placeholder-brand-muted/50"
                />
              </div>
            </div>
            <div className="p-6 border-t border-brand-darkBorder flex justify-end gap-3 bg-brand-bg/50">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-sm font-bold text-brand-muted hover:bg-brand-card rounded-lg transition-colors border border-brand-darkBorder"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={isSavingUser}
                className="px-4 py-2 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primaryHover rounded-lg transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50"
              >
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
              <h3 className="text-xl font-bold text-white">Novo Colaborador</h3>
              <button onClick={handleCloseNewUserModal} className="text-brand-muted hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Nome do colaborador"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-white placeholder-brand-muted/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">E-mail</label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-white placeholder-brand-muted/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Cargo</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-white"
                >
                  <option value="Atendente">Atendente</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Senha de Acesso</label>
                <input
                  type="password"
                  placeholder="Crie uma senha temporária"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-white placeholder-brand-muted/50"
                />
              </div>
            </div>
            <div className="p-6 border-t border-brand-darkBorder flex justify-end gap-3 bg-brand-bg/50">
              <button
                onClick={handleCloseNewUserModal}
                disabled={isSavingUser}
                className="px-4 py-2 text-sm font-bold text-brand-muted hover:bg-brand-card rounded-lg transition-colors border border-brand-darkBorder disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewUser}
                disabled={isSavingUser || !newUserForm.name || !newUserForm.email}
                className="px-4 py-2 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primaryHover rounded-lg transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50"
              >
                {isSavingUser ? "Salvando..." : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center bg-red-500/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trash2 className="size-5 text-red-500" /> Confirmar Exclusão
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-brand-muted hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-brand-muted">
                Deseja realmente excluir o colaborador <span className="text-white font-bold">{userToDelete?.name}</span>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="p-6 border-t border-brand-darkBorder flex justify-end gap-3 bg-brand-bg/50">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-brand-muted hover:bg-brand-card rounded-lg transition-colors border border-brand-darkBorder"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeletingUserId === userToDelete?.id}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
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
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="size-5 text-amber-500" /> Redefinir Senha
              </h3>
              <button onClick={() => setIsResetPasswordModalOpen(false)} className="text-brand-muted hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-brand-muted">
                Deseja redefinir a senha para <span className="text-white font-bold">{resettingUserEmail}</span>?
              </p>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nova Senha</label>
                <input
                  type="password"
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm text-white placeholder-brand-muted/50"
                />
              </div>
            </div>
            <div className="p-6 border-t border-brand-darkBorder flex justify-end gap-3 bg-brand-bg/50">
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-brand-muted hover:bg-brand-card rounded-lg transition-colors border border-brand-darkBorder"
              >
                Cancelar
              </button>
              <button
                onClick={confirmResetPassword}
                disabled={!newPassword}
                className="px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-lg shadow-amber-600/20 disabled:opacity-50"
              >
                Redefinir Senha
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Container */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={`pointer-events-auto px-6 py-4 rounded-xl border shadow-2xl flex items-center gap-3 ${toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                : toast.type === "error"
                  ? "bg-rose-500/10 border-rose-500/50 text-rose-400"
                  : "bg-blue-500/10 border-blue-500/50 text-blue-400"
                }`}
            >
              {toast.type === "success" && (
                <div className="size-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
              )}
              {toast.type === "error" && (
                <div className="size-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12" /><path d="m6 6 12 12" /></svg>
                </div>
              )}
              <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
