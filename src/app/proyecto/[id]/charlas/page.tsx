'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, ShieldCheck, CheckSquare, Camera, Mic, MapPin, ClipboardCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CharlasReportView() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/projects/${id}`)
        .then(res => res.json())
        .then(data => {
          setProject(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-screen bg-slate-50">
        <div className="animate-spin text-emerald-600 border-4 border-emerald-200 border-t-emerald-600 rounded-full w-12 h-12 mb-4"></div>
        <p className="text-slate-500 font-bold">Cargando bitácoras...</p>
      </div>
    );
  }

  if (!project || project.error) {
    return <div className="p-8 text-center text-red-500 font-bold">Error cargando el reporte.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 selection:bg-emerald-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 h-16 flex items-center justify-between shadow-sm">
        <button onClick={() => router.push('/')} className="text-slate-500 hover:text-emerald-700 flex items-center gap-2 font-bold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <h1 className="font-bold text-slate-800 hidden md:block">Reportes AST / Charlas</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 mt-4 md:mt-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 truncate">{project.name}</h2>
            <p className="text-slate-500 font-medium text-lg mb-6">Empresa: {project.company || 'Terreno'}</p>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                {project.astLogs?.length || 0} Charlas Registradas
              </span>
            </div>
          </div>
        </div>

        {(!project.astLogs || project.astLogs.length === 0) ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
             <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-500 font-bold text-lg">No hay registros de charlas (AST) para este proyecto.</p>
             <p className="text-slate-400 mt-2 text-sm">Ejecuta el Visor AST desde el móvil para enviar reportes a esta bandeja.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {project.astLogs.map((log: any) => {
              let checks = [];
              try { checks = JSON.parse(log.checkedControls || '[]'); } catch(e){}
              
              let photosArray: string[] = [];
              let audiosArray: string[] = [];
              
              if (log.photoData) {
                if (log.photoData.startsWith('[')) {
                  try { photosArray = JSON.parse(log.photoData); } catch(e){}
                } else {
                  photosArray = [log.photoData]; // Backward Compat
                }
              }
              if (log.audioData) {
                if (log.audioData.startsWith('[')) {
                  try { audiosArray = JSON.parse(log.audioData); } catch(e){}
                } else {
                  audiosArray = [log.audioData]; // Backward Compat
                }
              }
              
              const date = new Date(log.createdAt);
              
              return (
                <div key={log.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative group hover:border-emerald-300 hover:shadow-md transition-all">
                  <div className="hidden md:block absolute top-0 right-0 m-6 bg-slate-100 text-slate-400 font-black tracking-wider px-3 py-1 text-xs rounded-full border border-slate-200">
                    CRIPTOFIRMA: #{log.id.slice(-8).toUpperCase()}
                  </div>
                  
                  <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center gap-6">
                     <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                       <ShieldCheck className="w-8 h-8 text-emerald-600" />
                     </div>
                     <div>
                       <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">Reporte de Seguridad en Terreno</h3>
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-3 text-sm font-bold text-slate-500">
                         <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {date.toLocaleDateString()} a las {date.toLocaleTimeString()}</span>
                         <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg"><MapPin className="w-4 h-4" /> {log.procedureName}</span>
                       </div>
                       {/* Firma visible en móvil */}
                       <div className="mt-3 md:hidden block">
                         <span className="bg-slate-100 text-slate-400 font-black tracking-wider px-2 py-0.5 text-[10px] rounded border border-slate-200">
                           #{log.id.slice(-8).toUpperCase()}
                         </span>
                       </div>
                     </div>
                  </div>
                  
                  <div className="p-6 md:p-8">
                     <h4 className="font-black text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-tight text-sm">
                       <CheckSquare className="w-5 h-5 text-emerald-500" /> Controles Verificados ({checks.length})
                     </h4>
                     
                     {checks.length === 0 ? (
                       <p className="text-red-500 text-sm font-bold italic py-4 bg-red-50 px-4 rounded-xl border border-red-100">El trabajador cerró el AST sin verificar ningún control de la matriz.</p>
                     ) : (
                       <ul className="space-y-3 mb-8">
                         {checks.map((chk: string, i: number) => (
                           <li key={i} className="text-sm font-semibold text-slate-700 bg-gradient-to-r from-emerald-50 to-white p-3 md:p-4 rounded-xl border border-emerald-100 flex items-start gap-3 shadow-sm">
                              <span className="text-emerald-500 shrink-0 mt-0.5 bg-white rounded-full p-0.5 shadow-sm">✓</span> {chk}
                           </li>
                         ))}
                       </ul>
                     )}

                     {(photosArray.length > 0 || audiosArray.length > 0) && (
                       <div className="mt-4 pt-6 border-t border-slate-100">
                         <h4 className="font-black text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-tight text-sm">Evidencia Adjunta</h4>
                         
                         {photosArray.length > 0 && (
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                             {photosArray.map((photo, pIdx) => (
                               <div key={pIdx} className="w-full relative aspect-square">
                                 <img src={photo} alt={`Evidencia visual ${pIdx + 1}`} className="w-full h-full rounded-2xl border-4 border-white shadow-md object-cover" />
                               </div>
                             ))}
                           </div>
                         )}

                         {audiosArray.length > 0 && (
                           <div className="flex flex-col gap-3">
                             {audiosArray.map((audio, aIdx) => (
                               <div key={aIdx} className="w-full max-w-sm bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
                                 <div className="flex items-center gap-2 font-bold text-sm">
                                   <Mic className="w-4 h-4" /> Nota de Voz #{aIdx + 1}
                                 </div>
                                 <audio controls src={audio} className="w-full h-10" />
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
