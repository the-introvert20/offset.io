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
  mode: CoachMode;
  fallbackNotice?: string;
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

// Active Groq production model
const GROQ_MODELS = ['openai/gpt-oss-120b'];

export class CarbonCoachService {
  /**
   * Main query responder for the Carbon Coach.
   */
  public async answerQuestion(query: string, context: CoachContext): Promise<CoachResponse> {
    const mode = getCoachMode();
    let fallbackNotice: string | undefined;

    // Only call Groq if explicitly configured
    if (mode === 'groq') {
      const apiKey = getGroqApiKey();
      if (apiKey) {
        try {
          const groqResult = await this.callGroqApi(query, context, apiKey);
          if (groqResult) {
            return { ...groqResult, mode: 'groq' };
          }
          fallbackNotice = 'Groq API returned an empty or invalid response. Answered using local deterministic rules.';
        } catch (err) {
          console.warn('Groq API call failed, falling back to local deterministic coach:', err);
          fallbackNotice = 'Groq API request failed. Answered using local deterministic rules.';
        }
      } else {
        console.warn('COACH_MODE=groq but GROQ_API_KEY not set, falling back to local coach');
        fallbackNotice = 'GROQ_API_KEY is missing in environment. Answered using local deterministic rules.';
      }
    }

    // 2. Deterministic Fallback Implementation
    const localResult = this.answerDeterministic(query, context);
    return {
      ...localResult,
      mode,
      fallbackNotice,
    };
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
            mode: 'groq',
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
    const { footprint, uncertainty, targetAnnualKg, userName, scenariosCount, recentAnomalyCount } = context;
    const gap = footprint.totalAnnualEmissionsKg - targetAnnualKg;
    const gapTonnes = (gap / 1000).toFixed(2);
    const largest = footprint.largestCategory;
    const largestData = footprint.categoryBreakdown[largest];
    const pct = largestData ? largestData.percentage.toFixed(1) : '0';

    // Largest source / why high
    if (qLower.includes('why') || qLower.includes('high') || qLower.includes('biggest') || qLower.includes('largest') || qLower.includes('source')) {
      return {
        answer: `Your largest emission driver is **${largest}**, accounting for **${pct}%** (${largestData?.annualEmissionsKg.toFixed(0)} kg CO2e/year) of your ${footprint.totalAnnualEmissionsTonnes} t CO2e annual total. That single category has more leverage than anything else you can change right now.`,
        keyInsights: [
          `Largest category: ${largest} at ${pct}% of total`,
          `Annual total: ${footprint.totalAnnualEmissionsTonnes} t CO2e (${uncertainty.overallConfidence} confidence)`,
          `Confidence range: ${uncertainty.minAnnualTonnes}–${uncertainty.maxAnnualTonnes} t CO2e/yr`,
        ],
        suggestedAction: `Open the Reduction Plan and focus cuts on ${largest.toLowerCase()} first for the highest ROI.`,
        source: 'LOCAL_DETERMINISTIC',
        mode: 'local',
      };
    }

    // Target / budget / how far over
    if (qLower.includes('target') || qLower.includes('reach') || qLower.includes('budget') || qLower.includes('over') || qLower.includes('far')) {
      if (gap <= 0) {
        return {
          answer: `Good news, ${userName} — your estimated footprint of ${footprint.totalAnnualEmissionsTonnes} t CO2e is already **${Math.abs(gap).toFixed(0)} kg below** your ${(targetAnnualKg / 1000).toFixed(2)} t target. You're on track; consider tightening your target by 10% to keep pushing.`,
          keyInsights: [
            `Current: ${footprint.totalAnnualEmissionsTonnes} t CO2e`,
            `Target: ${(targetAnnualKg / 1000).toFixed(2)} t CO2e`,
            `Buffer: ${Math.abs(gap).toFixed(0)} kg under target`,
          ],
          suggestedAction: 'Lower your annual target by 10% in the Goals page to maintain momentum.',
          source: 'LOCAL_DETERMINISTIC',
          mode: 'local',
        };
      }
      return {
        answer: `You need to cut **${gap.toFixed(0)} kg CO2e (${gapTonnes} t) per year** — a ${((gap / footprint.totalAnnualEmissionsKg) * 100).toFixed(1)}% reduction — to hit your ${(targetAnnualKg / 1000).toFixed(2)} t target. The biggest wins are in ${largest.toLowerCase()}, which alone is ${pct}% of your total.`,
        keyInsights: [
          `Gap to target: ${gap.toFixed(0)} kg CO2e (${gapTonnes} t/yr)`,
          `Current: ${footprint.totalAnnualEmissionsTonnes} t CO2e`,
          `Target: ${(targetAnnualKg / 1000).toFixed(2)} t CO2e`,
        ],
        suggestedAction: 'Use the Reduction Plan Optimizer to find the cheapest path to your target.',
        source: 'LOCAL_DETERMINISTIC',
        mode: 'local',
      };
    }

    // What to reduce first / priority
    if (qLower.includes('first') || qLower.includes('reduce') || qLower.includes('start') || qLower.includes('priority') || qLower.includes('should')) {
      const sorted = Object.entries(footprint.categoryBreakdown)
        .sort(([, a], [, b]) => b.annualEmissionsKg - a.annualEmissionsKg)
        .slice(0, 3);
      const [top, second, third] = sorted;
      return {
        answer: `Start with **${top[0]}** (${top[1].percentage.toFixed(1)}% of your footprint). Then tackle ${second?.[0] ?? ''} (${second?.[1]?.percentage.toFixed(1) ?? 0}%) and ${third?.[0] ?? ''} (${third?.[1]?.percentage.toFixed(1) ?? 0}%). Together those three categories account for the bulk of your ${footprint.totalAnnualEmissionsTonnes} t total.`,
        keyInsights: [
          `#1 priority: ${top[0]} — ${top[1].annualEmissionsKg.toFixed(0)} kg CO2e/yr`,
          `#2 priority: ${second?.[0]} — ${second?.[1]?.annualEmissionsKg.toFixed(0)} kg CO2e/yr`,
          `#3 priority: ${third?.[0]} — ${third?.[1]?.annualEmissionsKg.toFixed(0)} kg CO2e/yr`,
        ],
        suggestedAction: `Log your ${top[0].toLowerCase()} activities in the Diary to track progress week by week.`,
        source: 'LOCAL_DETERMINISTIC',
        mode: 'local',
      };
    }

    // Daily / monthly / average
    if (qLower.includes('daily') || qLower.includes('day') || qLower.includes('monthly') || qLower.includes('month') || qLower.includes('average')) {
      return {
        answer: `Your estimated daily average is **${footprint.totalDailyEmissionsKg} kg CO2e/day** (${footprint.totalMonthlyEmissionsKg} kg/month, ${footprint.totalAnnualEmissionsTonnes} t/year). The global average for net-zero by 2050 is roughly 2.5 kg/day — compare that to your number to gauge where you stand.`,
        keyInsights: [
          `Daily: ${footprint.totalDailyEmissionsKg} kg CO2e`,
          `Monthly: ${footprint.totalMonthlyEmissionsKg} kg CO2e`,
          `Annual: ${footprint.totalAnnualEmissionsTonnes} t CO2e`,
        ],
        suggestedAction: 'Use the Diary to log today\'s activities and watch your daily number move in real time.',
        source: 'LOCAL_DETERMINISTIC',
        mode: 'local',
      };
    }

    // Confidence / accuracy / uncertainty
    if (qLower.includes('confiden') || qLower.includes('accurate') || qLower.includes('certain') || qLower.includes('sure') || qLower.includes('range')) {
      return {
        answer: `Your footprint estimate has **${uncertainty.overallConfidence} confidence** (score: ${uncertainty.confidenceScorePct}%). The plausible range is **${uncertainty.minAnnualTonnes}–${uncertainty.maxAnnualTonnes} t CO2e/year** around a central estimate of ${footprint.totalAnnualEmissionsTonnes} t. Adding more diary entries narrows this range.`,
        keyInsights: [
          `Confidence: ${uncertainty.overallConfidence} (${uncertainty.confidenceScorePct}%)`,
          `Low estimate: ${uncertainty.minAnnualTonnes} t CO2e/yr`,
          `High estimate: ${uncertainty.maxAnnualTonnes} t CO2e/yr`,
        ],
        suggestedAction: 'Log more diary entries to tighten your confidence range.',
        source: 'LOCAL_DETERMINISTIC',
        mode: 'local',
      };
    }

    // Scenarios
    if (qLower.includes('scenario') || qLower.includes('what if') || qLower.includes('simulate')) {
      return {
        answer: `You have **${scenariosCount} saved scenario${scenariosCount !== 1 ? 's' : ''}**. Scenarios let you model "what if" changes — like switching to an EV or going vegan — and see the exact kg CO2e impact before you commit. ${scenariosCount === 0 ? "You haven't built any yet — it only takes a minute." : 'Check them in the Scenarios page to compare options.'}`,
        keyInsights: [
          `Saved scenarios: ${scenariosCount}`,
          `Current footprint: ${footprint.totalAnnualEmissionsTonnes} t CO2e/yr`,
          `Gap to target: ${gap > 0 ? `${gapTonnes} t to cut` : 'already on target'}`,
        ],
        suggestedAction: 'Open the Scenarios page and model your most impactful lifestyle change.',
        source: 'LOCAL_DETERMINISTIC',
        mode: 'local',
      };
    }

    // Anomalies / spikes
    if (qLower.includes('anomal') || qLower.includes('spike') || qLower.includes('unusual') || qLower.includes('weird')) {
      return {
        answer: recentAnomalyCount > 0
          ? `Your diary shows **${recentAnomalyCount} statistical anomal${recentAnomalyCount !== 1 ? 'ies' : 'y'}** in recent entries — days where your emissions were unusually high compared to your baseline. These are worth reviewing in the Insights page.`
          : `No statistical anomalies detected in your recent diary entries — your emissions look consistent with your usual patterns.`,
        keyInsights: [
          `Anomalies detected: ${recentAnomalyCount}`,
          `Annual average: ${footprint.totalDailyEmissionsKg} kg CO2e/day`,
          `Largest category: ${largest} (${pct}%)`,
        ],
        suggestedAction: recentAnomalyCount > 0 ? 'Visit Insights to review the flagged diary entries.' : 'Keep logging consistently to maintain clean anomaly detection.',
        source: 'LOCAL_DETERMINISTIC',
        mode: 'local',
      };
    }

    // Generic fallback — summarises the full profile, never repeats verbatim
    const overOrUnder = gap > 0
      ? `${gapTonnes} t over your ${(targetAnnualKg / 1000).toFixed(2)} t target`
      : `${Math.abs(gap / 1000).toFixed(2)} t under your ${(targetAnnualKg / 1000).toFixed(2)} t target`;
    return {
      answer: `Here's a snapshot for ${userName}: your estimated annual footprint is **${footprint.totalAnnualEmissionsTonnes} t CO2e** (${footprint.totalDailyEmissionsKg} kg/day), with **${uncertainty.overallConfidence} confidence** (range: ${uncertainty.minAnnualTonnes}–${uncertainty.maxAnnualTonnes} t). You're currently **${overOrUnder}**. Your biggest category is **${largest}** at ${pct}%. Try asking me something more specific — about a category, your target gap, daily averages, or your scenarios.`,
      keyInsights: [
        `Annual footprint: ${footprint.totalAnnualEmissionsTonnes} t CO2e (${uncertainty.overallConfidence} confidence)`,
        `Largest source: ${largest} — ${pct}% of total`,
        `vs. target: ${gap > 0 ? `${gapTonnes} t to cut` : 'on target ✓'}`,
      ],
      suggestedAction: 'Ask: "What should I reduce first?" or "How far am I over target?"',
      source: 'LOCAL_DETERMINISTIC',
      mode: 'local',
    };
  }
}

export const carbonCoachService = new CarbonCoachService();
