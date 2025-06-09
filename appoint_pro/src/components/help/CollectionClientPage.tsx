'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
}

interface CollectionClientPageProps {
  locale: string;
  type: 'customer' | 'business';
  collectionSlug: string;
  articles: ArticleMeta[];
}

export default function CollectionClientPage({ locale, type, collectionSlug, articles }: CollectionClientPageProps) {
  const t = useTranslations('Help');

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href={`/${locale}/help/${type}`} className="hover:underline">
          {t('allCollections')}
        </Link>
        <span className="mx-2">›</span>
        <span className="font-medium text-gray-700">{collectionSlug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
      </nav>

      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        {collectionSlug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </h1>
      <p className="text-gray-600 mb-8">{t('articlesInCollection', { count: articles.length })}</p>

      <div className="grid gap-4">
        {articles.map((article) => (
          <Card key={article.slug} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <Link href={`/${locale}/help/${type}/${collectionSlug}/${article.slug}`} className="text-lg font-semibold text-blue-600 hover:underline">
                  {article.title}
                </Link>
                <p className="text-gray-600 text-sm mt-1">{article.description}</p>
              </div>
              <ChevronRight className="text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 