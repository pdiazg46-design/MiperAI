'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Users, Search, Target, Shield, CheckCircle2, ChevronRight, Lock, Crown, Briefcase, Zap, UserPlus } from 'lucide-react';

export default function BusinessFlowMap() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-6 md:p-12 font-sans relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto z-10 relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Ecosistema y Modelo de Negocio Diarío</h1>
            <p className="text-sm text-zinc-400 font-medium mt-2">Visión del "User Journey" por cada plan y tipo de actor dentro de MiperAI.</p>
          </div>
          <Link href="/admin">
            <button className="mt-4 md:mt-0 flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-all shadow-xl">
              <Home className="w-4 h-4 text-zinc-400" /> Volver al Centro de Mando
            </button>
          </Link>
        </header>

        {/* CONTENEDOR GRID DE PERSONAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
          
          {/* =========================================
              MODO FREE (El Enganche)
             ========================================= */}
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/50 p-8 rounded-[2rem] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
               <Shield className="w-24 h-24" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-zinc-800 text-zinc-300 p-3 rounded-full"><Users className="w-6 h-6" /></div>
               <h2 className="text-xl font-black text-white uppercase">Usuario FREE <span className="text-sm text-zinc-500 font-medium normal-case ml-2">(El curioso)</span></h2>
            </div>
            
            <div className="space-y-4 relative z-10 flex-1">
               <div className="flex items-start gap-3">
                 <div className="mt-1"><ChevronRight className="w-4 h-4 text-zinc-500" /></div>
                 <div>
                   <span className="font-bold text-zinc-200 block">¿Cómo llega?</span>
                   <p className="text-sm text-zinc-400 leading-relaxed">Se registra por sí mismo en la página web con su cuenta de Google o Correo para ver si la plataforma es real.</p>
                 </div>
               </div>
               
               <div className="flex items-start gap-3">
                 <div className="mt-1"><ChevronRight className="w-4 h-4 text-emerald-500" /></div>
                 <div>
                   <span className="font-bold text-emerald-400 block">¿Qué experimenta? (El Valor)</span>
                   <p className="text-sm text-zinc-400 leading-relaxed">Entra a su cuenta libremente y puede usar el Motor IA. Puede detallar una faena, generar riesgos y calcular métricas PxS. Ve la Magia en tiempo real. También puede usar el celular para ver reportes.</p>
                 </div>
               </div>

               <div className="flex items-start gap-3">
                 <div className="mt-1"><Lock className="w-4 h-4 text-red-500" /></div>
                 <div>
                   <span className="font-bold text-red-400 block">La Limitación (Paywall)</span>
                   <p className="text-sm text-zinc-400 leading-relaxed">Tras maravillarse, intenta descargar el PDF o Word para entregarlo a la obra. Ahí el sistema lo bloquea. Descubre que su prueba dura 15 días, al término de los cuales no puede generar más nada si no paga.</p>
                 </div>
               </div>
            </div>
          </div>


          {/* =========================================
              MODO PRO (El Asesor Independiente)
             ========================================= */}
          <div className="bg-blue-950/20 backdrop-blur-xl border border-blue-500/30 p-8 rounded-[2rem] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
               <Zap className="w-24 h-24 text-blue-500" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-blue-600/20 text-blue-400 p-3 rounded-full border border-blue-500/50"><Zap className="w-6 h-6" /></div>
               <h2 className="text-xl font-black text-blue-100 uppercase">Usuario PRO <span className="text-sm text-blue-300/60 font-medium normal-case ml-2">(Asesor u Obra)</span></h2>
            </div>
            
            <div className="space-y-4 relative z-10 flex-1">
               <div className="flex items-start gap-3">
                 <div className="mt-1"><ChevronRight className="w-4 h-4 text-blue-500/50" /></div>
                 <div>
                   <span className="font-bold text-blue-200 block">¿Cómo llega?</span>
                   <p className="text-sm text-blue-100/70 leading-relaxed">Es el usuario Free que descubrió que esto le ahorra 5 horas semanales y pasó por la Pasarela de Pago con su tarjeta de crédito.</p>
                 </div>
               </div>
               
               <div className="flex items-start gap-3">
                 <div className="mt-1"><ChevronRight className="w-4 h-4 text-emerald-400" /></div>
                 <div>
                   <span className="font-bold text-emerald-400 block">El Poder Desbloqueado</span>
                   <p className="text-sm text-blue-100/70 leading-relaxed">Ahora puede exportar ilimitadamente PDF y Docx. Pone el logo de MiperAI o el suyo (si marca blanca). Entra a terreno con su celular y usa el AST con su propio equipo mínimo informático.</p>
                 </div>
               </div>

               <div className="flex items-start gap-3">
                 <div className="mt-1"><Lock className="w-4 h-4 text-zinc-500" /></div>
                 <div>
                   <span className="font-bold text-zinc-400 block">Su Limitación</span>
                   <p className="text-sm text-zinc-500 leading-relaxed">Trabaja generalmente solo. No tiene un "Panel de Flota". Si tiene ayudantes, a veces tiene que prestarles su celular o no puede orquestarlos de manera corporativa gigante.</p>
                 </div>
               </div>
            </div>
          </div>


          {/* =========================================
              MODO ENTERPRISE (EL MANDANTE)
             ========================================= */}
          <div className="bg-amber-950/20 backdrop-blur-xl border border-amber-500/40 p-8 rounded-[2rem] flex flex-col relative overflow-hidden group md:col-span-1 lg:col-span-2">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               <Briefcase className="w-64 h-64 text-amber-500" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-amber-500/20 text-amber-400 p-3 rounded-full border border-amber-500/50"><Crown className="w-6 h-6" /></div>
               <h2 className="text-2xl font-black text-amber-100 uppercase">Administrador ENTERPRISE <span className="text-base text-amber-300/60 font-medium normal-case ml-2">(La Constructora / Minera)</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 w-full mb-8">
               <div className="space-y-4">
                 <div className="flex items-start gap-3">
                   <div className="mt-1"><ChevronRight className="w-4 h-4 text-amber-500/50" /></div>
                   <div>
                     <span className="font-bold text-amber-200 block">¿Cómo llega?</span>
                     <p className="text-sm text-amber-100/70 leading-relaxed">Generalmente a través de un contacto B2B (tú se lo vendes). Le otorgas este plan desde tu panel ROOT.</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-3">
                   <div className="mt-1"><ChevronRight className="w-4 h-4 text-emerald-400" /></div>
                   <div>
                     <span className="font-bold text-emerald-400 block">El Ecosistema Cerrado</span>
                     <p className="text-sm text-amber-100/70 leading-relaxed">No solo tiene uso ilimitado. Se le desbloquea una bóveda: el <strong>Panel Corporativo</strong>. Aquí sube el Logo Oficial y el RUT de su faena, el cual estampará legalmente cada PDF saliente.</p>
                   </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <div className="flex items-start gap-3">
                   <div className="mt-1"><UserPlus className="w-4 h-4 text-amber-500" /></div>
                   <div>
                     <span className="font-bold text-amber-400 block">Creador de Vidas (El Enrolamiento)</span>
                     <p className="text-sm text-amber-100/70 leading-relaxed">
                       Sube una plantilla Excel con sus 200 obreros. El sistema auto-crea cuentas fantasma en segundos, imponiendo claves estándar corporativas sin preguntarles. Se convierte en Dios operativo de su flota.
                     </p>
                   </div>
                 </div>
               </div>
            </div>

            {/* RAMIFICACIÓN AL OPERADOR */}
            <div className="border-t border-amber-500/20 pt-8 flex justify-center">
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-[2rem] p-8 max-w-4xl w-full flex flex-col md:flex-row gap-6 items-center shadow-2xl relative">
                   <div className="hidden md:flex absolute -top-8 left-1/2 -translate-x-1/2 bg-[#050505] px-2 text-amber-500/50">
                     <ArrowDownComponent />
                   </div>
                   
                   <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/40 shrink-0">
                      <Target className="w-8 h-8 text-emerald-400" />
                   </div>

                   <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-black text-emerald-100 uppercase">El Operador de Terreno</h3>
                      <p className="text-sm text-emerald-100/80 leading-relaxed">
                        Es el trabajador real (Eléctrico, Rigger, etc). No entra a MiperAI para escribir ni para crear matrices.
                      </p>
                      <ul className="text-sm text-emerald-200/60 pl-4 list-disc space-y-1 mt-2">
                        <li><strong>Ingreso Obligatorio:</strong> Entra con el correo y clave que el Enterprise le dictó. Un túnel irrompible lo obliga a crear su propia clave por privacidad legal.</li>
                        <li><strong>Consumidor de Riesgos:</strong> Lee las matrices que otros crearon para saber a qué riesgos se enfrenta hoy.</li>
                        <li><strong>Rol Activo (Charla 5 Minutos):</strong> Cuando su jefe da la charla, él presiona "Tomo Conocimiento" en su móvil. Su firma estampa legalmente la base de datos protegiendo a la empresa.</li>
                        <li><strong>Reporte Visual:</strong> Usa su cámara para documentar que su área está limpia o mandar alertas ("Cable pelado al inicio del turno").</li>
                      </ul>
                   </div>

                </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

const ArrowDownComponent = () => (
  <svg width="24" height="40" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0V38M12 38L6 32M12 38L18 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
