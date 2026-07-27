'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, Lock, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'umat'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/kegiatan');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      <Link 
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white text-sm transition"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl gradient-amber items-center justify-center text-slate-950 text-2xl font-bold mb-2">
            🪷
          </div>
          <h2 className="text-2xl font-bold text-white">Login Sistem Vihara</h2>
          <p className="text-xs text-slate-400">Pilih role portal untuk mengakses fitur</p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition ${
              role === 'admin' 
                ? 'bg-amber-500 text-slate-950 shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Portal Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('umat')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition ${
              role === 'umat' 
                ? 'bg-emerald-500 text-slate-950 shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck size={16} />
            <span>Portal Umat</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Alamat Email / HAN</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'admin' ? 'admin@vihara.or.id' : 'umat@vihara.or.id'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0" defaultChecked />
              <span>Ingat saya</span>
            </label>
            <a href="#" className="hover:text-amber-400 transition">Lupa password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-sm text-slate-950 transition flex items-center justify-center gap-2 shadow-lg ${
              role === 'admin' 
                ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
            }`}
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>Masuk ke {role === 'admin' ? 'Portal Admin' : 'Portal Umat'}</span>
                <CheckCircle2 size={16} />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
          <p>Terintegrasi dengan Supabase Auth & Row Level Security (RLS)</p>
        </div>
      </div>
    </div>
  );
}
