'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Database, ShieldAlert, Zap, Building2, HardHat, Cog, Server, ArrowDown, ArrowRight, Network } from 'lucide-react';

export default function CloudArchitectureMap() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-6 md:p-12 font-sans relative overflow-x-hidden">
      {/* Luces cibernéticas */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto z-10 relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Network className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Arquitectura B2B Ecosystem</h1>
              <p className="text-sm text-emerald-400 font-mono tracking-widest mt-1">MiperAI Cloud Infrastructure Map v2.0</p>
            </div>
          </div>
          <Link href="/admin">
            <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-all shadow-xl">
              <Home className="w-4 h-4 text-zinc-400" /> Volver al Centro de Mando
            </button>
          </Link>
        </header>

        {/* CONTENEDOR DEL DIAGRAMA */}
        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 md:p-16 shadow-2xl relative">
          
          <div className="flex flex-col items-center gap-6 relative">
            
            {/* Nivel 1: ROOT */}
            <div className="bg-blue-950/50 border border-blue-500/30 p-6 rounded-2xl w-full max-w-lg text-center flex flex-col items-center relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
               <ShieldAlert className="w-8 h-8 text-blue-400 mb-3" />
               <h2 className="text-xl font-black text-white uppercase tracking-wider">Super Administrador (ROOT)</h2>
               <p className="text-xs text-blue-300/80 mt-2 font-mono">Modifica Planes de Suscripción y Supervisa Trazabilidad Global</p>
               <div className="mt-4 flex gap-2">
                 <span className="bg-blue-500/20 text-blue-200 text-[10px] px-2 py-1 rounded border border-blue-500/30">Next.js Edge</span>
                 <span className="bg-blue-500/20 text-blue-200 text-[10px] px-2 py-1 rounded border border-blue-500/30">Vercel Deployment</span>
               </div>
            </div>

            {/* Flecha Abajo */}
            <ArrowDown className="w-6 h-6 text-zinc-600 my-2" />

            {/* Nivel 2: MIDDLEWARE Y DB */}
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-4xl justify-center items-stretch relative z-10">
                <div className="flex-1 bg-purple-950/30 border border-purple-500/30 p-6 rounded-2xl flex flex-col items-center text-center">
                    <Database className="w-8 h-8 text-purple-400 mb-3" />
                    <h3 className="text-sm font-bold text-white uppercase">Neon PostgreSQL (DB)</h3>
                    <p className="text-xs text-purple-300 mt-2">Esquema Prisma Multi-Tenant. Centraliza Identidades, Logs AST y JsonPayloads.</p>
                </div>
                
                <div className="flex-1 bg-red-950/30 border border-red-500/30 p-6 rounded-2xl flex flex-col items-center text-center">
                    <Cog className="w-8 h-8 text-red-400 mb-3" />
                    <h3 className="text-sm font-bold text-white uppercase">Túnel de Seguridad JWT</h3>
                    <p className="text-xs text-red-300 mt-2">Generación de Cuentas Fantasma (mustChangePassword). Middleware NextAuth Bloqueante.</p>
                </div>
            </div>

            <ArrowDown className="w-6 h-6 text-zinc-600 my-2" />

            {/* Nivel 3: EMPRESA B2B */}
            <div className="bg-amber-950/30 border border-amber-500/30 p-8 rounded-3xl w-full max-w-4xl flex flex-col mb-4 relative z-10 shadow-[0_0_40px_rgba(245,158,11,0.05)]">
               <div className="flex items-center justify-center gap-3 mb-8 border-b border-amber-500/20 pb-6">
                 <Building2 className="w-10 h-10 text-amber-500" />
                 <div className="text-center">
                   <h2 className="text-2xl font-black text-amber-400 uppercase tracking-widest">Panel Corporativo (Empresa)</h2>
                   <p className="text-sm font-medium text-amber-500/70 mt-1">Suscripción ENTERPRISE</p>
                 </div>
               </div>

               {/* Nodos de la empresa */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                  
                  {/* Nodo IA y Prevencionista */}
                  <div className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl flex flex-col">
                     <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        <h4 className="text-sm font-bold text-zinc-200">Mandos Medios (Prevención)</h4>
                     </div>
                     <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                        Tienen permisos `canCreateMatrices`. Acceden al motor GPT-4o (Wizard) para estructurar Matrices de Riesgo legales. Tienen el poder de descargar en PDF/Docx.
                     </p>
                     <div className="mt-auto bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-2 w-fit">
                        <ArrowRight className="w-3 h-3" /> API OpenAI Integration
                     </div>
                  </div>

                  {/* Nodo Terreno */}
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-6 rounded-2xl flex flex-col shadow-inner">
                     <div className="flex items-center gap-3 mb-4">
                        <HardHat className="w-6 h-6 text-emerald-400" />
                        <h4 className="text-sm font-bold text-white">Flota de Operadores</h4>
                     </div>
                     <p className="text-xs text-emerald-100/70 mb-4 leading-relaxed">
                        Usuarios auto-enrolados. Interfaz móvil restringida. No crean matrices, pero utilizan la app para aplicar <strong>Firmas de Toma de Conocimiento</strong> y reportar Hallazgos con cámara nativa.
                     </p>
                     <div className="mt-auto flex flex-wrap gap-2">
                         <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-3 py-1.5 rounded-lg w-fit">VerVisor AST</span>
                         <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-3 py-1.5 rounded-lg w-fit">Bolsillo Seguro</span>
                     </div>
                  </div>
               </div>

               {/* Cuadrillas / Flujo Futuro */}
               <div className="mt-8 pt-6 border-t border-amber-500/20 w-full flex justify-center">
                  <div className="bg-zinc-950/80 border border-dashed border-zinc-700 px-6 py-4 rounded-xl text-center max-w-lg">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Visión de Escalamiento (Fase 3)</p>
                    <p className="text-[11px] text-zinc-500">Agrupación en **Cuadrillas**. Asignación de Supervisores a Células de Operadores para Firmas Concurrentes (Charlas de 5 Minutos).</p>
                  </div>
               </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
