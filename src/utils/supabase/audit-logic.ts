/**
 * CREDEX Audit Logic
 * Calculates potential savings based on user input.
 */
export function calculateSavings(currentSpend: number, industry: 'tech' | 'retail' | 'health') {
  const rates = {
    tech: 0.15,   // 15% savings
    retail: 0.08, // 8% savings
    health: 0.12  // 12% savings
  };

  const potentialSavings = currentSpend * rates[industry];
  return {
    monthly: potentialSavings,
    annual: potentialSavings * 12,
    efficiencyScore: (potentialSavings / currentSpend) * 100
  };
}
