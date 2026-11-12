import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
    variable: "--font-noto-sans",
    subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "MobiBus",
  description: "Monitoramento e Gestão da frota de Ônibus",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${notoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
