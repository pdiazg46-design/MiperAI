'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, CheckCircle2, FileDown, ShieldAlert, Loader2, ArrowLeft, Plus, Check, Upload, X, Trash2, Edit3, Save, ArrowUp, ArrowDown, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { generateMatrixDocxBlob } from '@/lib/docx-generator/exportService';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AILoadingScanner from '@/components/AILoadingScanner';

export function getRiskLevel(p: number, s: number): string {
  if (!p || !s) return 'MEDIO';
  if (p===1 && s===1) return 'Muy bajo';
  if (p===1 && s===2) return 'Muy bajo';
  if (p===1 && s===3) return 'Bajo';
  if (p===1 && s===4) return 'Medio';
  if (p===1 && s===5) return 'Medio';
  
  if (p===2 && s===1) return 'Muy bajo';
  if (p===2 && s===2) return 'Bajo';
  if (p===2 && s===3) return 'Medio';
  if (p===2 && s===4) return 'Medio';
  if (p===2 && s===5) return 'Alto';

  if (p===3 && s===1) return 'Bajo';
  if (p===3 && s===2) return 'Medio';
  if (p===3 && s===3) return 'Medio';
  if (p===3 && s===4) return 'Alto';
  if (p===3 && s===5) return 'Muy alto';

  if (p===4 && s===1) return 'Medio';
  if (p===4 && s===2) return 'Medio';
  if (p===4 && s===3) return 'Alto';
  if (p===4 && s===4) return 'Muy alto';
  if (p===4 && s===5) return 'Extremo';

  if (p===5 && s===1) return 'Medio';
  if (p===5 && s===2) return 'Alto';
  if (p===5 && s===3) return 'Muy alto';
  if (p===5 && s===4) return 'Extremo';
  if (p===5 && s===5) return 'Extremo';
  
  return 'Medio';
}

export function getRiskColorClass(level: string): string {
  const l = level.toLowerCase();
  if (l.includes('extremo')) return 'bg-red-200 text-red-900';
  if (l.includes('muy alto')) return 'bg-red-100 text-red-700';
  if (l.includes('alto')) return 'bg-orange-100 text-orange-800';
  if (l.includes('medio')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}

export default function WizardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user && (session.user as any).subscriptionTier === 'FREE' && (session.user as any).createdAt) {
       const created = new Date((session.user as any).createdAt);
       const now = new Date();
       const diffTime = now.getTime() - created.getTime();
       const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
       setTrialDaysLeft(15 - diffDays);
    }
  }, [session]);

  const isExpired = trialDaysLeft !== null && trialDaysLeft < 0;
  const [showPaywallAlert, setShowPaywallAlert] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  const [step, setStep] = useState(1);
  const [taskName, setTaskName] = useState('');
  const [altura, setAltura] = useState<string|null>(null);
  
  const [appMode, setAppMode] = useState('ai');
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setAppMode(urlParams.get('mode') || 'ai');
      
      const pid = urlParams.get('projectId');
      if (pid) {
        setProjectId(pid);
        fetch(`/api/projects/${pid}`)
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) {
               setProjectName(data.name || '');
               if (data.procedures && data.procedures.length > 0) {
                 setProcedureName(data.procedures[0].name || '');
                 if (data.procedures[0].jsonPayload) {
                   try {
                     const parsed = JSON.parse(data.procedures[0].jsonPayload);
                     if (Array.isArray(parsed)) {
                       setAccumulatedTasks(parsed);
                     }
                   } catch(e) {}
                 }
               }
            }
          })
          .catch(err => console.error("Error loading project:", err));
      }
    }
  }, []);
  
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [matrixResult, setMatrixResult] = useState<any>(null);
  
  // NEW: Accumulate tasks for a project
  const [accumulatedTasks, setAccumulatedTasks] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [procedureName, setProcedureName] = useState('');
  // NEW: Global procedure context
  const [procedimiento, setProcedimiento] = useState('');
  const [industria, setIndustria] = useState('Construcción');
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // NEW: Preview state
  const [previewData, setPreviewData] = useState<any>(null);
  
  // NEW: Manual form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTask, setManualTask] = useState({
    taskName: '',
    hazard: '',
    incident: '',
    riskLevel: 'MEDIO',
    controls: ''
  });

  const handleAddManualTask = () => {
    if(!manualTask.taskName || !manualTask.hazard) return;
    const newTask = {
        taskOriginalName: manualTask.taskName + " (Agregado Manualmente)",
        result: {
            task: manualTask.taskName,
            risks: [{
                hazard: manualTask.hazard,
                incident: manualTask.incident,
                initialRiskLevel: manualTask.riskLevel,
                controls: manualTask.controls.split('\n').filter(c => c.trim().length > 0).map(c => c.trim())
            }]
        }
    };
    setAccumulatedTasks(prev => [...prev, newTask]);
    setShowManualForm(false);
    setManualTask({taskName: '', hazard: '', incident: '', riskLevel: 'MEDIO', controls: ''});
  };
  
  // NEW: Bulk Review Interface
  const [bulkReviewTasks, setBulkReviewTasks] = useState<any[] | null>(null);

  const handleUpdateBulkTask = (idx: number, field: string, value: string) => {
    if (!bulkReviewTasks) return;
    const mapped = [...bulkReviewTasks];
    if (field === 'taskOriginalName') mapped[idx].taskOriginalName = value;
    if (field === 'task') mapped[idx].result.task = value;
    setBulkReviewTasks(mapped);
  }

  const handleRemoveBulkTask = (idx: number) => {
    if (!bulkReviewTasks) return;
    setBulkReviewTasks(bulkReviewTasks.filter((_, i) => i !== idx));
  }

  const handleApproveBulkTasks = () => {
    if (!bulkReviewTasks) return;
    setAccumulatedTasks(prev => [...prev, ...bulkReviewTasks]);
    setBulkReviewTasks(null);
  }

  const moveAccumulatedTask = (e: React.MouseEvent, idx: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    const newTasks = [...accumulatedTasks];
    if (direction === 'up' && idx > 0) {
      [newTasks[idx - 1], newTasks[idx]] = [newTasks[idx], newTasks[idx - 1]];
    } else if (direction === 'down' && idx < newTasks.length - 1) {
      [newTasks[idx], newTasks[idx + 1]] = [newTasks[idx + 1], newTasks[idx]];
    }
    setAccumulatedTasks(newTasks);
  }
  
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isExpired) { setShowPaywallAlert(true); return; }

    setIsParsing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProcedimiento(data.text);
      await performAutoMap(data.text);
    } catch (err: any) {
      alert("Error al extraer texto: " + err.message);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const performAutoMap = async (procedimientoBase: string) => {
    setIsBulkGenerating(true);
    try {
      const res = await fetch('/api/extract-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ procedimientoBase, industria }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de servidor");
      
      if (data.tareas && Array.isArray(data.tareas)) {
        data.tareas.forEach((t: any) => {
          if (t.result && t.result.risks && Array.isArray(t.result.risks)) {
            t.result.risks.sort((a: any, b: any) => (b.magnitudeRisk || 0) - (a.magnitudeRisk || 0));
          }
        });
      }

      setBulkReviewTasks(data.tareas);
    } catch (e: any) {
      console.error(e);
      alert("Error en la extracción masiva: " + e.message);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const runAIAlgorithm = async () => {
    if (isExpired) { setShowPaywallAlert(true); return; }
    setIsGenerating(true);
    setStep(3);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskName: taskName, 
          context: { altura, industria, procedimientoBase: procedimiento } 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de servidor");
      
      if (data.risks && Array.isArray(data.risks)) {
        data.risks.sort((a: any, b: any) => (b.magnitudeRisk || 0) - (a.magnitudeRisk || 0));
      }

      setMatrixResult(data);
    } catch (e: any) {
      console.error(e);
      alert("Error en la conexión con OpenAI: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  }

  const saveTaskAndContinue = () => {
    if (matrixResult) {
      setAccumulatedTasks([...accumulatedTasks, { taskOriginalName: taskName, result: matrixResult }]);
    }
    // Reset wizard to step 1
    setTaskName('');
    setAltura(null);
    setMatrixResult(null);
    setStep(1);
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectName,
          procedureName,
          companyName: 'AceroTech S.A.', // Puede ser reemplazado dinámicamente si se requiere
          tasksPayload: accumulatedTasks
        })
      });
      if (!res.ok) throw new Error();
      alert("✅ ¡Proyecto Guardado Exitosamente en Prisma/Neon!");
    } catch(e) {
      alert("Error crítico conectando con el backend.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportProject = async () => {
    const tier = (session?.user as any)?.subscriptionTier;
    if (tier === 'FREE' || tier === 'BASICO') {
      alert("Tu plan actual no incluye exportación de documentos.\n\nActualiza tu cuenta a PRO para desbloquear esta función.");
      router.push('/checkout');
      return;
    }

    try {
      // Usamos tanto el proyecto como el procedimiento para el documento
      const documentTitle = `${projectName} - ${procedureName}`;
      const blob = await generateMatrixDocxBlob(documentTitle, accumulatedTasks);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeProjectName = (projectName || 'Proyecto').replace(/\s+/g, '_');
      const safeProcedureName = (procedureName || 'Procedimiento').replace(/\s+/g, '_');
      link.download = `Matriz_${safeProjectName}_${safeProcedureName}_MiperAI.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error al generar el documento Word.");
    }
  };

  const handleExportPDF = () => {
    const tier = (session?.user as any)?.subscriptionTier;
    if (tier === 'FREE' || tier === 'BASICO') {
      alert("Tu plan actual no incluye exportación de documentos.\n\nActualiza tu cuenta a PRO para desbloquear esta función.");
      router.push('/checkout');
      return;
    }

    const documentTitle = `${projectName} - ${procedureName}`;
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Matriz_${(projectName || 'Proyecto').replace(/\s+/g, '_')}_${(procedureName || 'Procedimiento').replace(/\s+/g, '_')}</title>
        <style>
          @page { size: landscape; margin: 10mm; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
          h1 { text-align: center; color: #0f172a; margin-bottom: 5px; font-size: 24px; }
          h3 { text-align: center; color: #64748b; margin-bottom: 30px; font-weight: 500; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; vertical-align: top; }
          th { background-color: #f8fafc; font-weight: bold; color: #334155; }
          .risk-level { font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase; }
          .muy-bajo, .bajo { background-color: #dcfce3; color: #16a34a; }
          .medio { background-color: #fef9c3; color: #a16207; }
          .alto { background-color: #ffedd5; color: #ea580c; }
          .muy-alto { background-color: #fee2e2; color: #dc2626; }
          .extremo { background-color: #fecdd3; color: #9f1239; }
        </style>
      </head>
      <body>
        <h1>Matriz de Identificación de Peligros y Riesgos</h1>
        <h3>Proyecto: ${projectName} | Procedimiento: ${procedureName}</h3>
        <table>
          <thead>
            <tr>
              <th style="width:20%">Tarea</th>
              <th style="width:18%">Peligro</th>
              <th style="width:20%">Riesgo / Incidente</th>
              <th style="width:15%">E. Inicial (P x S)</th>
              <th style="width:27%">Controles Establecidos</th>
            </tr>
          </thead>
          <tbody>
    `;

    accumulatedTasks.forEach(t => {
      const taskNameStr = t.taskOriginalName || t.result.task;
      const rowSpan = t.result.risks.length;
      t.result.risks.forEach((risk: any, aIdx: number) => {
        const exactLevel = getRiskLevel(risk.probability, risk.severity);
        const riskLevelLower = exactLevel.toLowerCase();
        let riskClass = 'medio';
        if(riskLevelLower.includes('extremo')) riskClass = 'extremo';
        else if(riskLevelLower.includes('muy alto')) riskClass = 'muy-alto';
        else if(riskLevelLower.includes('alto')) riskClass = 'alto';
        else if(riskLevelLower.includes('medio')) riskClass = 'medio';
        else riskClass = 'bajo';

        htmlContent += `<tr>`;
        if (aIdx === 0) {
          htmlContent += `<td rowspan="${rowSpan}"><b>${taskNameStr}</b></td>`;
        }
        htmlContent += `
          <td>${risk.hazard}</td>
          <td style="color:#dc2626; font-weight:500;">${risk.incident}</td>
          <td style="text-align:center;">
             <div style="font-size:10px; color:#64748b; margin-bottom:4px; font-weight:bold;">Prob: ${risk.probability||'-'} | Sev: ${risk.severity||'-'}</div>
             <span class="risk-level ${riskClass}">MR: ${risk.magnitudeRisk||'-'} (${exactLevel})</span>
          </td>
          <td>
            <ul style="margin:0; padding-left:16px;">
              ${risk.controls.map((c: string) => `<li>${c}</li>`).join('')}
            </ul>
          </td>
        </tr>`;
      });
    });

    htmlContent += `
          </tbody>
        </table>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 500); }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=1000,height=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative w-full">
      {showPaywallAlert && (
         <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center text-center">
               <ShieldAlert className="w-16 h-16 text-red-500 mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
               <h3 className="text-2xl font-black text-white mb-2">Prueba Expirada</h3>
               <p className="text-zinc-400 text-sm mb-6">Tus 15 días de prueba han terminado. Para continuar procesando matrices con la IA, requieres un Pase PRO.</p>
               <Link href="/checkout" className="w-full">
                 <button className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    Obtener Pase PRO
                 </button>
               </Link>
               <button onClick={() => setShowPaywallAlert(false)} className="mt-4 text-xs font-semibold text-zinc-500 hover:text-white transition-colors">
                 Cerrar (Modo Lectura)
               </button>
            </div>
         </div>
      )}
      
      {showValidationAlert && (
         <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 min-h-screen">
            <div className="bg-white border flex flex-col items-center justify-center border-slate-200 p-8 rounded-3xl max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] text-center animate-in zoom-in-95 duration-200">
               <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                 <ShieldAlert className="w-8 h-8 text-amber-500" />
               </div>
               <h3 className="text-xl font-extrabold text-slate-800 mb-2">Faltan Datos</h3>
               <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                 Debes definir el <b>Nombre del Proyecto</b> y el <b>Procedimiento</b> en el panel izquierdo antes de continuar.
               </p>
               <button 
                 onClick={() => setShowValidationAlert(false)} 
                 className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95"
               >
                 Entendido, volver
               </button>
            </div>
         </div>
      )}

      {trialDaysLeft !== null && trialDaysLeft >= 0 && (
         <div className="w-full relative z-[100] bg-orange-600/90 backdrop-blur-md text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-4 shadow-md border-b border-orange-500 shrink-0">
            <span className="text-[13px] font-bold uppercase tracking-wide">⚠️ Período de Prueba Activo: Quedan {trialDaysLeft} Días</span>
            <Link href="/checkout">
               <button className="bg-white hover:bg-zinc-100 text-orange-700 px-4 py-1.5 rounded-lg text-xs font-black shadow-md uppercase transition-all">
                 Hacer Upgrade Ahora
               </button>
            </Link>
         </div>
      )}
      
      <div className="flex flex-col md:flex-row flex-1 relative w-full">
      {/* Sidebar de Proyecto (Carrito) */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 md:min-h-screen flex flex-col md:sticky md:top-0 z-40 shadow-sm order-2 md:order-1 h-[40vh] md:h-screen">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <Link href="/" className="flex bg-slate-800 text-white hover:bg-slate-900 px-4 py-2.5 rounded-xl mb-6 font-bold shadow-md items-center justify-center gap-2 transition-all">
            <ArrowLeft className="w-5 h-5"/> Volver al Panel Principal
          </Link>
          <div className="flex flex-col mb-5 space-y-4 bg-slate-100/50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Define el Nombre del Proyecto</label>
              <input 
                type="text" 
                value={projectName}
                onChange={(e)=>setProjectName(e.target.value)}
                className="w-full text-sm font-bold text-slate-800 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2.5 outline-none transition-all shadow-sm placeholder:font-normal placeholder:text-slate-400"
                placeholder="Ej: Construcción Edificio B..."
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Define el Nombre del Procedimiento</label>
              <input 
                type="text" 
                value={procedureName}
                onChange={(e)=>setProcedureName(e.target.value)}
                className="w-full text-sm font-bold text-slate-800 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2.5 outline-none transition-all shadow-sm placeholder:font-normal placeholder:text-slate-400"
                placeholder="Ej: Montaje de Andamios..."
              />
            </div>

            <div className="pt-2 border-t border-slate-200/60 mt-1">
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Sector Industrial / Contexto</label>
              <select 
                value={industria} 
                onChange={(e) => setIndustria(e.target.value)}
                className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 outline-none transition-all shadow-sm"
              >
                <option value="Construcción">Construcción / Obras Civiles</option>
                <option value="Telecomunicaciones">Telecomunicaciones</option>
                <option value="Minería">Minería</option>
                <option value="Servicios de Salud">Servicios de Salud / Hospitalario</option>
                <option value="Industrial / Manufactura">Industrial / Manufactura</option>
                <option value="Logística y Transporte">Logística y Transporte</option>
                <option value="Forestal">Forestal y Maderero</option>
                <option value="Otro">Otro sector</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium bg-slate-100 p-1.5 rounded-md inline-block">{accumulatedTasks.length} Maniobras evaluadas</p>
          


          {appMode === 'import' && (
            <div className="mt-4 flex flex-col items-center justify-center gap-3 p-5 bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl text-center">
               <div className="bg-white p-2 rounded-full shadow-sm">
                 <Upload className="w-6 h-6 text-blue-500" />
               </div>
               <div>
                  <p className="font-bold text-slate-700 text-sm">Actualizar Matriz Antigua</p>
                  <p className="text-[10px] text-slate-500 mt-1 px-2 leading-tight">Sube tu archivo (Excel, Word o PDF) y la IA extraerá y estandarizará normativamente la matriz vieja.</p>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileUpload} 
                 className="hidden" 
                 accept=".pdf,.doc,.docx,.xls,.xlsx"
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition-colors uppercase tracking-wide flex items-center justify-center gap-2"
                 disabled={isParsing}
               >
                  {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cargar Matriz Anterior'}
               </button>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-slate-50 md:bg-transparent">
          {accumulatedTasks.length === 0 ? (
             <div className="text-center py-10 opacity-60">
               <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-slate-300" />
               <p className="text-sm font-medium">Bandeja vacía.</p>
             </div>
          ) : (
            accumulatedTasks.map((t, idx) => (
              <div 
                key={idx} 
                onClick={() => setPreviewData(t)}
                className="bg-white rounded-md p-2 border border-slate-200 flex items-center gap-2 shadow-sm animate-in slide-in-from-left-4 cursor-pointer hover:border-blue-400 hover:shadow transition-all group relative pr-[72px]"
              >
                <div className="bg-slate-100 text-slate-500 font-bold text-[10px] min-w-[20px] h-[20px] flex items-center justify-center rounded-sm shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shadow-inner">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-700 text-xs truncate leading-tight">{t.result.task || t.taskOriginalName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.result.risks?.length || 0} riesgos</p>
                </div>
                
                <div className="absolute right-0.5 top-0 bottom-0 flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md px-1 rounded-r-md">
                  <button onClick={(e) => moveAccumulatedTask(e, idx, 'up')} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={(e) => moveAccumulatedTask(e, idx, 'down')} disabled={idx === accumulatedTasks.length - 1} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                  <button onClick={(e) => { e.stopPropagation(); setAccumulatedTasks(prev => prev.filter((_, i) => i !== idx)); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))
          )}
          
          <div className="pt-2">
            <button 
              onClick={() => {
                 if (!projectName.trim() || !procedureName.trim()) {
                    setShowValidationAlert(true);
                    return;
                 }
                 setShowManualForm(true);
              }}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-500 bg-white p-2.5 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Agregar Maniobra Manual
            </button>
          </div>
        </div>


      </aside>

      {/* Main Wizard Area */}
      <main className="flex-1 order-1 md:order-2 overflow-y-auto w-full flex flex-col relative h-[60vh] md:h-screen">
        
        {accumulatedTasks.length > 0 && (
          <div className="sticky top-0 z-[45] bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 xl:pr-[280px] flex flex-col xl:flex-row items-center justify-between gap-4 shadow-sm w-full">
            <div className="flex items-center gap-3 w-full xl:w-auto justify-center xl:justify-start">
               <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200 shrink-0">
                 <ShieldAlert className="w-5 h-5 text-blue-600" />
               </div>
               <div>
                  <h3 className="font-extrabold text-slate-800 text-base md:text-lg leading-tight">Tablero de Exportación y Guardado</h3>
                  <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest">{accumulatedTasks.length} maniobras armadas y listas</p>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 w-full xl:w-auto">
              <button 
                onClick={handleSaveProject}
                disabled={isSaving}
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-xs md:text-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'A Nube ☁️'}
              </button>
              <div className="hidden xl:block w-px h-6 bg-slate-300 mx-1"></div>
              <button 
                onClick={handleExportProject}
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all text-xs md:text-sm"
              >
                A Word <FileDown className="w-4 h-4" />
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-red-600/20 hover:bg-red-700 hover:-translate-y-0.5 transition-all text-xs md:text-sm"
              >
                A PDF <FileDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex-1">
        {bulkReviewTasks ? (
           <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-10">
             <div className="text-center space-y-3 relative mb-6">
               <button onClick={() => setBulkReviewTasks(null)} className="absolute left-0 top-1 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                 <ArrowLeft className="w-5 h-5 text-slate-600"/>
               </button>
               <h2 className="text-2xl font-extrabold text-slate-800 px-12">Revisión de Maniobras Generadas</h2>
               <p className="text-slate-500 text-sm font-medium">Edita la redacción o descarta fases incorrectas antes de aprobarlas.</p>
             </div>
             
             <div className="space-y-4">
               {bulkReviewTasks.map((t, idx) => (
                 <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-300 transition-colors">
                    <button onClick={() => handleRemoveBulkTask(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-1.5 rounded-md z-10 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 opacity-80"></div>
                    <div className="ml-2 w-full pr-10">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Fase Operacional (Título)</label>
                      <input 
                        type="text" 
                        value={t.taskOriginalName} 
                        onChange={(e) => handleUpdateBulkTask(idx, 'taskOriginalName', e.target.value)}
                        className="w-full font-bold text-slate-800 text-lg border-b border-transparent hover:border-slate-300 focus:border-blue-500 bg-transparent outline-none transition-colors px-1"
                      />
                    </div>
                    <div className="ml-2 w-full">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Descripción Técnica</label>
                       <textarea 
                          value={t.result.task}
                          onChange={(e) => handleUpdateBulkTask(idx, 'task', e.target.value)}
                          className="w-full text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-slate-300 focus:border-blue-500 resize-none h-20 outline-none transition-colors"
                       />
                    </div>
                    <div className="ml-2 bg-green-50 border border-green-100 rounded-md p-2 mt-1 w-max pr-4">
                      <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Matriz Interna: {t.result.risks.length} riesgos clasificados</span>
                    </div>
                 </div>
               ))}
             </div>
             
             {bulkReviewTasks.length > 0 ? (
                 <div className="sticky bottom-4 z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200 mt-8">
                   <button 
                     onClick={handleApproveBulkTasks}
                     className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-xl font-bold shadow-md hover:bg-slate-800 hover:-translate-y-1 transition-all text-sm"
                   >
                     Aprobar {bulkReviewTasks.length} Maniobras <Save className="w-5 h-5" />
                   </button>
                 </div>
             ) : (
                 <div className="text-center text-slate-500 py-10 bg-slate-100 rounded-xl">Has descartado todas las tareas. Inicia nuevamente.</div>
             )}
           </div>
        ) : previewData ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
             <div className="text-center space-y-3 relative mb-6">
               <button onClick={() => setPreviewData(null)} className="absolute left-0 top-1 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                 <ArrowLeft className="w-5 h-5 text-slate-600"/>
               </button>
               <h2 className="text-2xl font-extrabold text-slate-800 px-12">Detalle de Matriz Generada</h2>
               <p className="text-slate-500 text-sm font-medium">{previewData.result.task || previewData.taskOriginalName}</p>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
               <table className="w-full text-sm text-left border-collapse">
                 <thead className="bg-slate-800 text-white text-xs uppercase font-bold">
                   <tr>
                     <th className="px-4 py-3 border-r border-slate-700 w-1/4">Tarea</th>
                     <th className="px-4 py-3 border-r border-slate-700 w-[18%]">Peligro</th>
                     <th className="px-4 py-3 border-r border-slate-700 w-1/5">Riesgo / Incidente</th>
                     <th className="px-4 py-3 border-r border-slate-700 text-center w-[12%]">Magnitud (PxS)</th>
                     <th className="px-4 py-3">Controles Establecidos</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200">
                   {previewData.result.risks.map((risk: any, aIdx: number) => (
                     <tr key={aIdx} className="hover:bg-slate-50 transition-colors align-top">
                        {aIdx === 0 && (
                          <td 
                            rowSpan={previewData.result.risks.length} 
                            className="px-4 py-4 border-r border-slate-200 bg-slate-50 min-w-[200px]"
                          >
                            <span className="font-bold text-slate-800 block mb-2 leading-tight">{previewData.taskOriginalName || previewData.result.task}</span>
                            {previewData.taskOriginalName && previewData.result.task && previewData.taskOriginalName !== previewData.result.task && (
                               <span className="text-xs text-slate-600 block">{previewData.result.task}</span>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-4 border-r border-slate-200 text-slate-800 font-semibold">{risk.hazard}</td>
                        <td className="px-4 py-4 border-r border-slate-200 text-red-600 font-medium text-xs">{risk.incident}</td>
                        <td className="px-4 py-4 border-r border-slate-200 text-center">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200" title="Evaluación Matemática: Probabilidad x Severidad">
                               <span title="Probabilidad (1 a 4)">P:{risk.probability || '-'}</span>
                               <span className="text-slate-300 mx-0.5">x</span>
                               <span title="Severidad / Consecuencia (1 a 4)">S:{risk.severity || '-'}</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold w-full text-center ${getRiskColorClass(getRiskLevel(risk.probability, risk.severity))}`}>
                              MR: {risk.magnitudeRisk || '-'} ({getRiskLevel(risk.probability, risk.severity)})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                           <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                             {risk.controls.map((c: string, i: number) => <li key={i}>{c}</li>)}
                           </ul>
                        </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4 mt-6">
               <button 
                 onClick={() => setPreviewData(null)}
                 className="flex-1 bg-slate-800 text-white p-4 rounded-xl font-bold shadow-md hover:bg-slate-700 transition-all text-sm"
               >
                 Cerrar Vista Previa
               </button>
               <button 
                 onClick={() => {
                   setAccumulatedTasks(prev => prev.filter(t => t !== previewData));
                   setPreviewData(null);
                 }}
                 className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl font-bold shadow-sm hover:bg-red-100 transition-all text-sm px-6"
               >
                 <Trash2 className="w-5 h-5" /> Eliminar Maniobra
               </button>
             </div>
          </div>
        ) : (
          <>
        {/* Progress indicator */}
        <div className="flex justify-start mb-8">
           <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400">Paso {step} de 3</span>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-full">
                <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                <div className={`h-2 w-8 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
              </div>
            </div>
        </div>

        {step === 1 && (
          <div className={`grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${appMode === 'ai' ? 'lg:grid-cols-2' : ''}`}>
             
             {/* LEFT COLUMN: Upload Document (Masivo IA) */}
             {appMode === 'ai' && (
               <div className="space-y-6 flex flex-col justify-center bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200">
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-14 h-14 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-2xl shadow-inner border border-indigo-200">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-800">Análisis Masivo Mágico 🪄</h2>
                    <p className="text-slate-500 text-[13px] px-4">Sube un Procedimiento completo (PDF/Word). La IA extraerá e interpretará todas las maniobras operativas automáticamente.</p>
                  </div>
                  

                  <div className="flex flex-col items-center justify-center p-6 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-2xl transition-all hover:bg-indigo-50 hover:border-indigo-400 mt-2">
                      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload} />
                      
                      <button 
                        onClick={() => {
                           if (!projectName.trim() || !procedureName.trim()) {
                              setShowValidationAlert(true);
                              return;
                           }
                           fileInputRef.current?.click();
                        }} 
                        disabled={isParsing || isBulkGenerating} 
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl shadow-lg font-bold text-xs transition-colors uppercase tracking-wide disabled:opacity-50"
                      >
                        {(isParsing || isBulkGenerating) ? <Loader2 className="w-5 h-5 animate-spin"/> : <Upload className="w-5 h-5" />}
                        {isParsing ? 'Procesando Archivo...' : isBulkGenerating ? 'Mapeando Riesgos...' : 'Seleccionar Documento'}
                      </button>
                   </div>
               </div>
             )}

             {/* RIGHT COLUMN: Manual Individual Task Input */}
             {appMode !== 'import' && (
               <div className="space-y-6 flex flex-col justify-center bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200">
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-14 h-14 bg-blue-100 text-blue-600 flex items-center justify-center rounded-2xl shadow-inner border border-blue-200">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-800">Evaluación Individual 🎯</h2>
                    <p className="text-slate-500 text-[13px] px-4">Describe puntualmente una maniobra. Nuestro motor normativo estructurará los peligros, incidentes y controles idóneos.</p>
                  </div>
                  
                  <div 
                    className="bg-slate-50 p-2 rounded-2xl shadow-inner border border-slate-100 relative group mt-4"
                    onClickCapture={(e) => {
                      if (!projectName.trim() || !procedureName.trim()) {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowValidationAlert(true);
                      }
                    }}
                  >
                    <textarea 
                      className={`w-full border-2 border-slate-200 rounded-xl p-4 text-slate-700 text-sm font-medium focus:ring-0 focus:border-blue-500 bg-white min-h-[140px] resize-none transition-colors ${(!projectName.trim() || !procedureName.trim()) ? 'cursor-not-allowed opacity-60' : ''}`}
                      placeholder="Ejemplo: Armado y nivelación de andamios tubulares perimetrales sobre superficie irregular..."
                      value={taskName}
                      readOnly={!projectName.trim() || !procedureName.trim()}
                      onChange={(e) => setTaskName(e.target.value)}
                    />
                    { (!projectName.trim() || !procedureName.trim()) && (
                      <div className="absolute inset-0 z-10 cursor-not-allowed flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[1px] rounded-2xl">
                         <span className="bg-slate-800 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-lg shadow-md">
                           Defina el documento primero
                         </span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    disabled={taskName.length < 5}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale uppercase text-xs"
                  >
                    Identificar Riesgos <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
             )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
             <div className="text-center space-y-4">
              <h2 className="text-2xl font-extrabold text-slate-800">Preguntas Clave</h2>
              <p className="text-slate-500">Configuración rápida de entorno laboral</p>
            </div>

             <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <p className="font-semibold text-slate-800 mb-3">1. ¿La tarea involucra trabajar a más de 1.8 metros de altura?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setAltura('yes')} className={`flex-1 border rounded-lg py-2 font-medium transition-all ${altura === 'yes' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Sí</button>
                    <button onClick={() => setAltura('no')} className={`flex-1 border rounded-lg py-2 font-medium transition-all ${altura === 'no' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}>No</button>
                  </div>
                </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="w-1/3 p-4 rounded-xl font-bold bg-white border border-slate-200 text-slate-600">
                Volver
              </button>
              <button 
                onClick={runAIAlgorithm}
                disabled={!altura}
                className="w-2/3 flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-xl font-bold shadow-lg disabled:opacity-50 hover:-translate-y-1 transition-all"
              >
                Analizar Riesgos <ShieldAlert className="w-5 h-5 text-yellow-400" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500">
             {isGenerating ? (
               <AILoadingScanner />
             ) : matrixResult && matrixResult.risks ? (
               <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center rounded-2xl shadow-sm border border-green-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-800">Tarea Evaluada</h2>
                  <p className="text-slate-600 font-medium">Revisa los riesgos y anexa la tarea a tu proyecto.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto text-left">
                 <table className="w-full text-sm border-collapse">
                   <thead className="bg-slate-800 text-white text-xs uppercase font-bold">
                     <tr>
                       <th className="px-4 py-3 border-r border-slate-700 w-1/4">Tarea</th>
                       <th className="px-4 py-3 border-r border-slate-700 w-[18%]">Peligro</th>
                       <th className="px-4 py-3 border-r border-slate-700 w-1/5">Riesgo / Incidente</th>
                       <th className="px-4 py-3 border-r border-slate-700 text-center w-[12%]">Magnitud (PxS)</th>
                       <th className="px-4 py-3">Controles Establecidos</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200">
                     {matrixResult.risks.map((risk: any, aIdx: number) => (
                       <tr key={aIdx} className="hover:bg-slate-50 transition-colors align-top">
                          {aIdx === 0 && (
                            <td 
                              rowSpan={matrixResult.risks.length} 
                              className="px-4 py-4 border-r border-slate-200 bg-slate-50 min-w-[200px]"
                            >
                              <span className="font-bold text-slate-800 block mb-2 leading-tight">{taskName}</span>
                            </td>
                          )}
                          <td className="px-4 py-4 border-r border-slate-200 text-slate-800 font-semibold">{risk.hazard}</td>
                          <td className="px-4 py-4 border-r border-slate-200 text-red-600 font-medium text-xs">{risk.incident}</td>
                          <td className="px-4 py-4 border-r border-slate-200 text-center">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200" title="Evaluación Matemática: Probabilidad x Severidad">
                                 <span title="Probabilidad (1 a 4)">P:{risk.probability || '-'}</span>
                                 <span className="text-slate-300 mx-0.5">x</span>
                                 <span title="Severidad / Consecuencia (1 a 4)">S:{risk.severity || '-'}</span>
                              </div>
                              <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold w-full text-center ${getRiskColorClass(getRiskLevel(risk.probability, risk.severity))}`}>
                                MR: {risk.magnitudeRisk || '-'} ({getRiskLevel(risk.probability, risk.severity)})
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                             <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                               {risk.controls.map((c: string, i: number) => <li key={i}>{c}</li>)}
                             </ul>
                          </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                </div>

                <div className="flex gap-3">
                   <button 
                    onClick={() => { setMatrixResult(null); setStep(1); }}
                    className="w-1/3 flex items-center justify-center bg-white text-red-600 border border-slate-200 p-4 rounded-xl font-bold hover:bg-red-50 transition-all shadow-sm"
                  >
                    Descartar Tarea
                  </button>
                  <button 
                    onClick={saveTaskAndContinue}
                    className="w-2/3 flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition-all"
                  >
                    Guardar y Añadir Otra <Plus className="w-5 h-5" />
                  </button>
                </div>
               </div>
             ) : (
                <div className="text-center text-red-500">Error inesperado en generación de matriz.</div>
             )}
          </div>
        )}
        </>
       )}
        </div>
      </main>

      {/* MODAL: Formulario Manual */}
      {showManualForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" /> Nueva Maniobra Manual
              </h3>
              <button onClick={() => setShowManualForm(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tarea</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Ej: Instalación de andamio"
                  value={manualTask.taskName} 
                  onChange={e => setManualTask({...manualTask, taskName: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Peligro</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Trabajo en altura"
                    value={manualTask.hazard} 
                    onChange={e => setManualTask({...manualTask, hazard: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Riesgo / Incidente</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Caída a distinto nivel"
                    value={manualTask.incident} 
                    onChange={e => setManualTask({...manualTask, incident: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Clasificación Inicial</label>
                <select 
                  value={manualTask.riskLevel} 
                  onChange={e => setManualTask({...manualTask, riskLevel: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-700" 
                >
                  <option value="BAJO">BAJO</option>
                  <option value="MEDIO">MEDIO</option>
                  <option value="ALTO">ALTO</option>
                  <option value="CRÍTICO">CRÍTICO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Controles Establecidos (1 por línea)</label>
                <textarea 
                  placeholder="Ej:- Uso de arnés de seguridad&#10;- Charla de 5 minutos..."
                  value={manualTask.controls} 
                  onChange={e => setManualTask({...manualTask, controls: e.target.value})}
                  className="w-full h-24 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowManualForm(false)} 
                className="px-4 py-2 text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddManualTask}
                disabled={!manualTask.taskName || !manualTask.hazard}
                className="px-4 py-2 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Insertar a la Bandeja
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
