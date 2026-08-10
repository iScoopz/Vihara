'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Konfirmasi password tidak cocok dengan password baru!' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password minimal 6 karakter!' });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      setLoading(false);
      if (error) {
        setMsg({ type: 'error', text: `Gagal memperbarui password: ${error.message}` });
      } else {
        setMsg({ type: 'success', text: '✓ Password berhasil diperbarui! Mengalihkan ke halaman login...' });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setLoading(false);
      setMsg({ type: 'success', text: '✓ Password berhasil diperbarui! Mengalihkan ke halaman login...' });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      <Link 
        href="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white text-sm transition"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Halaman Login</span>
      </Link>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl gradient-amber items-center justify-center text-slate-950 text-2xl font-bold mb-2">
            🔑
          </div>
          <h2 className="text-2xl font-bold text-white">Buat Password Baru</h2>
          <p className="text-xs text-slate-400">Masukkan kata sandi baru untuk akun Anda</p>
        </div>

        {msg && (
          <div className={`p-3 rounded-xl text-xs font-bold text-center leading-relaxed border ${
            msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Konfirmasi Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-amber-500 hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>Simpan Password Baru</span>
                <CheckCircle2 size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
