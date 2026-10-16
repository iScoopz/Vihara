type MaybeError = { message?: string; code?: string; status?: number } | null | undefined;

/** Supabase messages are English and technical; umat should read what to do next. */
export function friendlyAuthError(error: MaybeError) {
  const msg = (error?.message || '').toLowerCase();
  const code = (error?.code || '').toLowerCase();
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return 'Email atau kata sandi salah. Periksa lagi, atau pakai "Lupa kata sandi".';
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Buka tautan konfirmasi yang dikirim ke email Anda.';
  }
  if (code.includes('rate_limit') || error?.status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
    return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Tidak dapat terhubung. Periksa koneksi internet Anda.';
  }
  return 'Gagal masuk. Coba lagi sebentar lagi.';
}

export function friendlyDataError(error: MaybeError) {
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('network') || msg.includes('fetch')) return 'Tidak dapat terhubung. Periksa koneksi internet Anda.';
  if (msg.includes('permission') || msg.includes('row-level security') || error?.code === '42501') {
    return 'Akun Anda tidak memiliki izin untuk tindakan ini.';
  }
  return 'Data tidak dapat dimuat. Coba lagi sebentar lagi.';
}
