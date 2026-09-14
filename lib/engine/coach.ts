/**
 * Carbon Coach Service Abstraction for offset.io
 * Provides structured carbon intelligence using Groq API (e.g. groq/compound, openai/gpt-oss-120b)
 * with graceful fallback to deterministic local rules.
 */

import { FootprintResult } from './calculator';
import { UncertaintyAssessment } from './uncertainty';

export interface CoachContext {
  userName: string;
  footprint: FootprintResult;
  uncertainty: UncertaintyAssessment;
  targetAnnualKg: number;
  scenariosCount: number;
  recentAnomalyCount: number;
}

export interface CoachResponse {
  answer: string;
  keyInsights: string[];
  suggestedAction?: string;
  source: 'LOCAL_DETERMINISTIC' | 'GROQ_AI';
}

type CoachMode = 'local' | 'groq';

function getCoachMode(): CoachMode {
  const mode = process.env.COACH_MODE?.toLowerCase();
  if (mode === 'groq') return 'groq';
  return 'local';
}

function getGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.trim() === '') return null;
  return key;
}

const GROQ_MODELS = ['groq/compound', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b'];

export class CarbonCoachService {
  /**
   * Main query responder for the Carbon Coach.
   */
  public async answerQuestion(query: string, context: CoachContext): Promise<CoachResponse> {
    const mode = getCoachMode();
    
    // Only call Groq if explicitly configured
    if (mode === 'groq') {
      const apiKey = getGroqApiKey();
      if (apiKey) {
        try {
          const groqResult = await this.callGroqApi(query, context, apiKey);
          if (groqResult) {
            return groqResult;
          }
        } catch (err) {
          console.warn('Groq API call failed, falling back to local deterministic coach:', err);
        }
      } else {
        console.warn('COACH_MODE=groq but GROQ_API_KEY not set, falling back to local coach');
      }
    }

    // 2. Deterministic Fallback Implementation
    return this.answerDeterministic(query, context);
  }

  private async callGroqApi(query: string, context: CoachContext, apiKey: string): Promise<CoachResponse | null> {
    const systemPrompt = `You are the expert Carbon Intelligence Coach for offset.io.
    The user is asking: "${query}".

    Empirical User Carbon Profile:
    - User Name: ${context.userName}
    - Total Estimated Footprint: ${context.footprint.totalAnnualEmissionsTonnes} t CO2e/year (${context.footprint.totalAnnualEmissionsKg} kg CO2e)
    - Monthly Average: ${context.footprint.totalMonthlyEmissionsKg} kg CO2e/month
    - Daily Average: ${context.footprint.totalDailyEmissionsKg} kg CO2e/day
    - Largest Emission Category: ${context.footprint.largestCategory}
    - Confidence Level: ${context.uncertainty.overallConfidence} (${context.uncertainty.confidenceScorePct}% confidence score)
    - Confidence Range: ${context.uncertainty.minAnnualTonnes} – ${context.uncertainty.maxAnnualTonnes} t CO2e/year
    - Carbon Target Budget: ${(context.targetAnnualKg / 1000).toFixed(2)} t CO2e/year (${context.targetAnnualKg} kg)
    - Saved Scenarios Count: ${context.scenariosCount}
    - Recent Statistical Anomalies: ${context.recentAnomalyCount}

    Strict Rules:
    1. Base all numerical statements directly on the user's actual empirical data above. NEVER invent or hallucinate carbon metrics.
    2. Provide a helpful, clear, professional answer (2-4 paragraphs).
    3. Return valid JSON only with the following keys:
       - "answer": string (main text response)
       - "keyInsights": string[] (3 concise bullet point data takeaways)
       - "suggestedAction": string (one clear next step recommendation)
    `;

    for (const model of GROQ_MODELS) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: query },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 800,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Groq model ${model} error: ${response.status}`, errText);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            answer: parsed.answer || 'Analysis complete.',
            keyInsights: parsed.keyInsights || [
              `Annual Footprint: ${context.footprint.totalAnnualEmissionsTonnes} t CO2e`,
              `Largest Category: ${context.footprint.largestCategory}`,
            ],
            suggestedAction: parsed.suggestedAction || 'Review your reduction plan optimizer.',
            source: 'GROQ_AI',
          };
        }
      } catch (e) {
        console.warn(`Attempt with Groq model ${model} failed:`, e);
      }
    }

    return null;
  }

  private answerDeterministic(query: string, context: CoachContext): CoachResponse {
    const qLower = query.toLowerCase();

    if (qLower.includes('why') || qLower.includes('high') || qLower.includes('biggest source') || qLower.includes('largest')) {
      const largest = context.footprint.largestCategory;
      const largestData = context.footprint.categoryBreakdown[largest];
      const pct = largestData ? largestData.percentage.toFixed(1) : '0';

      return {
        answer: `Hi ${context.userName}, your estimated annual carbon footprint is ${context.footprint.totalAnnualEmissionsTonnes} t CO2e/year (${context.uncertainty.overallConfidence} confidence range: ${context.uncertainty.minAnnualTonnes}–${context.uncertainty.maxAnnualTonnes} t). Your single largest emission driver is **${largest}**, accounting for **${pct}%** (${largestData?.annualEmissionsKg.toFixed(0)} kg CO2e/year) of your overall footprint.`,
        keyInsights: [
          `Largest category: ${largest} (${pct}% of total footprint)`,
          `Confidence level: ${context.uncertainty.overallConfidence} (${context.uncertainty.confidenceScorePct}% score)`,
          `Annual Total: ${context.footprint.totalAnnualEmissionsKg} kg CO2e`,
        ],
        suggestedAction: `Focus your reduction efforts on ${largest.toLowerCase()} to get the highest ROI on your efforts.`,
        source: 'LOCAL_DETERMINISTIC',
      };
    }

    if (qLower.includes('target') || qLower.includes('reach') || qLower.includes('reduce') || qLower.includes('budget')) {
      const gap = context.footprint.totalAnnualEmissionsKg - context.targetAnnualKg;
      const gapTonnes = (gap / 1000).toFixed(2);
      const isOver = gap > 0;

      if (!isOver) {
        return {
          answer: `Great news ${context.userName}! Your current estimated footprint of ${context.footprint.totalAnnualEmissionsTonnes} t CO2e is already below your annual target of ${(context.targetAnnualKg / 1000).toFixed(2)} t CO2e. You are on track to meet your sustainability goals.`,
          keyInsights: [
            `Current Footprint: ${context.footprint.totalAnnualEmissionsTonnes} t CO2e`,
            `Target Budget: ${(context.targetAnnualKg / 1000).toFixed(2)} t CO2e`,
            `Margin: ${Math.abs(gap).toFixed(0)} kg CO2e under target`,
          ],
          suggestedAction: 'Consider lowering your annual target by another 10% to push for net-zero living!',
          source: 'LOCAL_DETERMINISTIC',
        };
      }

      return {
        answer: `To hit your target budget of ${(context.targetAnnualKg / 1000).toFixed(2)} t CO2e/year, you need to reduce your current footprint by **${gap.toFixed(0)} kg CO2e (${gapTonnes} t)** per year (a ${((gap / context.footprint.totalAnnualEmissionsKg) * 100).toFixed(1)}% reduction). Using our Reduction Plan Optimizer, you can achieve this by reducing vehicle travel, switching to renewable electricity, or adopting a plant-forward diet.`,
        keyInsights: [
          `Target Gap: ${gap.toFixed(0)} kg CO2e (${gapTonnes} t/yr)`,
          `Target Budget: ${(context.targetAnnualKg / 1000).toFixed(2)} t CO2e`,
          `Current Footprint: ${context.footprint.totalAnnualEmissionsTonnes} t CO2e`,
        ],
        suggestedAction: 'Open the "Build My Reduction Plan" optimizer tool to generate a budget-friendly reduction strategy.',
        source: 'LOCAL_DETERMINISTIC',
      };
    }

    return {
      answer: `Hello ${context.userName}! I am your Carbon Intelligence Coach. Your current estimated annual footprint is **${context.footprint.totalAnnualEmissionsTonnes} t CO2e/year** with **${context.uncertainty.overallConfidence} confidence**. Your largest category is **${context.footprint.largestCategory}**. Feel free to ask me how to reduce emissions, evaluate scenarios, or reach your carbon target!`,
      keyInsights: [
        `Annual Footprint: ${context.footprint.totalAnnualEmissionsTonnes} t CO2e`,
        `Daily Average: ${context.footprint.totalDailyEmissionsKg} kg CO2e/day`,
        `Confidence Level: ${context.uncertainty.overallConfidence}`,
      ],
      suggestedAction: 'Try asking: "Why is my footprint high?" or "How can I reach my carbon target?"',
      source: 'LOCAL_DETERMINISTIC',
    };
  }
}

export const carbonCoachService = new CarbonCoachService();
