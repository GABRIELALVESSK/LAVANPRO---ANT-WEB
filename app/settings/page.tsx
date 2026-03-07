"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { UserCircle, Store, Bell, Shield, Camera, LogIn, Edit, UploadCloud, Users, Plus, Trash2, Key } from "lucide-react";
import Image from "next/image";

type Tab = "account" | "laundry" | "notifications" | "users";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const isAdmin = true; // Simulating admin access

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleNewUser = () => {
    setIsNewUserModalOpen(true);
  };

  const handleCloseNewUserModal = () => {
    setIsNewUserModalOpen(false);
  };

  const handleResetPassword = (email: string) => {
    // In a real app, call sendPasswordResetEmail(auth, email)
    alert(`E-mail de redefinição de senha enviado para: ${email}`);
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Configurações</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie sua conta e preferências do sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all">
              Salvar Alterações
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
          <div className="px-8 space-y-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => setActiveTab("account")}
                className={`p-6 rounded-xl border-2 shadow-sm flex flex-col items-center text-center gap-3 transition-all ${activeTab === "account" ? "bg-white dark:bg-slate-800 border-primary" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/50"}`}
              >
                <UserCircle className={`${activeTab === "account" ? "text-primary" : "text-slate-400"} size-8`} />
                <span className="text-sm font-bold">Minha Conta</span>
              </button>
              <button 
                onClick={() => setActiveTab("laundry")}
                className={`p-6 rounded-xl border-2 shadow-sm flex flex-col items-center text-center gap-3 transition-all ${activeTab === "laundry" ? "bg-white dark:bg-slate-800 border-primary" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/50"}`}
              >
                <Store className={`${activeTab === "laundry" ? "text-primary" : "text-slate-400"} size-8`} />
                <span className="text-sm font-bold">Dados da Lavanderia</span>
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`p-6 rounded-xl border-2 shadow-sm flex flex-col items-center text-center gap-3 transition-all ${activeTab === "notifications" ? "bg-white dark:bg-slate-800 border-primary" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/50"}`}
              >
                <Bell className={`${activeTab === "notifications" ? "text-primary" : "text-slate-400"} size-8`} />
                <span className="text-sm font-bold">Notificações</span>
              </button>
              {isAdmin && (
                <button 
                  onClick={() => setActiveTab("users")}
                  className={`p-6 rounded-xl border-2 shadow-sm flex flex-col items-center text-center gap-3 transition-all ${activeTab === "users" ? "bg-white dark:bg-slate-800 border-primary" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/50"}`}
                >
                  <Users className={`${activeTab === "users" ? "text-primary" : "text-slate-400"} size-8`} />
                  <span className="text-sm font-bold">Usuários</span>
                </button>
              )}
            </div>

            {activeTab === "account" && (
              <>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome Completo</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" type="text" defaultValue="Admin Dashboard" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">E-mail Corporativo</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" type="email" defaultValue="admin@lavanderiapro.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Telefone</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" type="text" defaultValue="(11) 98765-4321" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cargo / Função</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" type="text" defaultValue="Gerente Geral" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <h4 className="text-lg font-bold mb-6">Preferências de Notificação</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Notificações por E-mail</p>
                      <p className="text-xs text-slate-500">Receba resumos diários de faturamento</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Alertas de Novos Pedidos</p>
                      <p className="text-xs text-slate-500">Notificações em tempo real no desktop</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Relatórios Semanais</p>
                      <p className="text-xs text-slate-500">Envio automático para a diretoria</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <h4 className="text-lg font-bold mb-6">Preferências do Sistema</h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Idioma do Painel</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold focus:ring-primary py-2.5 px-4 outline-none">
                      <option>Português (Brasil)</option>
                      <option>English (US)</option>
                      <option>Español</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Moeda Padrão</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold focus:ring-primary py-2.5 px-4 outline-none">
                      <option>Real (BRL)</option>
                      <option>Dólar (USD)</option>
                      <option>Euro (EUR)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h4 className="text-lg font-bold">Histórico de Atividades</h4>
                <button className="text-primary text-sm font-bold hover:underline">Ver log completo</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Ação</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Dispositivo</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">IP</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <LogIn className="text-primary size-5" />
                          <span className="text-sm font-semibold">Login realizado</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Chrome / macOS</td>
                      <td className="px-6 py-4 text-sm font-mono">192.168.1.45</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Hoje, 09:12</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Edit className="text-amber-500 size-5" />
                          <span className="text-sm font-semibold">Alteração de Senha</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Mobile App / iOS</td>
                      <td className="px-6 py-4 text-sm font-mono">177.22.105.8</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Ontem, 22:45</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UploadCloud className="text-emerald-500 size-5" />
                          <span className="text-sm font-semibold">Exportação de Relatório</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Firefox / Windows</td>
                      <td className="px-6 py-4 text-sm font-mono">189.10.45.21</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">22 Mai 2024, 14:30</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
              </>
            )}

            {activeTab === "laundry" && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Store className="size-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Dados da Lavanderia</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Informações comerciais e de contato da sua unidade</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome da Lavanderia</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" type="text" defaultValue="Lavanderia Pro Centro" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">CNPJ</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" type="text" defaultValue="12.345.678/0001-90" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">E-mail da Lavanderia</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" type="email" defaultValue="contato@lavanderiapro.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Telefone da Lavanderia</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" type="text" defaultValue="(11) 3000-4000" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Endereço Completo</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" type="text" defaultValue="Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Bell className="size-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Eventos de Notificação</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Configure quais eventos disparam alertas para você e seus clientes</p>
                  </div>
                </div>
                <div className="space-y-6 max-w-2xl">
                  <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-lg">
                    <div>
                      <p className="text-sm font-bold">Pedido Criado</p>
                      <p className="text-xs text-slate-500">Notificar quando um novo pedido for registrado no sistema</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-lg">
                    <div>
                      <p className="text-sm font-bold">Pedido Pronto para Retirada</p>
                      <p className="text-xs text-slate-500">Avisar o cliente e a equipe quando as peças estiverem limpas e passadas</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-lg">
                    <div>
                      <p className="text-sm font-bold">Entrega Agendada</p>
                      <p className="text-xs text-slate-500">Lembrete de entregas programadas para o dia atual</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && isAdmin && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-bold">Colaboradores</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie o acesso da sua equipe ao sistema</p>
                  </div>
                  <button onClick={handleNewUser} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all">
                    <Plus className="size-4" />
                    Novo Colaborador
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Nome</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">E-mail</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Cargo</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                              JS
                            </div>
                            <span className="text-sm font-semibold">João Silva</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">joao.silva@lavanderiapro.com</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">Atendente</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditUser({ id: 1, name: 'João Silva', email: 'joao.silva@lavanderiapro.com', role: 'Atendente' })} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Editar">
                              <Edit className="size-4" />
                            </button>
                            <button onClick={() => handleResetPassword('joao.silva@lavanderiapro.com')} className="p-2 text-slate-400 hover:text-amber-500 transition-colors" title="Resetar Senha">
                              <Key className="size-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Excluir">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                              MO
                            </div>
                            <span className="text-sm font-semibold">Maria Oliveira</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">maria.oliveira@lavanderiapro.com</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">Gerente</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditUser({ id: 2, name: 'Maria Oliveira', email: 'maria.oliveira@lavanderiapro.com', role: 'Gerente' })} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Editar">
                              <Edit className="size-4" />
                            </button>
                            <button onClick={() => handleResetPassword('maria.oliveira@lavanderiapro.com')} className="p-2 text-slate-400 hover:text-amber-500 transition-colors" title="Resetar Senha">
                              <Key className="size-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Excluir">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Editar Colaborador</h3>
              <button onClick={handleCloseEditModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome Completo</label>
                <input 
                  type="text" 
                  defaultValue={selectedUser.name}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-slate-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">E-mail</label>
                <input 
                  type="email" 
                  defaultValue={selectedUser.email}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-slate-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cargo</label>
                <select 
                  defaultValue={selectedUser.role}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-slate-900 dark:text-white"
                >
                  <option value="Atendente">Atendente</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button 
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New User Modal */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Novo Colaborador</h3>
              <button onClick={handleCloseNewUserModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Nome do colaborador"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-slate-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">E-mail</label>
                <input 
                  type="email" 
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-slate-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Senha</label>
                <input 
                  type="password" 
                  placeholder="Senha provisória"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-slate-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cargo</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-slate-900 dark:text-white"
                >
                  <option value="Atendente">Atendente</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button 
                onClick={handleCloseNewUserModal}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCloseNewUserModal}
                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                Adicionar Colaborador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

