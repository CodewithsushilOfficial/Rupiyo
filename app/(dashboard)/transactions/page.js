import { getTransactionsAction } from '@/lib/actions/transaction-actions';
import { getAccountsAction } from '@/lib/actions/account-actions';
import { getCategoriesAction } from '@/lib/actions/category-actions';
import { TransactionsView } from '@/components/transactions/TransactionsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Transaction Ledger — Rupiyo',
  description: 'View, filter, search, and manage multi-account financial transactions.',
};

export default async function TransactionsPage({ searchParams }) {
  const params = await searchParams;

  const filters = {
    page: parseInt(params?.page || '1', 10),
    limit: parseInt(params?.pageSize || '25', 10),
    type: params?.type || 'ALL',
    accountId: params?.account || 'ALL',
    categoryId: params?.category || 'ALL',
    paymentMethod: params?.paymentMethod || 'ALL',
    startDate: params?.from || '',
    endDate: params?.to || '',
    search: params?.search || '',
    sort: params?.sort || 'date_desc',
  };

  const [txnsResult, accountsResult, categoriesResult] = await Promise.all([
    getTransactionsAction(filters),
    getAccountsAction(),
    getCategoriesAction(),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <TransactionsView
        initialData={txnsResult}
        accounts={accountsResult.data || []}
        categories={categoriesResult.data || []}
        currentFilters={filters}
      />
    </div>
  );
}
