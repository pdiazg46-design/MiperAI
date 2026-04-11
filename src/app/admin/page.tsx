'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users, Crown, Loader2, Home, Gift } from 'lucide-react';
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

  const grantProPlan = async (userId: string) => {
    if (!confirm("¿Regalar Plan PRO a este usuario?")) return;
    setProcessingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newTier: 'PRO' })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, subscriptionTier: 'PRO' } : u));
        alert("¡Plan PRO regalado con éxito!");
      } else {
        alert("Fallo al regalar plan.");
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
          <Link href="/wizard">
            <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-all shadow-xl">
              <Home className="w-4 h-4 text-zinc-400" /> Volver al Wizard
            </button>
          </Link>
        </header>

        <main className="bg-zinc-900/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 px-2">
            <Users className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-bold text-white">Directorio de Usuarios ({users.length})</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-black/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Plan Actual</th>
                  <th className="p-4">Uso (API / Matrices)</th>
                  <th className="p-4 text-right">Acciones Administrativas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white text-sm">{u.name || 'Sin Nombre'}</span>
                        <span className="text-xs text-zinc-500">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {u.role === 'ADMIN' ? (
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Root</span>
                      ) : (
                        <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase">User</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {u.subscriptionTier === 'PRO' || u.subscriptionTier === 'ENTERPRISE' ? (
                           <Crown className="w-4 h-4 text-yellow-500" />
                        ) : null}
                        <span className={`text-xs font-bold uppercase ${u.subscriptionTier === 'PRO' ? 'text-yellow-500' : 'text-zinc-400'}`}>
                          {u.subscriptionTier}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                        <span className="text-sm font-mono text-zinc-300">{u.queriesUsed || 0}</span>
                    </td>
                    <td className="p-4 text-right">
                      {u.subscriptionTier === 'FREE' && u.role !== 'ADMIN' && (
                        <button 
                          disabled={processingId === u.id}
                          onClick={() => grantProPlan(u.id)}
                          className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        >
                          {processingId === u.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Gift className="w-3 h-3" />}
                          Regalar PRO
                        </button>
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
