'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Zap, AlertTriangle, ShieldCheck, Camera, Mic, Info } from 'lucide-react';
import Link from 'next/link';

export default function InspeccionesReportView({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const id = unwrappedParams?.id;
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
        <div className="animate-spin text-orange-600 border-4 border-orange-200 border-t-orange-600 rounded-full w-12 h-12 mb-4"></div>
        <p className="text-slate-500 font-bold">Cargando inspecciones...</p>
      </div>
    );
  }

  if (!project || project.error) {
    return <div className="p-8 text-center text-red-500 font-bold">Error cargando el reporte.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 selection:bg-orange-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 h-16 flex items-center justify-between shadow-sm">
        <button onClick={() => router.push('/')} className="text-slate-500 hover:text-orange-700 flex items-center gap-2 font-bold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <h1 className="font-bold text-slate-800 hidden md:block">Evaluaciones IA de Terreno</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 mt-4 md:mt-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Zap className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 truncate">{project.name}</h2>
            <p className="text-slate-500 font-medium text-lg mb-6">Empresa: {project.company || 'Terreno'}</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 border border-orange-200">
                <ShieldCheck className="w-5 h-5" />
                {project.inspections?.length || 0} Total
              </span>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 border border-green-200">
                <Zap className="w-4 h-4" />
                {project.inspections?.filter((i: any) => i.reportType === 'cumplimiento').length || 0} Ok
              </span>
              <span className="bg-red-100 text-red-800 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 border border-red-200">
                <AlertTriangle className="w-4 h-4" />
                {project.inspections?.filter((i: any) => i.reportType === 'falta').length || 0} Faltas
              </span>
            </div>
          </div>
        </div>

        {(!project.inspections || project.inspections.length === 0) ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
             <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-500 font-bold text-lg">No hay inspecciones para este proyecto.</p>
             <p className="text-slate-400 mt-2 text-sm">Dispara un registro de hallazgos desde el celular.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {project.inspections.map((log: any) => {
              let extItems: any = {};
              try { extItems = JSON.parse(log.extractedItems || '{}'); } catch(e){}
              
              const isFalta = log.reportType === 'falta';
              const date = new Date(log.createdAt);
              
              return (
                <div key={log.id} className={`bg-white rounded-3xl shadow-sm border overflow-hidden relative group transition-all ${isFalta ? 'border-red-200 hover:border-red-300' : 'border-green-200 hover:border-green-300'}`}>
                  <div className="hidden md:block absolute top-0 right-0 m-6 bg-slate-100 text-slate-400 font-black tracking-wider px-3 py-1 text-xs rounded-full border border-slate-200">
                    ID-INSP: #{log.id.slice(-8).toUpperCase()}
                  </div>
                  
                  <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row md:items-center gap-6 ${isFalta ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
                     <div className={`w-16 h-16 bg-white border rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${isFalta ? 'border-red-200 text-red-600' : 'border-green-200 text-green-600'}`}>
                       {isFalta ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                     </div>
                     <div>
                       <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">
                         {isFalta ? 'Hallazgo Crítico (Desviación)' : 'Inspección Positiva (Cumplimiento)'}
                       </h3>
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-3 text-sm font-bold text-slate-500">
                         <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-70" /> {date.toLocaleDateString()} a las {date.toLocaleTimeString()}</span>
                       </div>
                     </div>
                  </div>
                  
                  <div className="p-6 md:p-8">
                     <div className="mb-6">
                        <h4 className="font-black text-slate-700 mb-2 flex items-center gap-2 uppercase tracking-tight text-sm">
                           <Info className="w-4 h-4 text-orange-500" /> Diagnóstico del Supervisor de IA
                        </h4>
                        <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                          {extItems.description || "Sin descripción proporcionada."}
                        </p>
                     </div>

                     {(extItems.rules && extItems.rules.length > 0) && (
                       <div className="mb-6">
                          <h4 className="font-black text-slate-700 mb-2 uppercase tracking-tight text-sm">Normativa Cruzada Aplicada</h4>
                          <ul className="space-y-3">
                            {extItems.rules.map((rule: any, i: number) => (
                              <li key={i} className="text-sm border border-slate-200 bg-white p-4 rounded-xl shadow-sm">
                                <strong className="text-slate-800 block mb-1">{rule.norm}</strong>
                                <span className="text-slate-600">{rule.text}</span>
                              </li>
                            ))}
                          </ul>
                       </div>
                     )}

                     {(extItems.correctiveActions && extItems.correctiveActions.length > 0) && (
                       <div className="mb-6">
                          <h4 className="font-black text-red-700 mb-2 flex items-center gap-2 uppercase tracking-tight text-sm">
                            <Zap className="w-4 h-4" /> Acciones Correctivas
                          </h4>
                          <ul className="space-y-2">
                            {extItems.correctiveActions.map((action: string, i: number) => (
                              <li key={i} className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                                <span className="mt-0.5">•</span> {action}
                              </li>
                            ))}
                          </ul>
                       </div>
                     )}
                     
                     <div className="mt-8 pt-6 border-t border-slate-100">
                        <h4 className="font-black text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-tight text-sm">Evidencia de Terreno</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {log.photoData && !log.photoData.includes("base64_reducido") && log.photoData.startsWith("data:image") && (
                             <div className="aspect-video relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                               <img src={log.photoData} alt="Foto" className="w-full h-full object-contain" />
                             </div>
                          )}
                          {(log.transcription || log.audioData) && (
                             <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-center">
                               <div className="flex items-center gap-2 font-bold text-sm text-slate-500 mb-2 uppercase tracking-wider">
                                 <Mic className="w-4 h-4" /> Registro Forense Oral
                               </div>
                               {log.audioData && log.audioData.startsWith('data:audio') ? (
                                 <audio controls src={log.audioData} className="w-full h-10 mt-1" />
                               ) : (
                                 <p className="text-sm text-slate-700 italic font-medium">"{log.transcription || log.audioData}"</p>
                               )}
                             </div>
                          )}
                        </div>
                     </div>
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
