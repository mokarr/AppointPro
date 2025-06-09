'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface MDXContentProps {
  source?: any;
  frontmatter: {
    title: string;
    description?: string;
    toc?: boolean;
  };
  headings: Heading[];
  children: React.ReactNode;
}

export default function MDXContent({ frontmatter, headings, children }: MDXContentProps) {
  const t = useTranslations('Help');

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 py-8">
      {/* Main Content */}
      <div className="flex-1 order-2 lg:order-1">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">{frontmatter.title}</h1>
        {frontmatter.description && (
          <p className="text-lg text-gray-600 mb-8">{frontmatter.description}</p>
        )}
        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-800 prose-a:text-blue-600 prose-a:underline hover:prose-a:no-underline">
          {children}
        </div>
      </div>

      {/* Table of Contents */}
      {frontmatter.toc && headings.length > 0 && (
        <div className="w-full lg:w-64 shrink-0 order-1 lg:order-2">
          <Card className="p-6 sticky top-20 border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">{t('tableOfContents')}</h2>
            <nav className="space-y-2">
              {headings.map((heading) => (
                <Link
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={`block text-gray-600 hover:text-blue-600 ${heading.level === 2 ? 'ml-0 font-medium' : 'ml-4 text-sm'}`}
                >
                  {heading.text}
                </Link>
              ))}
            </nav>
          </Card>
        </div>
      )}
    </div>
  );
} 