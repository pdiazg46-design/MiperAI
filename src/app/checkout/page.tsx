"use client";

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, ShieldAlert, Zap, Crown } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans relative overflow-hidden flex flex-col items-center justify-center py-20 px-4">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <Link href="/wizard">
        <button className="absolute top-8 left-8 flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-all shadow-xl z-20">
          <ArrowLeft className="w-4 h-4 text-zinc-400" /> Volver al Wizard
        </button>
      </Link>

      <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Elige tu Nivel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Poder Operativo</span></h1>
        <p className="text-lg text-zinc-400">Pasa al siguiente nivel en prevención de riesgos. Mapeo de peligros impulsado por Inteligencia Artificial en segundos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full z-10">
        
        {/* STARTER TIER */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-8 flex flex-col relative group hover:border-zinc-700 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Plan STARTER</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-white">$19.990</span>
              <span className="text-zinc-500 text-sm font-medium">CLP / mes</span>
            </div>
            <p className="text-sm text-zinc-400">Ideal para prevencionistas independientes y asesores freelance.</p>
          </div>
          
          <div className="flex-1 space-y-4 mb-8">
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/><span className="text-sm text-zinc-300">Hasta 10 Matrices de Tareas al mes</span></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/><span className="text-sm text-zinc-300">Análisis normativo individual</span></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/><span className="text-sm text-zinc-300">Exportación básica a PDF</span></div>
          </div>
          
          <button onClick={() => alert("Integración MercadoPago Pendiente: STARTER")} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition-colors border border-zinc-700">
            Seleccionar Starter
          </button>
        </div>

        {/* PRO TIER */}
        <div className="bg-gradient-to-b from-blue-900/40 to-zinc-900/80 backdrop-blur-xl border-2 border-blue-500/50 rounded-[2rem] p-8 flex flex-col relative scale-[1.02] shadow-[0_0_40px_rgba(59,130,246,0.15)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
            <span className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Más Popular</span>
          </div>
          <div className="mb-6">
            <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Plan PRO</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-white">$45.000</span>
              <span className="text-blue-300/60 text-sm font-medium">CLP / mes</span>
            </div>
            <p className="text-sm text-zinc-300 gap-1 mb-2">Potencia industrial para corporaciones y constructoras dinámicas.</p>
          </div>
          
          <div className="flex-1 space-y-4 mb-8">
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><span className="text-sm text-zinc-200 font-medium">Matrices Ilimitadas Mensuales</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><span className="text-sm text-zinc-300">Carga Masiva Documental Mágica</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><span className="text-sm text-zinc-300">Exportación Ilimitada en la Nube</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><span className="text-sm text-zinc-300">Regulaciones chilenas garantizadas (DS 594)</span></div>
          </div>
          
          <button onClick={() => alert("Integración MercadoPago Pendiente: PRO")} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]">
            Obtener Pase PRO
          </button>
        </div>

        {/* ENTERPRISE TIER */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-8 flex flex-col relative group hover:border-zinc-700 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="mb-6">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">ENTERPRISE</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-black text-white mt-1">A Medida</span>
            </div>
            <p className="text-sm text-zinc-400">Implementación on-premise múltiple y licenciamiento corporativo grueso.</p>
          </div>
          
           <div className="flex-1 space-y-4 mb-8">
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/><span className="text-sm text-zinc-300">Cuentas Múltiples B2B</span></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/><span className="text-sm text-zinc-300">Personalización de APIs</span></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/><span className="text-sm text-zinc-300">Ingeniero de soporte dedicado 24/7</span></div>
          </div>
          
          <button onClick={() => alert("Contacto comercial a enviar.")} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition-colors border border-zinc-700">
            Contactar Ventas
          </button>
        </div>

      </div>
    </div>
  );
}
