'use client';
import { useState, useRef, useEffect } from 'react';
import { PlusCircle, Search, FileText, ShieldAlert, FolderSync, Camera, Mic, Zap, ChevronRight, ClipboardCheck, User, Sparkles, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useDeviceSimulator } from '@/components/DeviceSimulatorProvider';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { isSimulatorEnabled } = useDeviceSimulator();
  const { data: session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/avatar')
        .then(res => res.json())
        .then(data => {
           if(data.image) setAvatarUrl(data.image);
           else if (session.user?.image) setAvatarUrl(session.user.image);
        })
        .catch(() => {});

      fetch('/api/user/logo')
        .then(res => res.json())
        .then(data => {
           if(data.logo) setCompanyLogo(data.logo);
        })
        .catch(() => {});
    }
  }, [session]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setProjects(data);
        setIsLoadingProjects(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingProjects(false);
      });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);

        if (session?.user) {
          try {
            await fetch('/api/user/avatar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64 })
            });
          } catch(err) { console.error('Error al subir avatar:', err) }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("¿Seguro que deseas eliminar este proyecto y todos sus reportes operativos? Esta acción es irreversible.")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Fallo al eliminar proyecto.");
      }
    } catch {
      alert("Error de conexión.");
    }
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleCompanyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
           const res = await fetch('/api/user/logo', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ base64 })
           });
           if (res.ok) {
              alert("Logo Institucional renovado. Refrescando página.");
              window.location.reload();
           } else {
              const { error } = await res.json();
              alert(error || "Fallo al subir logo.");
           }
        } catch (err) {
           alert("Error de conexión");
        }
     };
     reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        accept="image/*" 
        className="hidden" 
      />
      {/* Header Corporativo VIP */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm border border-blue-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl md:text-2xl tracking-tight text-slate-800">Miper<span className="text-blue-600">AI</span></h1>
              <p className={`${isSimulatorEnabled ? 'hidden' : 'hidden md:block'} text-[10px] md:text-xs uppercase font-bold tracking-wider text-slate-500`}>Matriz Inteligente de Peligros y Riesgos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:pr-[240px]">
            <div 
              onClick={handleAvatarClick}
              className={`${isSimulatorEnabled ? 'hidden' : 'hidden md:flex'} w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 border-2 border-white shadow-md items-center justify-center text-slate-500 overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-1 transition-all relative group`}
            >
               {avatarUrl ? (
                 <img src={avatarUrl} alt="Avatar Usuario" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-6 h-6 text-slate-400" />
               )}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="w-5 h-5 text-white" />
               </div>
            </div>
            <div 
               onClick={handleLogoClick}
               className="px-3 bg-white border border-slate-200 shadow-md rounded-xl flex items-center justify-center h-10 md:h-12 overflow-hidden cursor-pointer relative group"
               title="Cambiar Logo Corporativo"
            >
              <input type="file" ref={logoInputRef} onChange={handleCompanyLogoUpload} accept="image/*" className="hidden" />
              {/* Display dynamic session logo or default to IT-S */}
              <img src={companyLogo || "/logo.png"} alt="SaaS Logo" className="max-w-[80px] md:max-w-[100px] max-h-8 md:max-h-10 object-contain" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* =========================================
             VISTA ESCRITORIO (PC)
           ========================================= */}
        {/* Banner Hero: Solo en PC o si el simulador está inactivo */}
        <section className={`${isSimulatorEnabled ? 'hidden' : 'hidden md:block'} relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 px-8 py-12 shadow-xl border border-blue-700/50`}>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Genera tu Matriz de Riesgo con IA
              </h2>
              <p className="mt-4 text-lg text-blue-100 font-light">
                Describe la tarea y deja que el asistente configure los peligros, riesgos y jerarquía de controles de acuerdo a la normativa chilena.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Link href="/wizard?mode=ai" className="flex items-center justify-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-slate-50 hover:scale-105 transition-all w-full sm:w-auto">
                  <PlusCircle className="w-5 h-5" /> Nueva Matriz Asistida
                </Link>
                <Link href="/wizard?mode=import" className="flex items-center justify-center gap-2 bg-blue-800/50 text-white border border-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-800/80 transition-all backdrop-blur-sm w-full sm:w-auto">
                  <FolderSync className="w-5 h-5" /> Estandarizar Matriz Antigua
                </Link>
              </div>
              <div className="mt-6">
                <Link href="/wizard?mode=manual" className="text-sm text-blue-200 hover:text-white underline decoration-blue-500/50 transition-colors">
                  Prefiero empezar una matriz en blanco (Modo Manual) &rarr;
                </Link>
              </div>
            </div>

            {/* Panel de Respaldo Normativo */}
            <div className="hidden lg:block w-full max-w-[340px] xl:max-w-sm">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/30 rounded-full blur-xl group-hover:bg-teal-400/30 transition-colors"></div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <h3 className="text-white font-bold text-[11px] uppercase tracking-widest text-shadow-sm">Motor Normativo Inteligente</h3>
                </div>
                <p className="text-[11px] text-blue-100/70 mb-4 leading-relaxed font-light">
                  Nuestra IA cruza tu matriz operando bajo el marco regulatorio del MINSAL y la Dirección del Trabajo:
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                    <span className="text-[11px] text-blue-50 font-bold tracking-tight">Ley 16.744 / DS 594 (SST)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                    <span className="text-[11px] text-blue-50 font-bold tracking-tight">Ley 20.001 (Saco y Ergonomía)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                    <span className="text-[11px] text-blue-50 font-bold tracking-tight">Ley 21.015 (Inclusión / Discapacidad)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full shadow-[0_0_8px_rgba(251,113,133,0.8)]"></div>
                    <span className="text-[11px] text-blue-50 font-bold tracking-tight">Art. 202 Código del Trabajo (Maternidad)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
                    <span className="text-[11px] text-blue-50 font-bold tracking-tight">D.S. 44 y Protocolos MINSAL (TMERT, PREXOR)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Módulos de Terreno B2B: Destacado en Móvil, Panel en PC */}
        {/* Titular especial solo para celulares o en modo simulador (Se oculta para centrar inmersivamente el banner educativo) */}
        {(isLoadingProjects || projects.length > 0) && (
          <div className={`${isSimulatorEnabled ? 'flex' : 'md:hidden flex'} items-center justify-between mb-6 px-2 mt-2 gap-4`}>
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-1">
                 <span className="text-xs font-bold text-slate-400">
                   {(session?.user as any)?.name || 'Usuario'}
                 </span>
                 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${(session?.user as any)?.subscriptionTier === 'PRO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                   {(session?.user as any)?.subscriptionTier || 'FREE'}
                 </span>
               </div>
               <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">Bienvenido a <br/> Terreno</h2>
               <p className="text-xs text-slate-500 mt-1 leading-snug pr-2">¿Qué actividad operativa requiere registro?</p>
             </div>
             <div 
               onClick={handleAvatarClick}
               className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white shadow-xl flex items-center justify-center text-slate-500 overflow-hidden shrink-0 animate-in zoom-in duration-500 -translate-y-3 cursor-pointer hover:scale-105 transition-transform relative group"
             >
               {avatarUrl ? (
                 <img src={avatarUrl} alt="Avatar Usuario" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-8 h-8 text-slate-400" />
               )}
               <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="w-6 h-6 text-white" />
               </div>
             </div>
          </div>
        )}

        {/* Banner Educativo Móvil - Solo aparece si no hay proyectos y se está en vista móvil/simulador */}
        {!isLoadingProjects && projects.length === 0 && (
          <div className={`min-h-[calc(100vh-140px)] w-full flex flex-col justify-center ${isSimulatorEnabled ? 'flex' : 'flex md:hidden'} animate-in fade-in zoom-in-95 duration-700`}>
            <div className="w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-blue-800 text-white text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 space-y-5">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner backdrop-blur-md border border-white/10">
                  <ShieldAlert className="w-8 h-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">Configuración Requerida</h3>
                  <p className="text-sm text-blue-100/80 font-light leading-relaxed">
                    Este módulo de Charlas AST e Inspecciones en Terreno solo se activa cuando has creado matrices de riesgo en tu proyecto.
                  </p>
                </div>
                
                <div className="bg-black/40 p-5 rounded-2xl border border-white/10 backdrop-blur-md mt-6 shadow-inner text-left">
                  <p className="text-xs text-blue-200 font-medium mb-3 text-center">Para crear tu primera matriz, ingresa desde tu computador (PC) a esta dirección:</p>
                  <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="font-mono text-base md:text-lg text-white font-bold truncate">
                      {typeof window !== 'undefined' ? window.location.host : 'miper.ai'}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => {
                          if (navigator.share && typeof window !== 'undefined') {
                             navigator.share({
                               title: 'MiperAI - Matriz de Riesgo',
                               text: 'Ingresa desde tu PC para generar la Matriz de Riesgo',
                               url: window.location.origin
                             }).catch(console.error);
                          } else {
                            if (navigator.clipboard && typeof window !== 'undefined') {
                               navigator.clipboard.writeText(window.location.host);
                               alert("Enlace copiado al portapapeles.");
                            }
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-[8px] rounded-lg shadow-md transition-colors flex items-center justify-center"
                        title="Compartir enlace"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      </button>
                      <button 
                        onClick={() => {
                          if (navigator.clipboard && typeof window !== 'undefined') {
                             navigator.clipboard.writeText(window.location.host);
                             alert("¡Enlace copiado al portapapeles!");
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mosaico AST / Reportes (Se oculta en móvil si no hay proyectos) */}
        <section className={`mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ${!isLoadingProjects && projects.length === 0 ? (isSimulatorEnabled ? 'hidden' : 'hidden md:grid') : 'grid'} grid-cols-1 ${isSimulatorEnabled ? '' : 'md:grid-cols-2'} gap-6 flex-col`}>
           {/* Visor AST */}
           {/* Visor AST */}
           <Link href="/ast" className="block w-full rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 p-[2px] hover:scale-[1.02] transition-transform shadow-md md:shadow-lg group">
             <div className="bg-white rounded-[14px] md:rounded-[22px] p-3 md:px-5 md:py-6 h-full flex items-center md:flex-col md:items-start justify-between group-hover:bg-emerald-50/80 transition-colors gap-3 md:gap-4">
                 <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner leading-none font-black text-xl md:text-2xl shrink-0">
                    AST
                 </div>
                 
                 <div className="flex-1 min-w-0">
                   <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 mb-1">
                     <ClipboardCheck className="w-2.5 h-2.5 md:w-3 md:h-3" /> Pizarra
                   </div>
                   <h3 className="text-sm md:text-xl font-extrabold text-slate-800 leading-tight truncate">Charla Diaria</h3>
                   <p className="text-slate-500 text-[10px] md:text-xs mt-0.5 md:mt-2 line-clamp-1 md:line-clamp-none">Transforma tu Matriz en checklist.</p>
                 </div>

                 <div className="bg-emerald-500 text-white p-1.5 md:p-2 rounded-full shadow-md group-hover:bg-emerald-600 transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                 </div>
             </div>
           </Link>

           {/* Reporte de Hallazgos */}
           <Link href="/inspeccion" className="block w-full rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 p-[2px] hover:scale-[1.02] transition-transform shadow-md md:shadow-lg group">
             <div className="bg-white rounded-[14px] md:rounded-[22px] p-3 md:px-5 md:py-6 h-full flex items-center md:flex-col md:items-start justify-between group-hover:bg-orange-50/80 transition-colors gap-3 md:gap-4">
                 <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-100 text-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden shrink-0">
                    <Camera className="w-5 h-5 md:w-6 md:h-6 absolute top-[10px] md:top-[14px]" />
                    <Mic className="w-2.5 h-2.5 md:w-3 md:h-3 absolute bottom-2 right-2 text-orange-400" />
                 </div>
                 
                 <div className="flex-1 min-w-0">
                   <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 mb-1">
                     <Zap className="w-2.5 h-2.5 md:w-3 md:h-3" /> Output Rápido
                   </div>
                   <h3 className="text-sm md:text-xl font-extrabold text-slate-800 leading-tight truncate">Reporte de Campo</h3>
                   <p className="text-slate-500 text-[10px] md:text-xs mt-0.5 md:mt-2 line-clamp-1 md:line-clamp-none">Documenta a través de dictado forense.</p>
                 </div>

                 <div className="bg-orange-500 text-white p-1.5 md:p-2 rounded-full shadow-md group-hover:bg-orange-600 transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                 </div>
             </div>
           </Link>
        </section>

        {/* Proyectos Recientes: Solo en PC */}
        <section className={`${isSimulatorEnabled ? 'hidden' : 'hidden md:block'} space-y-6`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <FileText className="w-5 h-5 text-blue-600" /> Historial de Proyectos
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar matriz o empresa..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingProjects ? (
              <div className="col-span-full text-center py-10 text-slate-500 font-semibold bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">
                Sincronizando BDD Nube...
              </div>
            ) : projects.length === 0 ? (
               <div className="col-span-full text-center py-10 text-slate-500 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300">
                Aún no tienes proyectos guardados en la nube. ¡Ve al Wizard y crea el primero!
              </div>
            ) : (
              projects.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <a 
                      href={`/api/projects/${p.id}/report`}
                      download
                      className="text-[10px] bg-slate-100 hover:bg-emerald-50 text-emerald-600 font-bold px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-200 transition-colors uppercase flex items-center gap-1 shadow-sm"
                    >
                      <FileText className="w-3 h-3" /> DOCX
                    </a>
                    <button 
                      onClick={(e) => deleteProject(p.id, e)}
                      className="bg-slate-100 hover:bg-red-50 text-red-500 p-1.5 rounded-full border border-slate-200 hover:border-red-200 transition-colors shadow-sm"
                      title="Eliminar Proyecto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{p.company || 'MiperAI Demo'}</p>
                  <h4 className="font-bold text-lg text-slate-800 mb-2 truncate">{p.name}</h4>
                  <p className="text-sm text-slate-500 font-light mb-4 line-clamp-2">
                    {p.procedures && p.procedures.length > 0 ? p.procedures[0].name : 'Procedimiento General'}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {p.astLogs && p.astLogs.length > 0 && (
                       <Link href={`/proyecto/${p.id}/charlas`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors border border-emerald-200 shadow-sm">
                         <ClipboardCheck className="w-4 h-4" />
                         {p.astLogs.length} Charla{p.astLogs.length !== 1 ? 's' : ''} AST (Ver)
                       </Link>
                    )}
                    {p.inspections && p.inspections.filter((i: any) => i.reportType === 'cumplimiento').length > 0 && (
                       <Link href={`/proyecto/${p.id}/hallazgos`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-bold transition-colors border border-orange-200 shadow-sm">
                         <Sparkles className="w-4 h-4" />
                         {p.inspections.filter((i: any) => i.reportType === 'cumplimiento').length} Insp. Positiva{p.inspections.filter((i: any) => i.reportType === 'cumplimiento').length !== 1 ? 's' : ''}
                       </Link>
                    )}
                    {p.inspections && p.inspections.filter((i: any) => i.reportType === 'falta').length > 0 && (
                       <Link href={`/proyecto/${p.id}/hallazgos`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors border border-red-200 shadow-sm">
                         <ShieldAlert className="w-4 h-4" />
                         {p.inspections.filter((i: any) => i.reportType === 'falta').length} Insp. Negativa{p.inspections.filter((i: any) => i.reportType === 'falta').length !== 1 ? 's' : ''}
                       </Link>
                    )}
                    {((!p.astLogs || p.astLogs.length === 0) && (!p.inspections || p.inspections.length === 0)) && (
                       <span className="text-xs text-slate-400 font-medium italic">Sin registros en terreno aún</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                    <Link href={`/wizard?projectId=${p.id}`} className="text-sm text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Ver Detalles &rarr;
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
