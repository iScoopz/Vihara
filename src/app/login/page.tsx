'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { Button, Field, Modal, ModalActions, Panel, inputClass } from '@/components/ui/kit';

import { createClient } from '@/lib/supabase/client';
import { getCurrentSession } from '@/lib/actions/vihara-actions';

// Supabase Auth messages translated for umat and pengurus.
function loginErrorMessage(message: string) {
  if (/invalid login credentials/i.test(message)) return 'Email atau kata sandi salah.';
  if (/email not confirmed/i.test(message)) return 'Email belum dikonfirmasi. Buka tautan konfirmasi di kotak masuk email Anda.';
  if (/rate limit|too many/i.test(message)) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
  return 'Belum bisa masuk. Periksa koneksi lalu coba lagi.';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetStatusMsg, setResetStatusMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const closeForgotModal = () => {
    setIsForgotModalOpen(false);
    setResetStatusMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) {
        setErrorMessage(loginErrorMessage(error.message));
        return;
      }

      // The server links the account to its umat/pengurus profile and decides where to go.
      const session = await getCurrentSession();
      if (!session.profile) {
        await supabase.auth.signOut();
        setErrorMessage('Akun ini belum terhubung dengan data umat. Minta pengurus mengisi email Anda di Data Umat.');
        return;
      }
      router.replace(session.isAdmin ? '/dashboard' : '/profil');
    } catch {
      setErrorMessage('Belum bisa masuk. Periksa koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setResetLoading(true);
    setResetStatusMsg('');

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${origin}/login/reset-password`
      });

      setResetLoading(false);
      if (error) {
        setResetStatusMsg(`Tautan belum terkirim: ${error.message}`);
      } else {
        setResetStatusMsg(`Tautan sudah dikirim ke ${forgotEmail}. Periksa kotak masuk Anda.`);
      }
    } catch {
      setResetLoading(false);
      setResetStatusMsg('Tautan belum terkirim. Periksa koneksi lalu coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col lg:flex-row">
      {/* Aubergine identity panel: a band on phones, a full column on wide screens. */}
      <aside className="bg-nav text-nav-ink lg:w-[44%] lg:min-h-screen flex flex-col">
        <div className="h-16 px-2 sm:px-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-sm text-nav-ink-2 hover:text-nav-ink hover:bg-nav-active"
          >
            <ArrowLeft size={16} aria-hidden />
            <span>Beranda</span>
          </Link>
          <ThemeToggle tone="nav" />
        </div>
        <div className="px-6 sm:px-10 pt-4 pb-14 lg:pb-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center space-y-4 max-w-lg">
          <span className="w-11 h-11 rounded-lg bg-gold-line text-nav flex items-center justify-center font-display font-bold" aria-hidden>
            MN
          </span>
          <p className="font-display text-3xl lg:text-4xl leading-tight font-semibold">Vihara MNSBDI Sentra Makassar</p>
          <p className="text-sm lg:text-base text-nav-ink-2">
            Sistem informasi untuk pengurus dan umat: data umat, kegiatan, pendaftaran, dana paramita, dan inventaris.
          </p>
        </div>
      </aside>

      <main className="flex-1 flex items-start lg:items-center justify-center px-4 pb-10 -mt-8 lg:mt-0 lg:py-10">
        <Panel raised className="w-full max-w-sm p-6 sm:p-7 space-y-5">
          <div className="space-y-2">
            <span className="block w-8 h-[3px] rounded-full bg-gold-line" aria-hidden />
            <h1 className="text-3xl font-semibold text-ink">Masuk</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                required
                autoComplete="username"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className={inputClass}
              />
            </Field>

            <Field label="Kata sandi">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="flex items-center justify-between gap-2 text-sm">
              <Link href="/login/aktivasi" className="inline-flex items-center min-h-[44px] sm:min-h-0 font-medium text-brand hover:underline">
                Aktifkan akun
              </Link>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="min-h-[44px] sm:min-h-0 px-1 rounded-md font-medium text-brand hover:underline cursor-pointer"
              >
                Lupa kata sandi?
              </button>
            </div>

            {errorMessage && (
              <p role="alert" className="text-sm text-danger">
                {errorMessage}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? 'Memeriksa...' : 'Masuk'}
            </Button>
          </form>

          <p className="text-xs text-ink-3 border-t border-line pt-4">
            Pengurus dan umat masuk dengan email yang terdaftar di Data Umat. Belum pernah masuk? Pilih <span className="font-medium text-ink-2">Aktifkan akun</span> untuk membuat kata sandi.
          </p>
        </Panel>
      </main>

      <Modal open={isForgotModalOpen} onClose={closeForgotModal} title="Atur ulang kata sandi" size="sm">
        <form onSubmit={handleSendResetEmail} className="space-y-4">
          <p className="text-sm text-ink-2">
            Masukkan email yang terdaftar di Vihara MNSBDI. Kami kirim tautan untuk membuat kata sandi baru.
          </p>

          <Field label="Email terdaftar">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="umat@vihara.or.id"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className={inputClass}
            />
          </Field>

          {resetStatusMsg && (
            <p role="status" className="text-sm text-ink-2 bg-surface-2 rounded-lg p-3">
              {resetStatusMsg}
            </p>
          )}

          <ModalActions>
            <Button variant="neutral" onClick={closeForgotModal}>Batal</Button>
            <Button type="submit" variant="primary" disabled={resetLoading}>
              {resetLoading ? 'Mengirim...' : 'Kirim tautan'}
            </Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  );
}
