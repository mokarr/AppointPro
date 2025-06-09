'use client';

import { HelpCircle, Calendar, Settings, Users, FileText, MessageSquare } from 'lucide-react';
import HelpLayout from '@/components/help/HelpLayout';
import HelpCategory from '@/components/help/HelpCategory';
import ContactForm from '@/components/help/ContactForm';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface HelpClientPageProps {
  locale: string;
  type: 'customer' | 'business';
}

export default function HelpClientPage({ locale, type }: HelpClientPageProps) {
  const t = useTranslations('Help');
  const tContact = useTranslations('Help.Contact');

  const categories = [
    {
      title: t('gettingStarted.title'),
      icon: HelpCircle,
      href: `/${locale}/help/${type}/getting-started`,
    },
    {
      title: t('appointments.title'),
      icon: Calendar,
      href: `/${locale}/help/${type}/appointments`,
    },
    {
      title: t('account.title'),
      icon: Settings,
      href: `/${locale}/help/${type}/account`,
    },
    {
      title: t('team.title'),
      icon: Users,
      href: `/${locale}/help/${type}/team`,
    },
    {
      title: t('documents.title'),
      icon: FileText,
      href: `/${locale}/help/${type}/documents`,
    },
    {
      title: t('support.title'),
      icon: MessageSquare,
      href: `/${locale}/help/${type}/support`,
    },
  ];

  return (
    <HelpLayout type={type}>
      {/* Find an Answer Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">{t('findAnswer')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <HelpCategory key={category.href} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-white rounded-lg shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 p-8">
          {/* Contact Information Text */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">{tContact('askTeam.title')}</h2>
            <p className="text-gray-600 leading-relaxed">{tContact('askTeam.description')}</p>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">{tContact('contactInfo.email')}</h3>
              <p className="text-gray-600">support@appointpro.com</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">{tContact('contactInfo.phone')}</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">{tContact('contactInfo.hours')}</h3>
              <p className="text-gray-600">{tContact('contactInfo.hoursValue')}</p>
            </div>
            <div className="pt-4">
              <p className="text-gray-600 font-semibold mb-2">{tContact('holidays.title')}</p>
              <ul className="list-disc list-inside text-gray-600">
                <li>{tContact('holidays.newYearsDay')}</li>
                <li>{tContact('holidays.easter')}</li>
                <li>{tContact('holidays.kingsDay')}</li>
                <li>{tContact('holidays.ascensionDay')}</li>
                <li>{tContact('holidays.whitMonday')}</li>
                <li>{tContact('holidays.christmas')}</li>
              </ul>
            </div>
          </div>

          {/* Contact Form Component */}
          <div className="space-y-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </HelpLayout>
  );
} 