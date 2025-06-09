'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactForm() {
  const t = useTranslations('Help.Contact.form');

  return (
    <form className="space-y-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('title')}</h2>
      <div>
        <Input id="name" type="text" placeholder={t('name')} className="py-3 px-4 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" required />
      </div>
      <div>
        <Input id="email" type="email" placeholder={t('email')} className="py-3 px-4 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" required />
      </div>
      <div>
        <Textarea id="message" rows={5} placeholder={t('message')} className="py-3 px-4 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none" required />
      </div>
      <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-md transition-colors">
        {t('submit')}
      </Button>
    </form>
  );
} 