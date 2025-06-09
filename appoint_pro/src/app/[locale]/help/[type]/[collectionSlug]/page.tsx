import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import HelpLayout from '@/components/help/HelpLayout';
import CollectionClientPage from '@/components/help/CollectionClientPage';
import { evaluate } from 'next-mdx-remote-client/rsc';

interface CollectionPageProps {
  params: Promise<{
    locale: string;
    type: 'customer' | 'business';
    collectionSlug: string;
  }>;
}

interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { locale, type, collectionSlug } = await params;
  const collectionPath = join(process.cwd(), 'src', 'content', 'help', collectionSlug);
  let articles: ArticleMeta[] = [];

  try {
    console.log('collectionPath', collectionPath);
    const files = readdirSync(collectionPath);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));

    articles = await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = join(collectionPath, file);
        const source = readFileSync(filePath, 'utf8');
        const { frontmatter } = await evaluate({ source, options: { parseFrontmatter: true } });

        return {
          slug: file.replace(/\.mdx$/, ''),
          title: (frontmatter.title as string) || 'No Title',
          description: (frontmatter.description as string) || 'No Description',
        };
      })
    );

    articles.sort((a, b) => a.title.localeCompare(b.title));

  } catch (error) {
    console.error(`Error reading collection ${collectionSlug}:`, error);
    return (
      <HelpLayout type={type}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Error loading collection.</h2>
          <p className="text-gray-600 mt-2">Please try again later or contact support.</p>
        </div>
      </HelpLayout>
    );
  }

  return (
    <HelpLayout type={type}>
      <CollectionClientPage
        locale={locale}
        type={type}
        collectionSlug={collectionSlug}
        articles={articles}
      />
    </HelpLayout>
  );
} 