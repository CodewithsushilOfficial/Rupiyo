"use client";

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createCategoryAction } from '@/lib/actions/category-actions';
import { cn } from '@/lib/utils/cn';

const ICON_OPTIONS = [
  'Tag',
  'Utensils',
  'ShoppingBag',
  'Car',
  'Home',
  'Zap',
  'Tv',
  'Activity',
  'BookOpen',
  'Plane',
  'Briefcase',
  'Laptop',
  'TrendingUp',
  'Gift',
  'Coffee',
  'Film',
  'HeartPulse',
  'Smartphone',
];

const COLOR_OPTIONS = [
  '#6759E8',
  '#22B573',
  '#F05B78',
  '#548AF7',
  '#F5A524',
  '#9B91F5',
  '#35C486',
  '#F06B86',
  '#EC6DAD',
  '#626276',
];

export function CategoryModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = React.useState({
    name: '',
    type: 'EXPENSE',
    iconName: 'Tag',
    colorHex: '#6759E8',
  });
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setFormData({
        name: '',
        type: 'EXPENSE',
        iconName: 'Tag',
        colorHex: '#6759E8',
      });
      setErrorMsg('');
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Category name is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await createCategoryAction(formData);
      if (!res.success) {
        throw new Error(res.error);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('[CATEGORY_MODAL_ERROR]:', err);
      setErrorMsg(err.message || 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Category"
      description="Add a personalized expense or income category with icon and color."
    >
      {errorMsg && (
        <div className="mb-4 rounded-control border border-expense-border bg-expense-soft p-3 text-xs font-semibold text-expense">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Category Name
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Pet Care, Gaming, Side Hustle"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Category Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
              className={cn(
                'rounded-control border p-2.5 text-xs font-bold transition-all cursor-pointer',
                formData.type === 'EXPENSE'
                  ? 'border-expense-border bg-expense-soft text-expense'
                  : 'border-input bg-card text-muted-foreground hover:bg-muted'
              )}
            >
              EXPENSE
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'INCOME' })}
              className={cn(
                'rounded-control border p-2.5 text-xs font-bold transition-all cursor-pointer',
                formData.type === 'INCOME'
                  ? 'border-income-border bg-income-soft text-income'
                  : 'border-input bg-card text-muted-foreground hover:bg-muted'
              )}
            >
              INCOME
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Icon
          </label>
          <select
            name="iconName"
            value={formData.iconName}
            onChange={handleChange}
            className="w-full rounded-control border border-input bg-card text-foreground p-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            {ICON_OPTIONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Color Accent
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, colorHex: color })}
                className={cn(
                  'h-7 w-7 rounded-full transition-transform cursor-pointer',
                  formData.colorHex === color ? 'scale-110 ring-2 ring-primary ring-offset-2' : ''
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
