"use client";

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, ShieldAlert, Zap, Crown, Briefcase, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans relative overflow-x-hidden flex flex-col items-center py-20 px-4">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <Link href="/wizard">
        <button className="absolute top-8 left-8 flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-all shadow-xl z-20">
          <ArrowLeft className="w-4 h-4 text-zinc-400" /> Volver al Wizard
        </button>
      </Link>

      <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Elige tu Nivel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Poder Operativo</span></h1>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Pasa al siguiente nivel en prevención de riesgos. Desde prevencionistas de obra hasta grandes firmas consultoras. Mapeo de peligros impulsado por IA en segundos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1400px] w-full z-10 px-4">
        
        {/* BÁSICO TIER */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-7 flex flex-col relative group hover:border-zinc-700 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Plan BÁSICO</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-white">$19.990</span>
              <span className="text-zinc-500 text-xs font-medium">CLP / mes</span>
            </div>
            <p className="text-[13px] text-zinc-400 leading-tight">Para estudiantes o prevencionistas iniciales con bajo volumen mensual.</p>
          </div>
          
          <div className="flex-1 space-y-3.5 mb-8">
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/><span className="text-sm text-zinc-300 leading-tight">Hasta 10 Tareas de Matriz al mes</span></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/><span className="text-sm text-zinc-300 leading-tight">Hasta 2 Inspecciones de Terreno</span></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/><span className="text-sm text-zinc-300 leading-tight">Hasta 2 Charlas Preventivas</span></div>
            <div className="flex items-start gap-3 opacity-50"><XCircle className="w-5 h-5 text-red-400 shrink-0"/><span className="text-sm text-zinc-400 leading-tight line-through">Sin Exportación (Solo vista en pantalla)</span></div>
          </div>
          
          <button onClick={() => alert("Integración MercadoPago Pendiente: BÁSICO")} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold py-3.5 rounded-xl transition-colors border border-zinc-700">
            Seleccionar Básico
          </button>
        </div>

        {/* PRO - OBRA TIER */}
        <div className="bg-gradient-to-b from-blue-900/40 to-zinc-900/80 backdrop-blur-xl border border-blue-500/30 rounded-[2rem] p-7 flex flex-col relative hover:border-blue-500/50 transition-colors shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="mb-6">
            <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">PRO <span className="text-blue-400 font-black">Obra</span></h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-white">$45.000</span>
              <span className="text-blue-300/60 text-xs font-medium">CLP / mes</span>
            </div>
            <p className="text-[13px] text-zinc-300 leading-tight">Prevencionistas contratados de planta para un (1) proyecto o faena fija.</p>
          </div>
          
          <div className="flex-1 space-y-3.5 mb-8">
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><span className="text-[13px] text-blue-200 font-bold leading-tight">Gestión para 1 Proyecto Único</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><span className="text-sm text-zinc-300 leading-tight">Inspecciones Ilimitadas en Obra</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><span className="text-sm text-zinc-300 leading-tight">Charlas 5 Minutos Ilimitadas</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><span className="text-[13px] text-zinc-300 font-bold text-amber-300 leading-tight">Carga Masiva Documental Mágica 🪄</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><span className="text-[13px] text-zinc-300 font-bold text-green-300 leading-tight">Exportación Completa Editable (Word/PDF)</span></div>
          </div>
          
          <button onClick={() => alert("Integración MercadoPago Pendiente: PRO OBRA")} className="w-full bg-blue-600/20 hover:bg-blue-600 border border-blue-500 text-white text-sm font-bold py-3.5 rounded-xl transition-all">
            Obtener Modo Obra
          </button>
        </div>

        {/* PRO - ASESOR TIER */}
        <div className="bg-gradient-to-b from-purple-900/50 to-zinc-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-[2rem] p-7 flex flex-col relative scale-[1.03] shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 z-20">
          <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
            <span className="bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">El Mejor Valor</span>
          </div>
          <div className="mb-6">
            <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/40 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">PRO <span className="text-purple-400 font-black">Asesor</span></h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-white">$89.990</span>
              <span className="text-purple-300/60 text-xs font-medium">CLP / mes</span>
            </div>
            <p className="text-[13px] text-zinc-300 leading-tight">Consultoras y asesores externos con cartera abierta de múltiples empresas.</p>
          </div>
          
          <div className="flex-1 space-y-3.5 mb-8">
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0"/><span className="text-sm text-purple-200 font-bold leading-tight">Gestión Multi-Proyecto Ilimitada</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0"/><span className="text-[13px] text-zinc-300 leading-tight">Memorias y Reportes Personalizados por Cliente (Logo/Datos)</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0"/><span className="text-sm text-zinc-300 leading-tight">Inspecciones y Charlas Ilimitadas Globales</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0"/><span className="text-[13px] text-zinc-300 font-bold text-amber-300 leading-tight">Carga Masiva Documental Mágica 🪄</span></div>
             <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0"/><span className="text-[13px] text-zinc-300 font-bold text-green-300 leading-tight">Exportación Completa Editable (Word/PDF)</span></div>
          </div>
          
          <button onClick={() => alert("Integración MercadoPago Pendiente: PRO ASESOR")} className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]">
            Obtener Modo Asesor
          </button>
        </div>

        {/* ENTERPRISE TIER */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-7 flex flex-col relative group hover:border-zinc-700 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <div className="mb-6">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">EMPRESA</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-black text-white mt-1">A Medida</span>
            </div>
            <p className="text-[13px] text-zinc-400 leading-tight">Licenciamiento holding para mutuales y mega-constructoras.</p>
          </div>
          
           <div className="flex-1 space-y-3.5 mb-8">
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/><span className="text-sm text-zinc-300 leading-tight">Cuentas Múltiples B2B Colaborativas</span></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/><span className="text-sm text-zinc-300 leading-tight">Ajuste de IA a Estándares Propios (Ej: Codelco)</span></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/><span className="text-sm text-zinc-300 leading-tight">Ingeniero Técnico dedicado 24/7</span></div>
          </div>
          
          <button onClick={() => alert("Contacto comercial a enviar.")} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold py-3.5 rounded-xl transition-colors border border-zinc-700">
            Contactar Ventas
          </button>
        </div>

      </div>
    </div>
  );
}
