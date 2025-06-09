import HelpLayout from '@/components/help/HelpLayout';
import ContactForm from '@/components/help/ContactForm';

interface ContactPageProps {
  params: Promise<{
    type: 'customer' | 'business';
  }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { type } = await params;
  return (
    <HelpLayout type={type}>
      <ContactForm />
    </HelpLayout>
  );
} 