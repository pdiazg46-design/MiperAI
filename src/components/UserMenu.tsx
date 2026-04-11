'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, ShieldAlert, Crown, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) return null;

  return (
    <div className="fixed top-4 right-4 z-[999]">
      {/* Dropdown Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-full px-4 py-2 hover:bg-zinc-800 transition-all shadow-xl"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-zinc-200">
            {(session.user as any).name || (session.user as any).email?.split('@')[0]}
          </p>
          <div className="flex items-center gap-1">
            <p className="text-[10px] uppercase font-bold text-orange-400">
              {(session.user as any).subscriptionTier || 'FREE'}
            </p>
            {(session.user as any).role === 'ADMIN' && (
               <span className="text-[10px] uppercase font-extrabold text-blue-400">· STAFF</span>
            )}
          </div>
        </div>
      </button>

      {/* Flyout Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-2">
          
          <div className="px-3 py-3 border-b border-zinc-800/50 mb-2">
            <p className="text-sm font-medium text-white truncate">{(session.user as any).email}</p>
            <p className="text-xs text-zinc-400">Plan actual: {(session.user as any).subscriptionTier}</p>
          </div>

          {(session.user as any).role === 'ADMIN' && (
             <Link href="/admin">
               <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all font-semibold">
                 <ShieldAlert className="w-4 h-4" />
                 Panel de Control Admin
               </button>
             </Link>
          )}

          {(session.user as any).subscriptionTier === 'FREE' && (
             <Link href="/checkout">
                <button className="w-full mt-1 text-left flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-orange-400 hover:bg-orange-500/10 rounded-xl transition-all">
                  <Crown className="w-4 h-4" />
                  Upgrade a PRO
                </button>
             </Link>
          )}

          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full mt-1 text-left flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
