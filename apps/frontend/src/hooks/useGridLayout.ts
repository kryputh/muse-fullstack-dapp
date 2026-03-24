import { useMemo } from 'react'

export interface UseGridLayoutProps {
  itemCount: number
  minColumnWidth?: number
  maxColumns?: number
  gap?: number
  containerWidth?: number
}

export function useGridLayout({
  itemCount,
  minColumnWidth = 280,
  maxColumns = 4,
  gap = 16,
  containerWidth = 1200
}: UseGridLayoutProps) {
  const { columns, itemWidth } = useMemo(() => {
    // Calculate optimal columns based on container width and min item width
    const calculatedColumns = Math.min(
      Math.floor((containerWidth + gap) / (minColumnWidth + gap)),
      maxColumns
    )
    
    // Ensure at least 1 column
    const finalColumns = Math.max(1, calculatedColumns)
    
    // Calculate actual item width
    const totalGapWidth = (finalColumns - 1) * gap
    const actualItemWidth = (containerWidth - totalGapWidth) / finalColumns
    
    return {
      columns: finalColumns,
      itemWidth: actualItemWidth
    }
  }, [containerWidth, gap, maxColumns, minColumnWidth])

  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: `${gap}px`
  }), [columns, gap])

  return {
    columns,
    itemWidth,
    gridStyle
  }
}
