import React from 'react'
import { ArtworkCard, type Artwork } from '@/components/artwork/ArtworkCard'
import { Grid } from '@/components/layout/Grid'
import { LoadingCard } from '@/components/ui/Loading'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { useArtworkActions } from '@/hooks/useArtworkActions'

export interface ArtworkGalleryProps {
  artworks: Artwork[]
  isLoading?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  onPurchase?: (artwork: Artwork) => void
  onView?: (artwork: Artwork) => void
  onShare?: (artwork: Artwork) => void
  onFavorite?: (artwork: Artwork) => void
  onClearFilters?: () => void
  hasFilters?: boolean
  variant?: 'grid' | 'list' | 'masonry'
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  showPrice?: boolean
  showCreator?: boolean
  loadingCount?: number
  emptyStateType?: 'no-artworks' | 'no-results' | 'no-favorites'
  className?: string
}

export function ArtworkGallery({
  artworks,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onPurchase,
  onView,
  onShare,
  onFavorite,
  onClearFilters,
  hasFilters = false,
  variant = 'grid',
  columns,
  showPrice = true,
  showCreator = false,
  loadingCount = 8,
  emptyStateType = hasFilters ? 'no-results' : 'no-artworks',
  className = ''
}: ArtworkGalleryProps) {
  const { handlePurchase, handleView, handleShare, handleFavorite } = useArtworkActions({
    onPurchase,
    onView,
    onShare,
    onFavorite
  })

  // Show skeleton on initial load
  if (isLoading && artworks.length === 0) {
    return <LoadingCard count={loadingCount} variant="artwork" />
  }

  // Show empty state when no artworks
  if (!isLoading && artworks.length === 0) {
    return (
      <EmptyState
        type={emptyStateType}
        onClearFilters={onClearFilters}
      />
    )
  }

  const renderContent = () => {
    switch (variant) {
      case 'list':
        return (
          <div className="space-y-4">
            {artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                variant="compact"
                onPurchase={handlePurchase}
                onView={handleView}
                showPrice={showPrice}
                showCreator={showCreator}
              />
            ))}
          </div>
        )
      
      case 'masonry':
        return (
          <div className="columns-1 xs:columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="break-inside-avoid mb-4">
                <ArtworkCard
                  artwork={artwork}
                  variant="detailed"
                  onPurchase={handlePurchase}
                  onView={handleView}
                  showPrice={showPrice}
                  showCreator={showCreator}
                />
              </div>
            ))}
          </div>
        )
      
      default:
        return (
          <Grid 
            columns={columns} 
            gap="md" 
            responsive={!columns}
            className={className}
          >
            {artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                variant="default"
                onPurchase={handlePurchase}
                onView={handleView}
                showPrice={showPrice}
                showCreator={showCreator}
              />
            ))}
          </Grid>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
      
      {/* Loading indicator for infinite scroll */}
      {isFetchingNextPage && (
        <LoadingCard count={4} variant="artwork" />
      )}
      
      {/* Load more button */}
      {hasNextPage && !isFetchingNextPage && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            loading={isFetchingNextPage}
          >
            Load More
          </Button>
        </div>
      )}
      
      {/* End of results message */}
      {!hasNextPage && !isLoading && artworks.length > 0 && (
        <div className="text-center py-8 text-secondary-600 text-sm">
          You've reached the end of the collection
        </div>
      )}
    </div>
  )
}
