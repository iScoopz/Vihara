'use client'

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MailCheck } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { Button, Field, Panel, buttonClass, inputClass } from '@/components/ui/kit';
import { createClient } from '@/lib/supabase/client';

const MIN_PASSWORD = 8;

// First-time setup for pengurus and umat whose email is already in Data Umat.
// Supabase sends a confirmation email; the account is linked to the profile on first sign-in.
export default function AktivasiPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < MIN_PASSWORD) {
      setError(`Kata sandi minimal ${MIN_PASSWORD} karakter.`);
      return;
    }
    if (password !== confirm) {
      setError('Kedua kata sandi belum sama.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error: signUpError } = await createClient().auth.signUp({
        email: cleanEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/login` }
      });
      if (signUpError) {
        setError(
          /rate limit|too many/i.test(signUpError.message)
            ? 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.'
            : /password/i.test(signUpError.message)
              ? 'Kata sandi terlalu lemah. Gabungkan huruf dan angka.'
              : 'Aktivasi belum berhasil. Periksa email lalu coba lagi.'
        );
        return;
      }
      setSentTo(cleanEmail);
    } catch {
      setError('Aktivasi belum berhasil. Periksa koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
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
        <Panel raised className="w-full max-w-sm p-6 sm:p-7 space-y-5">
          {sentTo ? (
            <div className="space-y-4" role="status">
              <span className="w-12 h-12 rounded-xl bg-ok-soft text-ok flex items-center justify-center" aria-hidden>
                <MailCheck size={22} />
              </span>
              <h1 className="text-[28px] leading-tight font-semibold">Cek email Anda</h1>
              <p className="text-sm text-ink-2">
                Kami mengirim tautan konfirmasi ke <span className="font-medium text-ink break-all">{sentTo}</span>. Buka tautan itu, lalu masuk dengan email dan kata sandi yang baru dibuat.
              </p>
              <p className="text-xs text-ink-3">
                Tidak menerima email dalam beberapa menit? Periksa folder spam. Kalau email Anda belum terdaftar di Data Umat, minta pengurus menambahkannya dulu.
              </p>
              <Link href="/login" className={`${buttonClass('primary')} w-full`}>
                Ke halaman masuk
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <span className="block w-8 h-[3px] rounded-full bg-gold-line" aria-hidden />
                <h1 className="text-[28px] leading-tight font-semibold">Aktifkan akun</h1>
                <p className="text-sm text-ink-2">
                  Untuk pengurus dan umat yang emailnya sudah terdaftar di Data Umat. Buat kata sandi untuk masuk.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Email terdaftar">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className={inputClass}
                  />
                </Field>
                <Field label="Kata sandi baru" hint={`Minimal ${MIN_PASSWORD} karakter`}>
                  <input
                    type="password"
                    required
                    minLength={MIN_PASSWORD}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Ulangi kata sandi">
                  <input
                    type="password"
                    required
                    minLength={MIN_PASSWORD}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                {error && <p role="alert" className="text-sm text-danger">{error}</p>}

                <Button type="submit" variant="primary" disabled={loading} className="w-full">
                  {loading ? 'Mengirim...' : 'Aktifkan akun'}
                </Button>
              </form>
            </>
          )}
        </Panel>
      </main>
    </div>
  );
}
