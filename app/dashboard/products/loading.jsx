import { ListPageSkeleton } from '@/components/common/EmptyState'

export default function ProductsLoading() {
  return <ListPageSkeleton rows={6} columns={5} />
}
