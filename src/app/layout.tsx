import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastNotification";

// Display serif for titles and key numbers: evokes printed paritta books, calm and formal.
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  axes: ["opsz"]
});

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
    <html lang="id" className={`${newsreader.variable} h-full antialiased`} suppressHydrationWarning>
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
