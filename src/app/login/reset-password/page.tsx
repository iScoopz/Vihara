'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ui/theme-toggle';
import { Button, Field, Panel, inputClass } from '@/components/ui/kit';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Konfirmasi kata sandi tidak sama dengan kata sandi baru.' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Kata sandi minimal 6 karakter.' });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      setLoading(false);
      if (error) {
        setMsg({ type: 'error', text: `Kata sandi belum diperbarui: ${error.message}` });
      } else {
        setMsg({ type: 'success', text: 'Kata sandi sudah diperbarui. Mengalihkan ke halaman masuk...' });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch {
      setLoading(false);
      setMsg({ type: 'error', text: 'Kata sandi belum diperbarui. Periksa koneksi lalu coba lagi.' });
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <header className="h-14 px-2 sm:px-4 flex items-center justify-between">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-sm text-ink-2 hover:text-ink hover:bg-surface-2"
        >
          <ArrowLeft size={16} aria-hidden />
          <span>Halaman masuk</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-4 pb-10 pt-4">
        <Panel className="w-full max-w-sm p-6 space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-ink">Buat kata sandi baru</h1>
            <p className="text-sm text-ink-2">Kata sandi ini dipakai untuk masuk berikutnya.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Field label="Kata sandi baru" hint="Minimal 6 karakter">
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Ulangi kata sandi baru">
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </Field>

            {msg && (
              <p
                role={msg.type === 'error' ? 'alert' : 'status'}
                className={`text-sm rounded-lg p-3 ${msg.type === 'success' ? 'bg-ok-soft text-ok' : 'bg-danger-soft text-danger'}`}
              >
                {msg.text}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? 'Menyimpan...' : 'Simpan kata sandi'}
            </Button>
          </form>
        </Panel>
      </main>
    </div>
  );
}
