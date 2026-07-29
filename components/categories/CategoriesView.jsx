"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { archiveCategoryAction } from '@/lib/actions/category-actions';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function CategoriesView({ initialCategories = [] }) {
  const router = useRouter();
  const [categories, setCategories] = React.useState(initialCategories);
  const [prevCategories, setPrevCategories] = React.useState(initialCategories);
  const [activeTab, setActiveTab] = React.useState('ALL');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  if (prevCategories !== initialCategories) {
    setPrevCategories(initialCategories);
    setCategories(initialCategories);
  }

  const handleArchive = async (categoryId) => {
    if (confirm('Are you sure you want to archive this custom category?')) {
      const res = await archiveCategoryAction(categoryId);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        router.refresh();
      }
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (activeTab === 'EXPENSE') return c.type === 'EXPENSE';
    if (activeTab === 'INCOME') return c.type === 'INCOME';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Categories & Classifications
          </h1>
          <p className="text-sm text-muted-foreground">
            System defaults and custom expense/income tags.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {['ALL', 'EXPENSE', 'INCOME'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-control px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
              activeTab === tab
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <CategoryCard key={category.id} category={category} onArchive={handleArchive} />
        ))}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
