import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/[locale]/globals.css";
import Layout from "@/components/Layout";
import Providers from "@/components/Providers";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ServerLayout from "@/components/ServerLayout";

const inter = Inter({ subsets: ['latin'], display: 'swap', adjustFontFallback: false })

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "AppointPro",
  description: "Efficient appointment scheduling for professionals",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }


  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale}>
          <Providers>
            <ServerLayout>
              {children}
            </ServerLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
