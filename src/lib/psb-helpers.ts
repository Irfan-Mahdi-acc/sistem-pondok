// Helper functions for PSB
export function calculateTotalFee(feeDetails: Record<string, number> | null | undefined): number {
  if (!feeDetails) return 0
  return Object.values(feeDetails).reduce((sum, amount) => sum + amount, 0)
}
