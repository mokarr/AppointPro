import HelpClientPage from '@/components/help/HelpClientPage';

interface HelpPageProps {
  params: Promise<{
    locale: string;
    type: 'customer' | 'business';
  }>;
}

export default async function HelpPage({ params }: HelpPageProps) {
  const { locale, type } = await params;
  
  return <HelpClientPage locale={locale} type={type} />;
} 