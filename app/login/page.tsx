"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function LoginPage() {
    const [isDark, setIsDark] = useState(false);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState<any[]>([]);
    const router = useRouter();

    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggleDarkMode = () => {
        const dark = document.documentElement.classList.toggle("dark");
        setIsDark(dark);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === 'register') {
                // Verificar se este e-mail já foi pré-cadastrado por um gestor
                const { data: invite } = await supabase
                    .from('collaborators')
                    .select('owner_id')
                    .eq('email', email)
                    .maybeSingle();

                const role = invite ? 'collaborator' : 'owner';
                const ownerId = invite ? invite.owner_id : null;

                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                            role: role,
                            owner_id: ownerId
                        }
                    }
                });

                if (authError) throw authError;

                // Se era um colaborador, atualiza a tabela com o ID real dele
                if (invite && authData.user) {
                    await supabase
                        .from('collaborators')
                        .update({ user_id: authData.user.id })
                        .eq('email', email);
                }

                showToast(invite ? "Vínculo com a lavanderia concluído! Verifique seu e-mail para ativar." : "Conta criada com sucesso! Verifique seu e-mail.", "success");
                setMode('login');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    if (error.message.includes("Invalid login credentials")) {
                        throw new Error("Credenciais inválidas. Se você foi convidado, precisa clicar em 'Cadastrar' primeiro para criar sua senha.");
                    }
                    throw error;
                }

                showToast("Bem-vindo de volta!", "success");
                router.refresh(); // Refresh to sync cookies for middleware
                router.push('/dashboard');
            }
        } catch (error: any) {
            showToast(error.message || "Erro ao processar solicitação", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .transition-soft {
                        transition: all 300ms ease-in-out;
                    }
                ` }} />
            </head>
            <main className="flex min-h-screen bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 antialiased">
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-navy-950">
                    <img
                        alt="Close-up of luxurious, neatly folded white towels"
                        className="absolute inset-0 object-cover w-full h-full opacity-60 mix-blend-luminosity"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC40faZYIkrS3w9v-uGpSBaGbK8nOfDIOUJZUYOnOCAlRzPl5mWAJ5xTREC-t26mI6KR4xxVd73-28C5qWnztklG3u0pzNXDK0sRMeLG9nMnyTiXjaPd0_ZqOoghujw1qgdboboU0AnUPA8OkBkvq6I7eLWIyHeYw7feT3Ww-DIyzR0ZEh-uRBDukbXpWB-eysDrLxkLNKty0al8UwA6RC2mHFbfMNOLcsrn9OFG8VKkqEC4FWhz85rIA7MVfG4frKr4zyfhzlyvuaA"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/40"></div>
                    <div className="relative z-10 flex flex-col justify-between p-16 w-full">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-4xl">dry_cleaning</span>
                            <span className="font-display text-3xl tracking-tight text-white italic">LavanPro</span>
                        </div>
                        <div className="max-w-md">
                            <h2 className="font-display text-5xl text-white mb-6 leading-tight">Excelência em cada detalhe.</h2>
                            <p className="text-slate-400 text-lg font-light leading-relaxed">
                                Gerencie sua lavanderia com a sofisticação e precisão que seu negócio merece. Tecnologia de ponta para o cuidado têxtil.
                            </p>
                        </div>
                        <div className="flex gap-8 text-xs tracking-widest uppercase text-slate-500 font-light">
                            <span>© 2024 LaVu Systems</span>
                            <span>Premium Care</span>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-white dark:bg-navy-900">
                    <div className="w-full max-w-md">
                        <div className="lg:hidden flex justify-center mb-12">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-4xl">dry_cleaning</span>
                                <span className="font-display text-3xl tracking-tight italic">LaVu</span>
                            </div>
                        </div>
                        <div className="mb-10 text-center lg:text-left">
                            <h1 className="text-3xl font-display mb-3 dark:text-white">
                                {mode === 'login' ? 'Sistema de Gestão' : 'Criar Conta'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-light">
                                {mode === 'login'
                                    ? 'Gestão inteligente para lavanderias de alto padrão.'
                                    : 'Junte-se ao sistema de gestão mais sofisticado do mercado.'}
                            </p>
                        </div>

                        <div className="bg-slate-100 dark:bg-navy-950 p-1 rounded-full flex mb-10 border border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setMode('login')}
                                className={`flex-1 py-2 text-sm font-light rounded-full transition-soft ${mode === 'login'
                                    ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                Entrar
                            </button>
                            <button
                                onClick={() => setMode('register')}
                                className={`flex-1 py-2 text-sm font-light rounded-full transition-soft ${mode === 'register'
                                    ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                Cadastrar
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {mode === 'register' && (
                                <div className="transition-soft">
                                    <label className="block text-xs font-light uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1" htmlFor="name">
                                        Nome Completo
                                    </label>
                                    <input
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-soft dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-light"
                                        id="name"
                                        name="name"
                                        placeholder="Como devemos te chamar?"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-light uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1" htmlFor="email">
                                    E-mail Profissional
                                </label>
                                <input
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-soft dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-light"
                                    id="email"
                                    name="email"
                                    placeholder="seu@email.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-light uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1" htmlFor="password">
                                        Senha
                                    </label>
                                    {mode === 'login' && (
                                        <a className="text-xs text-primary hover:underline font-light" href="#">Esqueceu a senha?</a>
                                    )}
                                </div>
                                <input
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-soft dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-light"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-lg shadow-lg shadow-primary/20 transition-soft active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Wait...' : (mode === 'login' ? 'Acessar Painel' : 'Criar minha conta')}
                                    {!isLoading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                                </button>
                            </div>
                        </form>
                        <div className="mt-12 text-center">
                            <p className="text-xs text-slate-400 dark:text-slate-600 font-light leading-relaxed max-w-xs mx-auto">
                                Para fins de demonstração, desative o "Confirm email" nas configurações de autenticação do seu ambiente.
                            </p>
                        </div>
                        <div className="lg:hidden mt-16 text-center text-[10px] tracking-widest uppercase text-slate-400 font-light">
                            © 2024 LaVu Premium Care
                        </div>
                    </div>
                </div>

                <button
                    onClick={toggleDarkMode}
                    className="fixed bottom-6 right-6 p-3 rounded-full bg-white dark:bg-navy-800 shadow-xl border border-slate-200 dark:border-slate-700 transition-soft hover:scale-110 active:scale-95 group z-50"
                >
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 group-hover:text-primary">
                        contrast
                    </span>
                </button>

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
            </main>
        </>
    );
}
