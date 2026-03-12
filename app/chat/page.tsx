"use client";

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { AccessGuard } from "@/components/access-guard";
import { PlanGuard } from "@/components/plan-guard";
import {
    Search,
    MoreVertical,
    Paperclip,
    Smile,
    Send,
    Mic,
    CheckCheck,
    Phone,
    Video,
    User,
    Sparkles,
    MessageSquare,
    Zap,
    Briefcase,
    Clock,
    ChevronRight,
    SearchCode,
    Bot,
    Link
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Head from "next/head";

// --- Tipos ---
interface Message {
    id: string;
    text: string;
    sender: "me" | "customer" | "ai";
    timestamp: string;
    status: "sent" | "delivered" | "read";
}

interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    avatar?: string;
    status: "online" | "offline";
    messages: Message[];
}

// --- Mock Data ---
const CONTACTS: Chat[] = [
    {
        id: "1",
        name: "Gabriel Silva",
        lastMessage: "Olá, gostaria de saber se meu terno já está pronto.",
        timestamp: "10:30",
        unreadCount: 2,
        status: "online",
        messages: [
            { id: "m1", text: "Bom dia! Tudo bem?", sender: "me", timestamp: "09:00", status: "read" },
            { id: "m2", text: "Gostaria de saber se meu terno já está pronto para retirada.", sender: "customer", timestamp: "10:25", status: "read" },
            { id: "m3", text: "Pode conferir no sistema?", sender: "customer", timestamp: "10:30", status: "read" },
        ]
    },
    {
        id: "2",
        name: "Mariana Oliveira",
        lastMessage: "Quanto fica para lavar um edredom king size?",
        timestamp: "09:45",
        unreadCount: 0,
        status: "offline",
        messages: [
            { id: "m4", text: "Olá Mariana! Fica R$ 45,00.", sender: "me", timestamp: "09:50", status: "read" },
        ]
    },
    {
        id: "3",
        name: "Carlos Ferreira",
        lastMessage: "Obrigado pelo excelente serviço!",
        timestamp: "Ontem",
        unreadCount: 0,
        status: "offline",
        messages: [
            { id: "m5", text: "Obrigado pelo excelente serviço!", sender: "customer", timestamp: "Ontem", status: "read" },
        ]
    }
];

export default function WhatsAppWebPage() {
    const [chats, setChats] = useState<Chat[]>(CONTACTS);
    const [activeChatId, setActiveChatId] = useState<string>("1");
    const [newMessage, setNewMessage] = useState("");
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('connected'); // Inicia conectado para demo, mas pode ser alterado
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);

    const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat.messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;

        const msg: Message = {
            id: `new-${Date.now()}`,
            text: newMessage,
            sender: "me",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "sent"
        };

        const updatedChats = chats.map(c =>
            c.id === activeChatId
                ? { ...c, messages: [...c.messages, msg], lastMessage: newMessage, timestamp: "Agora" }
                : c
        );

        setChats(updatedChats);
        setNewMessage("");
        setAiSuggestions([]);

        // Simular entrega
        setTimeout(() => {
            setChats(prev => prev.map(c =>
                c.id === activeChatId
                    ? { ...c, messages: c.messages.map(m => m.id === msg.id ? { ...m, status: "delivered" } : m) }
                    : c
            ));
        }, 1000);
    };

    const generateAiResponse = async () => {
        setIsGeneratingAi(true);
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL;

        // Se o webhook for o padrão ou estiver vazio, usa mock após delay
        if (!webhookUrl || webhookUrl.includes("seudominio.com")) {
            console.log("n8n Webhook não configurado. Usando mock data.");
            setTimeout(() => {
                const suggestions = [
                    "Olá! Vou verificar agora mesmo no sistema. Um momento, por favor.",
                    "Sim, seu pedido já está pronto! Você pode retirar hoje até as 19h.",
                    "Estamos finalizando a secagem. Estará disponível em aproximadamente 2 horas."
                ];
                setAiSuggestions(suggestions);
                setIsGeneratingAi(false);
            }, 1000);
            return;
        }

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId: activeChatId,
                    customerName: activeChat.name,
                    lastMessages: activeChat.messages.slice(-5),
                    context: "LavanPro Laundry Management"
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Espera que o n8n retorne um array de strings em data.suggestions
                if (data.suggestions && Array.isArray(data.suggestions)) {
                    setAiSuggestions(data.suggestions);
                } else if (data.text) {
                    setAiSuggestions([data.text]);
                }
            } else {
                throw new Error("Falha na resposta do n8n");
            }
        } catch (err) {
            console.error("Erro ao conectar com n8n:", err);
            // Fallback em caso de erro
            setAiSuggestions(["Erro ao conectar com n8n. Verifique o console.", "Tente novamente em instantes."]);
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const applyAiSuggestion = (text: string) => {
        setNewMessage(text);
    };

    const handleConnect = async () => {
        setConnectionStatus('connecting');
        setShowQrModal(true);

        const webhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL;

        // Simular busca de QR Code (Normalmente via Evolution API ou similar conectada ao n8n)
        if (!webhookUrl || webhookUrl.includes("seudominio.com")) {
            setTimeout(() => {
                setQrCode("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=LavanProAuth_Demo_Connection");
            }, 1000);
        } else {
            try {
                const response = await fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "generate_qr", system: "LavanPro" })
                });
                const data = await response.json();
                if (data.qrCode) setQrCode(data.qrCode);
            } catch (err) {
                console.error("Erro ao gerar QR real:", err);
            }
        }
    };

    return (
        <AccessGuard permission="settings">
            <title>Mensagens IA Enterprise | LavanPro</title>
            <div className="flex h-screen bg-[#0c0c0e] text-[#e9edef] font-sans selection:bg-brand-primary/30">
                <Sidebar />
                <PlanGuard moduleName="WhatsApp IA Enterprise" requiredPlan="enterprise">
                    <div className="flex-1 flex overflow-hidden lg:m-2 lg:rounded-2xl border border-white/5 shadow-2xl bg-[#111b21] relative">

                        {/* --- QR CONNECTION MODAL --- */}
                        <AnimatePresence>
                            {showQrModal && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-[100] bg-[#111b21]/95 flex items-center justify-center p-4 backdrop-blur-sm"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        className="bg-[#202c33] p-8 rounded-3xl border border-white/10 shadow-2xl max-w-sm w-full text-center space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <h2 className="text-xl font-black text-white">Conectar WhatsApp Real</h2>
                                            <p className="text-xs text-[#8696a0]">Abra o WhatsApp no seu celular e escaneie o código para vincular esta instância.</p>
                                        </div>

                                        <div className="bg-white p-4 rounded-2xl mx-auto w-fit shadow-xl">
                                            {qrCode ? (
                                                <Image src={qrCode} alt="QR Code" width={220} height={220} className="rounded-lg" />
                                            ) : (
                                                <div className="size-[220px] flex items-center justify-center">
                                                    <div className="size-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                                <Bot className="size-4" /> Aguardando Sincronização...
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setShowQrModal(false);
                                                    setQrCode(null);
                                                    setConnectionStatus('connected'); // Mock success for demo
                                                }}
                                                className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20"
                                            >
                                                Já Escaneei o Código
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowQrModal(false);
                                                    setQrCode(null);
                                                    setConnectionStatus('disconnected');
                                                }}
                                                className="w-full py-2 text-[#8696a0] hover:text-white transition-colors text-xs font-medium"
                                            >
                                                Cancelar Conexão
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* --- LEFT SIDEBAR (Chats) --- */}
                        <div className="w-[350px] md:w-[400px] flex flex-col border-r border-white/10 bg-[#111b21]">
                            {/* Header Sidebar */}
                            <div className="h-[60px] px-4 flex items-center justify-between bg-[#202c33]/70 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-gradient-to-br from-brand-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                        <MessageSquare className="size-5 text-white" />
                                    </div>
                                    <p className="font-bold text-sm tracking-tight">Canais de Conversa</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {connectionStatus === 'connected' ? (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                            <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Conectado</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleConnect}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-[10px] font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20"
                                        >
                                            <Link className="size-3" /> Conectar WPP
                                        </button>
                                    )}
                                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><MoreVertical className="size-5 text-[#aebac1]" /></button>
                                </div>
                            </div>

                            {/* Search Sidebar */}
                            <div className="p-2 px-3 border-b border-white/5">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#aebac1]" />
                                    <input
                                        type="text"
                                        placeholder="Pesquisar ou começar uma nova conversa"
                                        className="w-full bg-[#202c33] border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none placeholder:text-[#8696a0]"
                                    />
                                </div>
                            </div>

                            {/* Chat List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {chats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => setActiveChatId(chat.id)}
                                        className={`flex items-center gap-3 p-3 hover:bg-[#202c33] cursor-pointer transition-all border-b border-white/5 ${activeChatId === chat.id ? "bg-[#2a3942]" : ""}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="size-12 bg-[#6a7175] rounded-full flex items-center justify-center text-xl font-bold">
                                                {chat.name.charAt(0)}
                                            </div>
                                            {chat.status === "online" && (
                                                <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full border-2 border-[#111b21]" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className="font-medium text-[#e9edef] truncate">{chat.name}</h3>
                                                <span className={`text-[10px] ${chat.unreadCount > 0 ? "text-emerald-500 font-bold" : "text-[#8696a0]"}`}>{chat.timestamp}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm text-[#8696a0] truncate flex-1">{chat.lastMessage}</p>
                                                {chat.unreadCount > 0 && (
                                                    <span className="size-5 bg-emerald-500 text-[#111b21] rounded-full flex items-center justify-center text-[10px] font-black">{chat.unreadCount}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* --- MAIN CHAT WINDOW --- */}
                        <div className="flex-1 flex flex-col bg-[#0b141a] relative">
                            {/* Chat Background Image Overlay (Standard WA Pattern) */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://whatsapp-web.org/wp-content/uploads/2021/01/whatsapp-web-background-id-1-1024x576.jpg')] bg-repeat" />

                            {/* Chat Header */}
                            <div className="h-[60px] px-4 flex items-center justify-between bg-[#202c33] border-b border-white/5 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-[#6a7175] rounded-full flex items-center justify-center text-lg font-bold">
                                        {activeChat.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="font-medium text-sm leading-none mb-1">{activeChat.name}</h2>
                                        <p className="text-[10px] text-emerald-500 font-medium">online</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[#aebac1]">
                                    <Video className="size-5 cursor-pointer hover:text-white transition-colors" />
                                    <Phone className="size-5 cursor-pointer hover:text-white transition-colors" />
                                    <div className="h-6 w-px bg-white/10 mx-1" />
                                    <Search className="size-5 cursor-pointer hover:text-white transition-colors" />
                                    <button
                                        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                                        className={`p-1.5 rounded-lg transition-all ${isAiPanelOpen ? 'bg-brand-primary/20 text-brand-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'hover:bg-white/10'}`}
                                        title="IA Assistant"
                                    >
                                        <Sparkles className="size-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 custom-scrollbar z-10">
                                {activeChat.messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`flex ${m.sender === "me" ? "justify-end" : m.sender === "ai" ? "justify-center" : "justify-start"}`}
                                    >
                                        {m.sender === "ai" ? (
                                            <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl px-4 py-2 text-xs text-brand-primary flex items-center gap-2 mb-4">
                                                <Sparkles className="size-3" /> Sugestão da IA aplicada agora
                                            </div>
                                        ) : (
                                            <div
                                                className={`max-w-[70%] px-3 py-1.5 rounded-xl text-sm relative shadow-md ${m.sender === "me"
                                                    ? "bg-[#005c4b] rounded-tr-none"
                                                    : "bg-[#202c33] rounded-tl-none"
                                                    }`}
                                            >
                                                <p className="mb-1 leading-relaxed">{m.text}</p>
                                                <div className="flex items-center justify-end gap-1">
                                                    <span className="text-[10px] text-[#8696a0]">{m.timestamp}</span>
                                                    {m.sender === "me" && (
                                                        <CheckCheck className={`size-3 ${m.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-[#202c33] flex items-center gap-3 z-10">
                                <button className="text-[#aebac1] hover:text-white transition-colors"><Smile className="size-6" /></button>
                                <button className="text-[#aebac1] hover:text-white transition-colors"><Paperclip className="size-6 -rotate-45" /></button>

                                <form onSubmit={handleSendMessage} className="flex-1">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Mensagem"
                                        className="w-full bg-[#2a3942] border-none rounded-xl py-2.5 px-4 text-sm focus:outline-none placeholder:text-[#8696a0]"
                                    />
                                </form>

                                {newMessage ? (
                                    <button
                                        onClick={() => handleSendMessage()}
                                        className="bg-brand-primary p-2.5 rounded-full text-white shadow-lg hover:opacity-90 active:scale-95 transition-all"
                                    >
                                        <Send className="size-5" />
                                    </button>
                                ) : (
                                    <button className="text-[#aebac1] hover:text-white transition-colors"><Mic className="size-6" /></button>
                                )}
                            </div>
                        </div>

                        {/* --- AI ASSISTANT PANEL --- */}
                        <AnimatePresence>
                            {isAiPanelOpen && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 320, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    className="h-full bg-[#111b21] border-l border-white/10 flex flex-col z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
                                >
                                    <div className="h-[60px] px-4 flex items-center justify-between border-b border-white/10 bg-[#202c33]/50">
                                        <div className="flex items-center gap-2">
                                            <Bot className="size-4 text-brand-primary" />
                                            <h3 className="font-bold text-xs uppercase tracking-widest text-brand-text">Assistente IA</h3>
                                        </div>
                                        <button onClick={() => setIsAiPanelOpen(false)} className="text-[#aebac1] hover:text-white transition-colors"><ChevronRight className="size-5" /></button>
                                    </div>

                                    <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                                        {/* Status Bio */}
                                        <div className="bg-brand-primary/5 rounded-2xl p-4 border border-brand-primary/20 space-y-2 relative overflow-hidden group">
                                            <Zap className="absolute top-2 right-2 size-12 text-brand-primary/10 opacity-50 group-hover:scale-110 transition-transform" />
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold text-brand-primary flex items-center gap-1.5"><Bot className="size-3" /> IA Enterprise Ativa</p>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL?.includes('seudominio.com') ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                    {process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL?.includes('seudominio.com') ? 'Mock Mode' : 'n8n Active'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-brand-muted leading-relaxed">
                                                Analisando histórico de Gabriel Silva. Próxima etapa operacional no módulo Labels: <span className="text-white font-bold">Secagem</span>.
                                            </p>
                                        </div>

                                        {/* Smart Replies */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#8696a0]">Sugestões de Resposta</h4>
                                                <button
                                                    onClick={generateAiResponse}
                                                    disabled={isGeneratingAi}
                                                    className="p-1 hover:bg-white/5 rounded-md text-brand-primary transition-all disabled:opacity-50"
                                                >
                                                    <Zap className={`size-3.5 ${isGeneratingAi ? 'animate-pulse' : ''}`} />
                                                </button>
                                            </div>

                                            {isGeneratingAi && (
                                                <div className="space-y-2">
                                                    <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
                                                    <div className="h-10 bg-white/5 rounded-xl animate-pulse w-[80%]" />
                                                </div>
                                            )}

                                            {!isGeneratingAi && aiSuggestions.length === 0 && (
                                                <button
                                                    onClick={generateAiResponse}
                                                    className="w-full py-4 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-[#8696a0] hover:border-brand-primary/30 hover:text-brand-text transition-all group"
                                                >
                                                    <Bot className="size-6 text-white/10 group-hover:text-brand-primary transition-colors" />
                                                    <span className="text-[10px] font-bold">Gerar Respostas Inteligentes</span>
                                                </button>
                                            )}

                                            {!isGeneratingAi && aiSuggestions.map((text, i) => (
                                                <motion.button
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    key={i}
                                                    onClick={() => applyAiSuggestion(text)}
                                                    className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] leading-relaxed hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all active:scale-95"
                                                >
                                                    {text}
                                                </motion.button>
                                            ))}
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="space-y-3 pt-4 border-t border-white/5">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#8696a0]">Ações Rápidas</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center gap-2 hover:bg-white/10 transition-all">
                                                    <SearchCode className="size-4 text-emerald-400" />
                                                    <span className="text-[9px] font-bold">Status Pedido</span>
                                                </button>
                                                <button className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center gap-2 hover:bg-white/10 transition-all">
                                                    <Briefcase className="size-4 text-brand-primary" />
                                                    <span className="text-[9px] font-bold">Gerar Link Pag</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Auto-Translate / Context */}
                                        <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                            <div className="flex items-center gap-2 text-amber-500 mb-2">
                                                <Clock className="size-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Lembrete IA</span>
                                            </div>
                                            <p className="text-[10px] text-amber-500/80 leading-relaxed italic">
                                                "O cliente costuma trazer peças delicadas. Sugerir lavagem a seco premium."
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </PlanGuard>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
                    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); }
                `}</style>
            </div>
        </AccessGuard>
    );
}
