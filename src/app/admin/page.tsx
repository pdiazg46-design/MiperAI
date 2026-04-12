'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users, Crown, Loader2, Home, Gift, Zap, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any).role !== 'ADMIN') {
      router.push('/wizard');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const changeUserTier = async (userId: string, newTier: string) => {
    if (!confirm(`¿Actualizar el nivel de acceso a ${newTier}?`)) return;
    setProcessingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newTier })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, subscriptionTier: newTier } : u));
      } else {
        alert("Fallo al actualizar plan.");
      }
    } catch (e) {
      alert("Error de red.");
    } finally {
      setProcessingId(null);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`¿Actualizar el rol corporativo a ${newRole}?`)) return;
    setProcessingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert("Fallo al actualizar rol.");
      }
    } catch (e) {
      alert("Error de red.");
    } finally {
      setProcessingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Fondo Neon */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto z-10 relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <ShieldAlert className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Centro de Mando</h1>
              <p className="text-sm text-blue-400 font-medium">Acceso Restringido Súper Usuario</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Link href="/admin/architecture">
              <button className="flex items-center gap-2 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold px-5 py-2.5 rounded-full hover:bg-emerald-600/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                🗺️ Mapa de Arquitectura
              </button>
            </Link>
            <Link href="/checkout">
              <button className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 text-sm font-bold px-5 py-2.5 rounded-full hover:bg-blue-600/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                🔗 Ver Pasarela de Pagos
              </button>
            </Link>
            <Link href="/">
              <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-all shadow-xl">
                <Home className="w-4 h-4 text-zinc-400" /> Volver al Menú Principal
              </button>
            </Link>
          </div>
        </header>

        <main className="bg-zinc-900/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 px-2">
            <Users className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-bold text-white">Directorio de Usuarios ({users.length})</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-black/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-700 text-xs sm:text-sm uppercase tracking-widest font-extrabold text-zinc-300">
                  <th className="p-5">Usuario</th>
                  <th className="p-5">Rol</th>
                  <th className="p-5">Plan Actual</th>
                  <th className="p-5">Uso (API / Matrices)</th>
                  <th className="p-5 text-right">Acciones Administrativas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base">{u.name || 'Sin Nombre'}</span>
                        <span className="text-sm text-zinc-400 mt-1">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      {u.role === 'ADMIN' ? (
                        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black px-3 py-1.5 rounded-md uppercase tracking-wider">Root</span>
                      ) : (
                        <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">User</span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        {u.subscriptionTier === 'ENTERPRISE' && <Crown className="w-5 h-5 text-amber-500" />}
                        {u.subscriptionTier === 'PRO_ASESOR' && <Zap className="w-5 h-5 text-purple-500" />}
                        {u.subscriptionTier === 'PRO_OBRA' && <Briefcase className="w-5 h-5 text-blue-500" />}
                        {u.subscriptionTier === 'BASICO' && <ShieldAlert className="w-5 h-5 text-emerald-500" />}
                        <span className={`text-sm font-black uppercase tracking-wide 
                          ${u.subscriptionTier === 'ENTERPRISE' ? 'text-amber-400' : 
                            u.subscriptionTier === 'PRO_ASESOR' ? 'text-purple-400' : 
                            u.subscriptionTier === 'PRO_OBRA' ? 'text-blue-400' : 
                            u.subscriptionTier === 'BASICO' ? 'text-emerald-400' : 
                            'text-zinc-500'}`}>
                          {u.subscriptionTier?.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                        <span className="text-base font-mono font-bold text-zinc-200">{u.queriesUsed || 0}</span>
                    </td>
                    <td className="p-5 text-right">
                      {u.role !== 'ADMIN' && (
                        <div className="flex items-center justify-end gap-3">
                           {processingId === u.id && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                           
                           {/* Select de Plan Base */}
                           <div className="relative group inline-block">
                             <select
                                value={u.subscriptionTier}
                                disabled={processingId === u.id}
                                onChange={(e) => changeUserTier(u.id, e.target.value)}
                                className="appearance-none bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-500 text-xs font-bold px-3 py-2 pr-8 rounded-lg text-white outline-none transition-colors cursor-pointer disabled:opacity-50 min-w-[140px]"
                             >
                               <option value="FREE">Degradar a FREE</option>
                               <option value="BASICO">Ascender a BÁSICO</option>
                               <option value="PRO_OBRA">Ascender a PRO (Obra)</option>
                               <option value="PRO_ASESOR">Ascender a PRO (Asesor)</option>
                               <option value="ENTERPRISE">Ascender a EMPRESA</option>
                             </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                             </div>
                           </div>

                           {/* Select de Rol Operativo */}
                           <div className="relative group inline-block">
                             <select
                                value={u.role}
                                disabled={processingId === u.id}
                                onChange={(e) => changeUserRole(u.id, e.target.value)}
                                className="appearance-none bg-blue-900/30 border-2 border-blue-500/30 hover:border-blue-500/60 text-xs font-bold px-3 py-2 pr-8 rounded-lg text-blue-100 outline-none transition-colors cursor-pointer disabled:opacity-50 min-w-[140px]"
                             >
                               <option value="USER">Base (USER)</option>
                               <option value="OPERADOR">OPERADOR</option>
                               <option value="PREVENCIONISTA">PREVENCIONISTA</option>
                               <option value="SUPERVISOR">SUPERVISOR</option>
                             </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-500 group-hover:text-blue-300 transition-colors">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                             </div>
                           </div>

                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
