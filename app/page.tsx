"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const toggleAccordion = (id: number) => {
    setActiveAccordion(prev => prev === id ? null : id);
  };

  return (
    <div className="bg-brand-bg text-brand-text font-sans antialiased selection:bg-brand-primary/30 selection:text-white">
      <header className="fixed w-full z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-darkBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-shirt text-white text-sm"></i>
              </div>
              <span className="font-bold text-xl tracking-tight text-white" >LavanPro</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link className="text-brand-muted hover:text-white transition-colors text-sm font-medium" href="#funcionalidades" >Funcionalidades</Link>
              <Link className="text-brand-muted hover:text-white transition-colors text-sm font-medium" href="#precos" >Preços</Link>
              <Link className="text-brand-muted hover:text-white transition-colors text-sm font-medium" href="#sobre" >Sobre</Link>
              <Link className="text-brand-muted hover:text-white transition-colors text-sm font-medium" href="#faq" >FAQ</Link>
            </nav>

            <div className="hidden md:flex items-center">
              <Link className="text-white bg-brand-primary hover:bg-brand-primaryHover px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-[0_0_15px_rgba(139,92,246,0.5)]" href="/login" >
                Entrar
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button
                className="text-brand-muted hover:text-white focus:outline-none transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <i className={`fa-solid ${isMenuOpen ? "fa-xmark" : "fa-bars"} text-xl`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100 border-b border-brand-darkBorder" : "max-h-0 opacity-0"}`}
          style={{ backgroundColor: "rgba(10, 10, 20, 0.95)", backdropFilter: "blur(12px)" }}
        >
          <nav className="px-4 py-6 space-y-4">
            <Link
              className="block text-brand-muted hover:text-white transition-colors text-base font-medium"
              href="#funcionalidades"
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link
              className="block text-brand-muted hover:text-white transition-colors text-base font-medium"
              href="#precos"
              onClick={() => setIsMenuOpen(false)}
            >
              Preços
            </Link>
            <Link
              className="block text-brand-muted hover:text-white transition-colors text-base font-medium"
              href="#sobre"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre
            </Link>
            <Link
              className="block text-brand-muted hover:text-white transition-colors text-base font-medium"
              href="#faq"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="pt-2">
              <Link
                className="block w-full text-center text-white bg-brand-primary hover:bg-brand-primaryHover py-3 rounded-full text-sm font-medium transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                href="/login"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar
              </Link>
            </div>
          </nav>
        </div>
      </header>


      <section className="relative pt-32 lg:pt-48 lg:pb-32 overflow-hidden hero-bg pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-card border border-brand-darkBorder mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                <span className="text-xs text-brand-primary font-semibold tracking-wide uppercase" >Novo Sistema 2.0</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6" >
                O Sistema de Gestão que Transforma Lavanderias em <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-400" >Máquinas de Lucro</span>
              </h1>
              <p className="text-lg text-brand-muted mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed" >
                Abandone o papel e automatize seu controle de caixa, estoque e agenda. O LavanPro centraliza tudo para você focar em crescer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-bold rounded-lg text-white bg-brand-primary hover:bg-brand-primaryHover shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all transform hover:scale-105 !bg-[#7c3aed]" href="/login" >
                  Testar Grátis por 7 Dias
                </Link>
                <Link className="inline-flex justify-center items-center px-8 py-4 border border-white/50 text-base font-bold rounded-lg text-white bg-transparent hover:bg-brand-card transition-all" href="/login" >
                  <i className="fa-solid fa-play mr-2 text-xs"></i> Ver Demonstração
                </Link>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-brand-muted">
                <div className="flex text-yellow-400">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <span className="" ><strong className="text-white">1,200+</strong> lavanderias satisfeitas</span>
              </div>
            </div>

            <div className="relative">

              <div className="absolute -inset-10 bg-brand-primary/40 blur-3xl rounded-full opacity-60 -z-10"></div>
              <div className="relative rounded-2xl overflow-hidden border border-brand-darkBorder shadow-2xl bg-brand-card">

                <img alt="Interface do Sistema LavanPro" className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" src="https://media.istockphoto.com/id/1503241482/pt/foto/business-night-and-man-with-a-tablet-connection-and-search-internet-with-network-website.jpg?s=612x612&amp;w=0&amp;k=20&amp;c=2GXC4U_kGmA_8CKcXCoWA5JWzp3l9zOph-dfoM2h5So=" />

                <div className="absolute top-6 right-6 bg-brand-card/90 backdrop-blur border border-brand-darkBorder p-4 rounded-xl shadow-lg animate-bounce" >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                      <i className="fa-solid fa-arrow-trend-up"></i>
                    </div>
                    <div>
                      <p className="text-xs text-brand-muted" >Produtividade</p>
                      <p className="text-sm font-bold text-white" >+45%</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-primary/20 blur-[80px] rounded-full -z-10 pointer-events-none"></div></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-primary/20 blur-[80px] rounded-full -z-10 pointer-events-none"></div></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-20 border-t border-brand-darkBorder pt-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2"><i className="fa-solid fa-file-invoice text-brand-primary"></i> <span className="" >Nota Fiscal Integrada</span></div>
            <div className="flex items-center gap-2"><i className="fa-solid fa-headset text-brand-primary"></i> <span className="" >Suporte 7 Dias/Semana</span></div>
            <div className="flex items-center gap-2"><i className="fa-brands fa-apple text-brand-primary"></i> <span className="" >App iOS e Android</span></div>
            <div className="flex items-center gap-2"><i className="fa-brands fa-whatsapp text-brand-primary"></i> <span className="" >Integração Whatsapp</span></div>
          </div>
        </div>
      </section>


      <section className="bg-brand-bg py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" >Funcionalidades que Impulsionam seu Negócio</h2>
            <p className="text-brand-muted max-w-2xl mx-auto" >Tudo o que você precisa para gerenciar sua lavanderia de ponta a ponta em uma única plataforma.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="feature-card bg-brand-card p-6 rounded-xl" data-purpose="feature-card">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4 text-brand-primary text-xl">
                <i className="fa-solid fa-clipboard-list"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2" >Gestão de Pedidos</h3>
              <p className="text-sm text-brand-muted leading-relaxed" >Gerencie cada peça, do balcão à entrega, com status em tempo real e sem perder nada.</p>
            </div>

            <div className="feature-card bg-brand-card p-6 rounded-xl">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4 text-brand-primary text-xl"><i className="fa-solid fa-box-open"></i></div>
              <h3 className="text-lg font-bold text-white mb-2" >Controle de Estoque</h3>
              <p className="text-sm text-brand-muted leading-relaxed" >Evite faltas e desperdícios com controle de insumos, produtos e alertas automáticos.</p>
            </div>

            <div className="feature-card bg-brand-card p-6 rounded-xl">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4 text-brand-primary text-xl"><i className="fa-solid fa-chart-line"></i></div>
              <h3 className="text-lg font-bold text-white mb-2" >Financeiro &amp; Caixa</h3>
              <p className="text-sm text-brand-muted leading-relaxed" >Controle total de fluxo de caixa, notas a pagar e receber, com relatórios claros.</p>
            </div>

            <div className="feature-card bg-brand-card p-6 rounded-xl">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4 text-brand-primary text-xl">
                <i className="fa-solid fa-mobile-screen"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2" >App para Clientes</h3>
              <p className="text-sm text-brand-muted leading-relaxed" >Ofereça um app exclusivo para seus clientes agendarem, acompanharem e pagarem.</p>
            </div>

            <div className="feature-card bg-brand-card p-6 rounded-xl">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4 text-brand-primary text-xl">
                <i className="fa-solid fa-truck-fast"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2" >App de Entregas</h3>
              <p className="text-sm text-brand-muted leading-relaxed" >Otimize a logística de coleta e entrega, com rotas inteligentes para motoristas.</p>
            </div>

            <div className="feature-card bg-brand-card p-6 rounded-xl">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4 text-brand-primary text-xl">
                <i className="fa-solid fa-bell"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2" >Notificações Auto</h3>
              <p className="text-sm text-brand-muted leading-relaxed" >Avise clientes via WhatsApp automaticamente quando a roupa estiver pronta.</p>
            </div>

            <div className="feature-card bg-brand-card p-6 rounded-xl">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4 text-brand-primary text-xl"><i className="fa-solid fa-users"></i></div>
              <h3 className="text-lg font-bold text-white mb-2" >Gestão de Equipe</h3>
              <p className="text-sm text-brand-muted leading-relaxed" >Controle de produtividade por funcionário e gerenciamento de permissões de acesso.</p>
            </div>

            <div className="feature-card bg-brand-card p-6 rounded-xl">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4 text-brand-primary text-xl">
                <i className="fa-solid fa-qrcode"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2" >Etiquetagem QR</h3>
              <p className="text-sm text-brand-muted leading-relaxed" >Sistema de etiquetas inteligentes para rastreamento preciso de cada peça de roupa.</p>
            </div>
          </div>
        </div>
      </section>


      <section className="relative overflow-hidden py-32">

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" >Gerencie Toda sua Lavanderia em Um Só Lugar</h2>
              <p className="text-lg text-brand-muted mb-6" >
                Diga adeus às planilhas complexas e sistemas ultrapassados. O LavanPro centraliza tudo para você focar em crescer.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start" >
                  <i className="fa-solid fa-circle-check text-brand-primary mt-1 mr-3"></i>
                  <span className="text-brand-text" >Painel de controle intuitivo e personalizável.</span>
                </li>
                <li className="flex items-start" >
                  <i className="fa-solid fa-circle-check text-brand-primary mt-1 mr-3"></i>
                  <span className="text-brand-text" >Acesso de qualquer lugar (Nuvem).</span>
                </li>
                <li className="flex items-start" >
                  <i className="fa-solid fa-circle-check text-brand-primary mt-1 mr-3"></i>
                  <span className="text-brand-text" >Relatórios detalhados para tomada de decisão.</span>
                </li>
              </ul>
              <a className="text-brand-primary font-semibold hover:text-white transition-colors group" href="" >
                Conheça todas as ferramentas <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
              </a>
            </div>
            <div className="relative">

              <div className="bg-brand-card border border-brand-darkBorder rounded-xl p-2 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img alt="Dashboard em múltiplos dispositivos" className="rounded-lg w-full h-auto" src="https://media.istockphoto.com/id/1503241482/pt/foto/business-night-and-man-with-a-tablet-connection-and-search-internet-with-network-website.jpg?s=612x612" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-primary/20 blur-[80px] rounded-full -z-10 pointer-events-none"></div></div>
          </div>

          <div className="mt-20 bg-gradient-to-r from-brand-card to-[#252540] border border-brand-darkBorder rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="z-10">
              <h3 className="text-xl font-bold text-white mb-2" >PROMOÇÃO ATUAL EXCLUSIVA: <span className="text-brand-primary" >Assine o Plano Anual</span> e Ganhe 1 Meses GRÁTIS!</h3>
              <p className="text-sm text-brand-muted" >Vagas de Onboarding limitadas, garanta a sua agora mesmo.</p>
            </div>
            <div className="z-10 flex-shrink-0">
              <a className="inline-block bg-brand-primary hover:bg-brand-primaryHover text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors !bg-[#7c3aed]" href="" >
                Aproveitar Oferta
              </a>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-brand-bg relative py-32" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" >Preços Feitos para sua Escala</h2>
            <div className="text-brand-muted" >Escolha entre planos <strong data-start="254" data-end="284">mensal, semestral ou anual</strong> e encontre a melhor opção para o seu negócio.<br /><br /><div ><br /></div></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-brand-card border border-brand-darkBorder rounded-2xl p-8 flex flex-col hover:border-brand-muted transition-colors">
              <h3 className="text-lg font-medium text-white mb-2" >Starter</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-white" >R$97</span>
                <span className="text-brand-muted ml-2" >/mês</span>
              </div>
              <p className="text-sm text-brand-muted mb-6" >Ideal para lavanderias pequenas ou iniciantes.</p>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-brand-text">
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Gestão básica</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> 1 Usuário</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Controle de caixa</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Suporte via email</li>
              </ul>
              <Link className="block w-full py-3 px-4 bg-transparent border text-white text-center font-medium rounded-lg hover:bg-brand-darkBorder transition-colors border-gray-600" href="/login" >
                Começar Básico
              </Link>
            </div>

            <div className="bg-brand-card border-2 rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(139,92,246,0.15)] border-purple-500 bg-brand-card/80 shadow-purple-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#7c3aed] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg" >Mais Popular</div>
              <h3 className="text-lg font-medium text-white mb-2" >Profissional</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-extrabold text-white" >R$197<br /></span>
                <span className="text-brand-muted ml-2" >/mês</span>
              </div>
              <p className="text-sm text-brand-muted mb-6" >Para lavanderias em crescimento que precisam de controle.</p>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-brand-text">
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Tudo do Starter</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> 5 Usuários</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Financeiro Completo</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> App do Cliente</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Controle de rotas</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Suporte WhatsApp</li>
              </ul>
              <Link className="block w-full py-3 px-4 bg-brand-primary text-white text-center font-bold rounded-lg hover:bg-brand-primaryHover transition-colors shadow-lg !bg-[#7c3aed]" href="/login" >
                Aproveitar Oferta
              </Link>
            </div>

            <div className="bg-brand-card border border-brand-darkBorder rounded-2xl p-8 flex flex-col hover:border-brand-muted transition-colors">
              <h3 className="text-lg font-medium text-white mb-2" >Enterprise</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-white" >R$397</span>
                <span className="text-brand-muted ml-2" >/mês</span>
              </div>
              <p className="text-sm text-brand-muted mb-6" >Para redes de lavanderias e grandes operações.</p>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-brand-text">
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Tudo do Profissional</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Usuários Ilimitados</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Múltiplas Unidades</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> API Aberta</li>
                <li className="flex items-center" ><i className="fa-solid fa-check text-brand-primary mr-3"></i> Gerente de contas</li>
              </ul>
              <Link className="block w-full py-3 px-4 bg-transparent border text-white text-center font-medium rounded-lg hover:bg-brand-darkBorder transition-colors border-gray-600" href="/login" >
                Enterprise Opções
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-brand-card border border-brand-darkBorder text-xs text-brand-muted" >
              <i className="fa-solid fa-shield-halved mr-2"></i> Garantia de 7 Dias ou seu Dinheiro de Volta
            </span>
          </div>
        </div>
      </section>


      <section className="bg-[#0a0a14] py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" >Feito para Simplificar a Gestão da Sua Lavanderia</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-brand-card rounded-2xl overflow-hidden border border-brand-darkBorder aspect-video flex items-center justify-center">

                <img alt="Video Institucional" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" src="https://media.istockphoto.com/id/1503241482/pt/foto/business-night-and-man-with-a-tablet-connection-and-search-internet-with-network-website.jpg?s=612x612" />
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform z-10">
                  <i className="fa-solid fa-play text-white text-xl pl-1"></i>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2" >Nossa Visão</h3>
                <p className="text-brand-muted leading-relaxed" >Ajudar lavanderias a terem mais organização e controle, usando tecnologia simples para facilitar o dia a dia do atendimento até a entrega das roupas.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2" >Nossa Missão</h3>
                <p className="text-brand-muted leading-relaxed" >Criar um sistema fácil de usar que ajude lavanderias a controlar pedidos, clientes e financeiro em um só lugar, economizando tempo e evitando erros.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4" >Resultados Reais de Nossos Clientes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="bg-brand-card p-3 rounded-lg border border-brand-darkBorder flex gap-3 items-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-md flex-shrink-0 overflow-hidden relative">

                      <img className="object-cover w-full h-full" src="https://media.istockphoto.com/id/1311333796/pt/foto/young-black-business-woman-checking-clothes-while-working-at-the-dry-cleaners.jpg?s=612x612" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30"><i className="fa-solid fa-play text-white text-xs"></i></div>
                    </div>
                    <div>
                      <p className="text-xs text-brand-muted italic line-clamp-2" >"Melhorou minha gestão em 100%..."</p>
                      <p className="text-xs font-bold text-white mt-1" >Carlos M.</p>
                    </div>
                  </div>

                  <div className="bg-brand-card p-3 rounded-lg border border-brand-darkBorder flex gap-3 items-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-md flex-shrink-0 overflow-hidden relative">

                      <img className="object-cover w-full h-full" src="https://media.istockphoto.com/id/1311333796/pt/foto/young-black-business-woman-checking-clothes-while-working-at-the-dry-cleaners.jpg?s=612x612" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30"><i className="fa-solid fa-play text-white text-xs"></i></div>
                    </div>
                    <div>
                      <p className="text-xs text-brand-muted italic line-clamp-2" >"O suporte é incrível e o sistema..."</p>
                      <p className="text-xs font-bold text-white mt-1" >Ana P.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-brand-bg py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white" >FAQ - Perguntas Frequentes</h2>
          </div>
          <div className="space-y-4" id="faq-container">

            <div className="border-b border-brand-darkBorder">
              <button className="w-full py-4 flex justify-between items-center text-left focus:outline-none group" onClick={() => toggleAccordion(1)} >
                <span className="text-white font-medium group-hover:text-brand-primary transition-colors" >O sistema é indicado para qualquer lavanderia?</span>
                <i className={`fa-solid fa-chevron-down text-brand-muted transition-transform duration-300 ${activeAccordion === 1 ? "rotate-180" : ""}`} id="icon-1" ></i>
              </button>
              <div className={`accordion-content ${activeAccordion === 1 ? "active" : ""}`} id="content-1" style={{ maxHeight: activeAccordion === 1 ? '200px' : '0' }} >
                <div className="pb-4 text-brand-muted text-sm" >
                  Nosso sistema é ideal para lavanderias que querem mais organização no atendimento, controle de pedidos e gestão financeira.
                </div>
              </div>
            </div>

            <div className="border-b border-brand-darkBorder">
              <button className="w-full py-4 flex justify-between items-center text-left focus:outline-none group" onClick={() => toggleAccordion(2)} >
                <span className="text-white font-medium group-hover:text-brand-primary transition-colors" >Preciso instalar algo no meu computador?</span>
                <i className={`fa-solid fa-chevron-down text-brand-muted transition-transform duration-300 ${activeAccordion === 2 ? "rotate-180" : ""}`} id="icon-2" ></i>
              </button>
              <div className={`accordion-content ${activeAccordion === 2 ? "active" : ""}`} id="content-2" style={{ maxHeight: activeAccordion === 2 ? '200px' : '0' }} >
                <div className="pb-4 text-brand-muted text-sm" >
                  Não. O LavanPro é 100% na nuvem. Você pode acessar de qualquer computador, tablet ou celular com internet.
                </div>
              </div>
            </div>

            <div className="border-b border-brand-darkBorder">
              <button className="w-full py-4 flex justify-between items-center text-left focus:outline-none group" onClick={() => toggleAccordion(3)} >
                <span className="text-white font-medium group-hover:text-brand-primary transition-colors" >O app para clientes é personalizado?</span>
                <i className={`fa-solid fa-chevron-down text-brand-muted transition-transform duration-300 ${activeAccordion === 3 ? "rotate-180" : ""}`} id="icon-3" ></i>
              </button>
              <div className={`accordion-content ${activeAccordion === 3 ? "active" : ""}`} id="content-3" style={{ maxHeight: activeAccordion === 3 ? '200px' : '0' }} >
                <div className="pb-4 text-brand-muted text-sm" >
                  Sim, no plano Profissional e Enterprise, o app leva a sua logomarca e identidade visual.
                </div>
              </div>
            </div>

            <div className="border-b border-brand-darkBorder">
              <button className="w-full py-4 flex justify-between items-center text-left focus:outline-none group" onClick={() => toggleAccordion(4)} >
                <span className="text-white font-medium group-hover:text-brand-primary transition-colors" >Como funciona a emissão de Nota Fiscal?</span>
                <i className={`fa-solid fa-chevron-down text-brand-muted transition-transform duration-300 ${activeAccordion === 4 ? "rotate-180" : ""}`} id="icon-4" ></i>
              </button>
              <div className={`accordion-content ${activeAccordion === 4 ? "active" : ""}`} id="content-4" style={{ maxHeight: activeAccordion === 4 ? '200px' : '0' }} >
                <div className="pb-4 text-brand-muted text-sm" >
                  Em alguns casos é necessário. Se for o seu, ajudamos na configuração para você emitir notas de forma simples e rápida.</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <footer className="bg-[#020205] border-t border-brand-darkBorder pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4" >Stay connected</h3>
              <p className="text-brand-muted mb-4 text-sm max-w-sm" >Receba dicas de gestão e novidades do sistema diretamente no seu e-mail.</p>
              <form className="flex gap-2 max-w-sm">
                <input className="bg-brand-card border border-brand-darkBorder text-white text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5" placeholder="Digite seu email..." type="email" />
                <button className="bg-brand-primary hover:bg-brand-primaryHover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" type="submit" >
                  Conectar
                </button>
              </form>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4" >Empresa</h4>
              <ul className="space-y-2 text-sm text-brand-muted">
                <li className="" ><Link className="hover:text-brand-primary transition-colors" href="#" >Sobre Nós</Link></li>
                <li className="" ><Link className="hover:text-brand-primary transition-colors" href="#" >Carreiras</Link></li>
                <li className="" ><Link className="hover:text-brand-primary transition-colors" href="#" >Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4" >Social</h4>
              <div className="flex space-x-4">
                <a className="w-8 h-8 rounded-full bg-brand-card flex items-center justify-center text-brand-muted hover:text-white hover:bg-brand-primary transition-all" href="#" >
                  <i className="fa-brands fa-twitter"></i>
                </a>
                <a className="w-8 h-8 rounded-full bg-brand-card flex items-center justify-center text-brand-muted hover:text-white hover:bg-brand-primary transition-all" href="#" >
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a className="w-8 h-8 rounded-full bg-brand-card flex items-center justify-center text-brand-muted hover:text-white hover:bg-brand-primary transition-all" href="#" >
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a className="w-8 h-8 rounded-full bg-brand-card flex items-center justify-center text-brand-muted hover:text-white hover:bg-brand-primary transition-all" href="#" >
                  <i className="fa-brands fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-brand-darkBorder pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-muted">
            <div className="flex gap-6">
              <Link className="hover:text-white" href="#" >Termos de Serviço</Link>
              <Link className="hover:text-white" href="#" >Política de Privacidade</Link>
            </div>
            <div className="" >© 2024 All Rights Reserved by LavanPro</div>
          </div>
        </div>
      </footer>



    </div>
  );
}