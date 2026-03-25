import { useEffect } from 'react'
import { Artwork } from '@/services/artworkService'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { ArtworkCard, type ArtworkCardProps } from '@/components/artwork/ArtworkCard'
import { Grid } from '@/components/layout/Grid'
import { LoadingCard } from '@/components/ui/Loading'
import { EmptyState } from './EmptyState'
import { Pagination, PaginationInfo } from '@/components/ui/Pagination'

interface ArtworkGridProps {
  artworks: Artwork[]
  isLoading: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onPurchase?: (artwork: Artwork) => void
  onView?: (artwork: Artwork) => void
  onClearFilters?: () => void
  hasFilters?: boolean
  cardVariant?: ArtworkCardProps['variant']
  showPrice?: boolean
  showCreator?: boolean
  loadingCount?: number
  // Pagination props
  currentPage?: number
  totalPages?: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void
  usePagination?: boolean
}

export function ArtworkGrid({
  artworks,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onPurchase,
  onView,
  onClearFilters,
  hasFilters = false,
  cardVariant = 'default',
  showPrice = true,
  showCreator = false,
  loadingCount = 8,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 20,
  onPageChange,
  usePagination = false
}: ArtworkGridProps) {
  const loadMoreRef = useIntersectionObserver({
    onIntersect: onLoadMore,
    enabled: !usePagination && hasNextPage && !isFetchingNextPage,
    rootMargin: '200px',
  })

  // Show skeleton on initial load
  if (isLoading && artworks.length === 0) {
    return <LoadingCard count={loadingCount} variant="artwork" />
  }

  // Show empty state when no artworks
  if (!isLoading && artworks.length === 0) {
    return (
      <EmptyState
        type={hasFilters ? 'no-results' : 'no-artworks'}
        onClearFilters={onClearFilters}
      />
    )
  }

  return (
    <>
      {/* Pagination Info */}
      {usePagination && totalItems > 0 && (
        <PaginationInfo
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}

      <Grid responsive gap="md">
        {artworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            variant={cardVariant}
            onPurchase={onPurchase}
            onView={onView}
            showPrice={showPrice}
            showCreator={showCreator}
          />
        ))}
      </Grid>

      {/* Loading indicator for infinite scroll */}
      {!usePagination && isFetchingNextPage && <LoadingCard count={4} variant="artwork" />}

      {/* Intersection observer target for infinite scroll */}
      {!usePagination && hasNextPage && !isFetchingNextPage && (
        <div ref={loadMoreRef} className="w-full h-4" />
      )}

      {/* End of results message for infinite scroll */}
      {!usePagination && !hasNextPage && !isLoading && artworks.length > 0 && (
        <div className="text-center py-8 text-secondary-600 text-mobile-sm">
          You've reached the end of the collection
        </div>
      )}

      {/* Pagination Controls */}
      {usePagination && totalPages > 1 && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      )}
    </>
  )
}
