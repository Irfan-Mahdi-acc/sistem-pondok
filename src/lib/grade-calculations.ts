/**
 * Grade calculation utilities with weighted average support
 */

interface GradeWeight {
  examType: string
  weight: number
  isActive: boolean
}

interface GradeWithType {
  score: number
  examType: string
  ujian?: { type: string }
}

/**
 * Calculate weighted average for a set of grades
 * @param grades Array of grades with scores and exam types
 * @param weights Grade weight configuration
 * @returns Weighted average score
 */
export function calculateWeightedAverage(
  grades: GradeWithType[],
  weights: GradeWeight[]
): number {
  if (grades.length === 0) return 0

  const activeWeights = weights.filter(w => w.isActive)
  let totalWeightedScore = 0
  let totalWeight = 0

  grades.forEach(grade => {
    // Get exam type from grade or ujian
    const examType = grade.examType || grade.ujian?.type || 'HARIAN'
    
    // Find weight config for this exam type
    const weightConfig = activeWeights.find(w => w.examType === examType)
    const weight = weightConfig?.weight || 1.0

    totalWeightedScore += grade.score * weight
    totalWeight += weight
  })

  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
}

/**
 * Calculate simple average (no weights)
 * @param scores Array of score numbers
 * @returns Simple average
 */
export function calculateSimpleAverage(scores: number[]): number {
  if (scores.length === 0) return 0
  const sum = scores.reduce((acc, score) => acc + score, 0)
  return sum / scores.length
}

/**
 * Get predicate from score (A, B, C, D, E)
 * @param score Score value (1-10 scale)
 * @returns Predicate letter
 */
export function getGradePredicate(score: number): string {
  if (score >= 9) return 'A'
  if (score >= 8) return 'B'
  if (score >= 7) return 'C'
  if (score >= 6) return 'D'
  return 'E'
}

/**
 * Get predicate description
 * @param predicate Predicate letter
 * @returns Description text
 */
export function getPredicateDescription(predicate: string): string {
  switch (predicate) {
    case 'A': return 'Sangat Baik'
    case 'B': return 'Baik'
    case 'C': return 'Cukup'
    case 'D': return 'Kurang'
    case 'E': return 'Sangat Kurang'
    default: return '-'
  }
}

/**
 * Calculate class average
 * @param studentAverages Array of student average scores
 * @returns Class average
 */
export function calculateClassAverage(studentAverages: number[]): number {
  if (studentAverages.length === 0) return 0
  const sum = studentAverages.reduce((acc, avg) => acc + avg, 0)
  return sum / studentAverages.length
}

/**
 * Calculate standard deviation
 * @param values Array of numbers
 * @returns Standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  
  const average = calculateSimpleAverage(values)
  const variance = values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / values.length
  
  return Math.sqrt(variance)
}

/**
 * Group grades by mapel and calculate averages
 * @param nilaiData All grade data
 * @param weights Grade weight configuration
 * @returns Grouped data with averages
 */
export function groupByMapelWithWeights(
  nilaiData: any[],
  weights: GradeWeight[]
): Record<string, { grades: any[]; average: number; predicate: string }> {
  const grouped: Record<string, any[]> = {}

  // Group by mapel
  nilaiData.forEach(nilai => {
    const mapelName = nilai.mapel?.name || 'Unknown'
    if (!grouped[mapelName]) {
      grouped[mapelName] = []
    }
    grouped[mapelName].push(nilai)
  })

  // Calculate weighted average for each mapel
  const result: Record<string, { grades: any[]; average: number; predicate: string }> = {}
  
  Object.entries(grouped).forEach(([mapelName, grades]) => {
    const validGrades = grades.filter(g => g.score !== null && g.score !== undefined)
    
    if (validGrades.length > 0) {
      const average = calculateWeightedAverage(
        validGrades.map(g => ({
          score: g.score,
          examType: g.ujian?.type || 'HARIAN',
          ujian: g.ujian
        })),
        weights
      )

      result[mapelName] = {
        grades: validGrades,
        average,
        predicate: getGradePredicate(average)
      }
    }
  })

  return result
}

/**
 * Calculate student ranking based on weighted averages
 * @param students Array of students
 * @param nilaiData All grade data
 * @param weights Grade weight configuration
 * @returns Students with ranking
 */
export function calculateRankingWithWeights(
  students: any[],
  nilaiData: any[],
  weights: GradeWeight[]
): Array<{ student: any; average: number; predicate: string; ranking: number }> {
  // Calculate average for each student
  const studentsWithAverages = students.map(student => {
    const studentNilai = nilaiData.filter(n => 
      n.santriId === student.id && 
      (n.category === 'UJIAN' || n.category === 'TUGAS')
    )

    const validGrades = studentNilai.filter(n => n.score !== null && n.score !== undefined)

    const average = validGrades.length > 0
      ? calculateWeightedAverage(
          validGrades.map(g => ({
            score: g.score,
            examType: g.ujian?.type || 'HARIAN',
            ujian: g.ujian
          })),
          weights
        )
      : 0

    return {
      student,
      average,
      predicate: getGradePredicate(average)
    }
  })

  // Sort by average (descending) and assign ranking
  const sorted = studentsWithAverages.sort((a, b) => b.average - a.average)
  
  return sorted.map((item, index) => ({
    ...item,
    ranking: index + 1
  }))
}

/**
 * Format number to specified decimal places
 * @param num Number to format
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export function formatNumber(num: number | null | undefined, decimals: number = 2): string {
  if (num === null || num === undefined || isNaN(num)) return '-'
  return num.toFixed(decimals)
}

/**
 * Calculate percentage
 * @param part Part value
 * @param total Total value
 * @returns Percentage string with % symbol
 */
export function calculatePercentage(part: number, total: number): string {
  if (total === 0) return '0.0%'
  return `${((part / total) * 100).toFixed(1)}%`
}






