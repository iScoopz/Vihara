import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastNotification";

export const metadata: Metadata = {
  title: "Vihara MNSBDI Sentra Makassar",
  description: "Portal informasi dan kegiatan Majelis Nichiren Shoshu Buddha Dharma Indonesia (MNSBDI) Sentra Makassar.",
};

// Applies the saved theme before first paint so pages do not flash light-then-dark.
const themeScript = `try{var t=localStorage.getItem('vihara-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
