import type { FootprintResult } from '@/lib/engine/calculator';
import { generateRecommendations, type RecommendationAction } from '@/lib/engine/recommendation';

/** The sole runtime source for recommendations; persisted rows are not displayed as live advice. */
export class RecommendationService {
  generateCurrent(footprint: FootprintResult, monthlyBudget: number): RecommendationAction[] {
    return generateRecommendations({ footprint, monthlyBudget });
  }
}

export const recommendationService = new RecommendationService();
