import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function PlaceholderPage() {
    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto text-center py-20">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                            Página em Desenvolvimento
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                            Esta seção do sistema Lavanderia Pro está sendo preparada e estará disponível em breve.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
