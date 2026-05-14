import { ListPageSkeleton } from '@/components/common/EmptyState'

export default function InvoicesLoading() {
  return <ListPageSkeleton rows={6} columns={6} />
}
