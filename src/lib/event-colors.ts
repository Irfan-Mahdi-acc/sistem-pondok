// Color palette for unique event colors
export const EVENT_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
  '#06B6D4', // cyan
  '#A855F7', // violet
  '#EAB308', // yellow
  '#22C55E', // emerald
  '#0EA5E9', // sky
  '#D946EF', // fuchsia
  '#F43F5E', // rose
  '#64748B', // slate
  '#78716C', // stone
  '#737373', // neutral
]

// Generate unique color for event
export function generateEventColor(existingColors: string[]): string {
  // Find first unused color
  const availableColors = EVENT_COLORS.filter(c => !existingColors.includes(c))
  
  if (availableColors.length > 0) {
    return availableColors[0]
  }
  
  // If all colors used, cycle through
  return EVENT_COLORS[existingColors.length % EVENT_COLORS.length]
}

// Get random color from palette
export function getRandomEventColor(): string {
  return EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)]
}
