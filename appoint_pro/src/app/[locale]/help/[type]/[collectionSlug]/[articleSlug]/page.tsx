import { evaluate } from 'next-mdx-remote-client/rsc';
import { readFileSync } from 'fs';
import { join } from 'path';
import HelpLayout from '@/components/help/HelpLayout';
import MDXContent from '@/components/help/MDXContent';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import rehypeSlug from 'rehype-slug';
import { Node } from 'unist';
import { readdirSync } from 'fs';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface ArticlePageProps {
  params: Promise<{
    type: 'customer' | 'business';
    collectionSlug: string;
    articleSlug: string;
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { type, collectionSlug, articleSlug } = await params;
  const filePath = join(process.cwd(), 'src', 'content', 'help', collectionSlug, `${articleSlug}.mdx`);
  const source = readFileSync(filePath, 'utf8');

  const headings: Heading[] = [];

  const tree = remark()
    .use(() => (tree: Node) => {
      visit(tree, 'heading', (node: any) => {
        const text = toString(node);
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-*|-*$/g, '');
        headings.push({ level: node.depth, text, id });
      });
    })
    .parse(source);

  const { content, frontmatter, error } = await evaluate({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [rehypeSlug],
      },
    },
  });

  if (error) {
    console.error("MDX evaluation error:", error);
    return <div>Error loading content.</div>;
  }

  const frontmatterTitleId = (frontmatter.title as string || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-*|-*$/g, '');

  const filteredHeadings = headings.filter(
    (h) => h.level > 1 || (h.level === 1 && h.id !== frontmatterTitleId)
  );

  return (
    <HelpLayout type={type}>
      <MDXContent 
        frontmatter={frontmatter as any}
        headings={filteredHeadings}
      >
        {content}
      </MDXContent>
    </HelpLayout>
  );
}

export async function generateStaticParams() {
  const collectionsPath = join(process.cwd(), 'src', 'content', 'help');
  const collectionFolders = readdirSync(collectionsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let params: { type: string; collectionSlug: string; articleSlug: string }[] = [];

  for (const collectionSlug of collectionFolders) {
    const articlesPath = join(collectionsPath, collectionSlug);
    const articleFiles = readdirSync(articlesPath)
      .filter(file => file.endsWith('.mdx'));

    for (const file of articleFiles) {
      const articleSlug = file.replace(/\.mdx$/, '');
      params.push({ type: 'customer', collectionSlug, articleSlug });
      params.push({ type: 'business', collectionSlug, articleSlug });
    }
  }

  return params;
} 