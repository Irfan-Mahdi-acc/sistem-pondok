// Helper functions for non-exam grading system

// Helper function to convert letter grade to numeric score (for rapor calculation)
export function letterGradeToScore(letterGrade: string): number {
  const gradeMap: Record<string, number> = {
    'A': 95,
    'B': 85,
    'C': 75,
    'D': 65,
    'E': 50,
  }
  return gradeMap[letterGrade] || 0
}

// Helper function to get grade color
export function getLetterGradeColor(grade: string | null): string {
  if (!grade) return ""
  switch (grade) {
    case 'A': return "text-green-600 dark:text-green-400 font-bold"
    case 'B': return "text-blue-600 dark:text-blue-400 font-bold"
    case 'C': return "text-yellow-600 dark:text-yellow-400 font-bold"
    case 'D': return "text-orange-600 dark:text-orange-400 font-bold"
    case 'E': return "text-red-600 dark:text-red-400 font-bold"
    default: return ""
  }
}
