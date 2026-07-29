import { getCategoriesAction } from '@/lib/actions/category-actions';
import { CategoriesView } from '@/components/categories/CategoriesView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Categories — Rupiyo',
  description: 'Manage income and expense categories for budget enforcement and analytics.',
};

export default async function CategoriesPage() {
  const result = await getCategoriesAction();
  const categories = result.data || [];

  return (
    <div className="p-6 lg:p-8">
      <CategoriesView initialCategories={categories} />
    </div>
  );
}
