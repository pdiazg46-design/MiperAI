'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Loader2, Home, Save, UserPlus, Settings2, CheckCircle2, AlertCircle, FileSpreadsheet, Trash2 } from 'lucide-react';
import Link from 'next/link';

const formatRUT = (value: string) => {
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length === 0) return '';
  if (clean.length <= 1) return clean;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  let formattedBody = '';
  for (let i = body.length - 1, j = 1; i >= 0; i--, j++) {
    formattedBody = body[i] + formattedBody;
    if (j % 3 === 0 && i !== 0) {
      formattedBody = '.' + formattedBody;
    }
  }
  return `${formattedBody}-${dv}`;
};

export default function CompanyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [company, setCompany] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
  };

  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any).subscriptionTier !== 'ENTERPRISE') {
      router.push('/wizard');
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resC = await fetch('/api/company');
      const dataC = await resC.json();
      if(!dataC.error) setCompany(dataC);

      const resU = await fetch('/api/company/users');
      const dataU = await resU.json();
      if(Array.isArray(dataU)) setUsers(dataU);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
       const res = await fetch('/api/company', {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(company)
       });
       if(res.ok) showToast("Perfil corporativo guardado con éxito.");
    } finally {
       setSavingCompany(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newEmail) return;
      try {
         const res = await fetch('/api/company/users', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email: newEmail })
         });
         const data = await res.json();
         if(res.ok) {
             showToast("Trabajador anexado a la compañía.");
             setNewEmail('');
             fetchData(); // reload
         } else {
             showToast(data.error || "No se pudo anexar", 'error');
         }
      } catch(e) {
          showToast("Error de conexión", 'error');
      }
  };

  const handeUpdateUser = async (userId: string, changes: any) => {
    setProcessingId(userId);
    try {
      const res = await fetch('/api/company/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...changes })
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u.id === userId ? { ...u, ...updated } : u));
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if(!confirm("¿Dar de baja a este trabajador? Pierde acceso a tu empresa, pero su cuenta personal no se borra.")) return;
    setProcessingId(userId);
    try {
      const res = await fetch(`/api/company/users?userId=${userId}`, {
        method: 'DELETE'
      });
      if(res.ok) {
         showToast("Trabajador dado de baja.");
         fetchData();
      } else {
         showToast("Error al dar de baja", "error");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
         try {
             setLoading(true);
             const bstr = evt.target?.result;
             const XLSX = await import('xlsx');
             const wb = XLSX.read(bstr, { type: 'binary' });
             const wsname = wb.SheetNames[0];
             const ws = wb.Sheets[wsname];
             const data = XLSX.utils.sheet_to_json(ws);
             
             const mappedUsers = data.map((row: any) => ({
                 email: row.email || row.Email || row.correo || row.Correo,
                 name: row.name || row.Name || row.nombre || row.Nombre || '',
                 role: row.role || row.Role || row.cargo || row.Cargo || 'PREVENCIONISTA'
             })).filter(u => u.email);

             if(mappedUsers.length === 0) {
                 showToast("No se encontró una columna 'email' o 'correo' en el Excel.", 'error');
                 setLoading(false);
                 return;
             }

             const res = await fetch('/api/company/users/bulk', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ users: mappedUsers })
             });
             const resData = await res.json();

             if(res.ok) {
                 showToast(`¡Lote procesado! ${resData.added} anexados, ${resData.created} autogenerados.`);
                 fetchData();
             } else {
                 showToast(resData.error || "Error al subir lote", 'error');
             }
         } catch(e) {
             showToast("Error parseando el archivo Excel", 'error');
         } finally {
             setLoading(false);
             if(fileInputRef.current) fileInputRef.current.value = '';
         }
      };
      reader.readAsBinaryString(file);
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Toast Flotante Premium */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success' ? 'bg-indigo-900 border border-indigo-700 text-white' : 'bg-red-900 border border-red-700 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-indigo-300" /> : <AlertCircle className="w-5 h-5 text-red-300" />}
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Luces sutiles corporativas */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto z-10 relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Panel Integrador <span className="text-indigo-600">Corporativo</span></h1>
              <p className="text-sm text-slate-500 font-medium">Arquitectura Multi-Empresa ENTERPRISE</p>
            </div>
          </div>
          <Link href="/">
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-all shadow-sm active:scale-95">
                <Home className="w-4 h-4 text-slate-400" /> Volver a MiperAI
              </button>
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Branding Sidebar */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-max">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                    <Settings2 className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-slate-800">Identidad Digital</h2>
                </div>
                <form onSubmit={handleUpdateCompany} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Empresa / Razón Social</label>
                        <input type="text" value={company?.name || ''} onChange={(e)=>setCompany({...company, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all" required/>
                    </div>
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">RUT Empresa</label>
                        <input type="text" value={company?.rut || ''} onChange={(e)=>setCompany({...company, rut: formatRUT(e.target.value)})} maxLength={12} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all" placeholder="Ej: 76.123.456-7"/>
                    </div>
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Dirección Matriz</label>
                        <input type="text" value={company?.address || ''} onChange={(e)=>setCompany({...company, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"/>
                    </div>
                    <div className="pt-2 border-t border-slate-100 mt-2">
                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Responsable HSEC (Nombre)</label>
                        <input type="text" value={company?.adminContactName || ''} onChange={(e)=>setCompany({...company, adminContactName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"/>
                    </div>
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Soporte Corporativo (Correo/Teléfono)</label>
                        <input type="text" value={company?.adminContactEmail || ''} onChange={(e)=>setCompany({...company, adminContactEmail: e.target.value})} placeholder="Soporte interno de la minera..." className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"/>
                    </div>

                    <button type="submit" disabled={savingCompany} className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold px-4 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        {savingCompany ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />} Guardar Estandarización
                    </button>
                </form>
            </div>

            {/* Operarios */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
                    <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row items-end gap-3 rounded-2xl">
                        <div className="flex-1 w-full pl-3">
                           <label className="block text-xs font-extrabold text-slate-800 uppercase mb-2 tracking-wider">Despliegue General</label>
                           <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email para enrolar manual..." className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none shadow-sm transition-all"/>
                           <p className="text-[10px] text-slate-400 font-medium mt-2">Puedes añadir uno por uno o usar carga masiva (*.xlsx).</p>
                        </div>
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                           <button type="submit" className="w-full sm:w-auto bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md flex items-center justify-center gap-2">
                              <UserPlus className="w-5 h-5"/> Enrolar
                           </button>
                           
                           <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleExcelUpload} className="hidden" />
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2">
                              <FileSpreadsheet className="w-5 h-5"/> Lote (Excel)
                           </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-bold text-slate-800">Cuerpo Operativo ({users.length})</h2>
                    </div>

                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-200 text-[10px] uppercase tracking-widest font-extrabold text-slate-500">
                                <th className="p-3">Trabajador & Correo</th>
                                <th className="p-3">Cargo Real</th>
                                <th className="p-3 text-center bg-blue-50/50 rounded-t-lg border-x border-slate-100">Crear Matrices IA</th>
                                <th className="p-3 text-center bg-orange-50/50 rounded-t-lg">Hacer Inspecciones</th>
                                <th className="p-3 text-center">Baja</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                           <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{u.name || 'Contratista S.N'}</span>
                                           <span className="text-xs text-slate-400 font-medium">{u.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="relative group inline-block w-full">
                                           <select 
                                               value={u.role} 
                                               disabled={processingId === u.id}
                                               onChange={(e) => handeUpdateUser(u.id, {role: e.target.value})}
                                               className="appearance-none w-full bg-slate-100 border border-slate-200 focus:border-indigo-400 text-xs font-bold px-3 py-2 pr-8 rounded-lg text-slate-700 outline-none cursor-pointer hover:bg-slate-200 transition-all shadow-sm"
                                           >
                                               <option value="USER">Pase Visitante</option>
                                               <option value="OPERADOR">Operador de Piso</option>
                                               <option value="SUPERVISOR">Supervisor</option>
                                               <option value="PREVENCIONISTA">Prevencionista</option>
                                           </select>
                                           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                           </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center bg-blue-50/20 border-x border-slate-100">
                                        <label className="relative inline-flex items-center cursor-pointer" title="Autorizar tokens PxS">
                                            <input type="checkbox" disabled={processingId === u.id} checked={u.canCreateMatrices} className="sr-only peer" onChange={(e) => handeUpdateUser(u.id, {canCreateMatrices: e.target.checked})} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                                        </label>
                                    </td>
                                    <td className="p-4 text-center bg-orange-50/20">
                                        <label className="relative inline-flex items-center cursor-pointer" title="Autorizar dictado móvil">
                                            <input type="checkbox" disabled={processingId === u.id} checked={u.canCreateInspections} className="sr-only peer" onChange={(e) => handeUpdateUser(u.id, {canCreateInspections: e.target.checked})} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 shadow-inner"></div>
                                        </label>
                                    </td>
                                    <td className="p-4 text-center">
                                         <button 
                                            onClick={() => handleRemoveUser(u.id)} 
                                            disabled={processingId === u.id}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Desvincular de Empresa"
                                         >
                                            {processingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-5 h-5"/>}
                                         </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                               <tr>
                                   <td colSpan={5} className="p-8 text-center text-slate-400 font-medium text-sm">
                                       No hay personal enrolado aún. Escribe el correo de un operario arriba.
                                   </td>
                               </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
