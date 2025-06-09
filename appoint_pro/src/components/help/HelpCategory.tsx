import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface HelpCategoryProps {
  title: string;
  href: string;
  icon: LucideIcon;
}

export default function HelpCategory({ title, icon: Icon, href }: HelpCategoryProps) {
  return (
    <Link href={href} className="block h-full">
      <Card className="flex flex-col items-center justify-center p-6 text-center h-full transition-all hover:shadow-lg hover:border-blue-500 border-2 border-gray-200 rounded-lg">
        <div className="p-3 mb-4 rounded-full bg-blue-100 text-blue-600">
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </Card>
    </Link>
  );
} 